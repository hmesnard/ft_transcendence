import { Logger } from '@nestjs/common';
import { ConnectedSocket, MessageBody, OnGatewayConnection, OnGatewayDisconnect, OnGatewayInit, SubscribeMessage, WebSocketGateway, WebSocketServer } from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';
import { AuthService } from './auth/auth.service';
import { Game, GameOptions, Invites, Paddle, Player } from './game/game.class';
import { MatchDto } from './match/dto/match.dto';
import { UserEntity } from './user/entities/user.entity';
import { UserService } from './user/user.service';
import axios from 'axios';
import { GameService } from './game/game.service';

// I dont have any idea if these functions work, I will check it when I can try this with frontend

@WebSocketGateway({ namespace: 'game', cors: { origin: `http://localhost:3000`, credentials: true }}) // ({namespace: 'chat', cors: { origin: `http://localhost:${FRONT_END_PORT}`, credentials: true } })
export class GameGateway implements OnGatewayInit, OnGatewayConnection, OnGatewayDisconnect
{
  constructor(private authService: AuthService,
    private userService: UserService,
    private gameService: GameService) {}

  @WebSocketServer() wss: Server;

  private gameId = 0;
  private queue: UserEntity[] = [];
  private invites: Invites[] = [];
  private games: Game[] = [];
  
  private readonly defaultGameOptions: GameOptions = {
    paddleSize: 2,
    paddleSpeed: 10,
    ballSpeed: 10
  };

  private logger: Logger = new Logger('GameGateway');

  afterInit(server: Server)
  {
    this.logger.log('Initialized !');  
  }

  async handleConnection(@ConnectedSocket() client: Socket)
  {
    try
    {
      const user = await this.authService.getUserFromSocket(client);
      await this.userService.updateUserSocketId(client.id, user);
      this.logger.log(`client connected:    ${client.id}`);
    }
    catch (e) { this.error(client, e, true); }
  }

  async handleDisconnect(@ConnectedSocket() client: Socket)
  {
    try
    {
      const user = await this.authService.getUserFromSocket(client);
      await this.userService.updateUserSocketId(null, user);
      this.logger.log(`client disconnected: ${client.id}`);
      const queueIndex = this.queue.indexOf(user);
      if (queueIndex !== -1)
        this.queue.splice(queueIndex, 1);
      client.disconnect();
    }
    catch (e) { this.error(client, e, true); }
  }

  @SubscribeMessage('addInvite')
  async invitePlayer(@ConnectedSocket() client: Socket, @MessageBody() id: number)
  {
    const user = await this.authService.getUserFromSocket(client);
    const invitedUser = await this.userService.getUserById_2(id);
    this.invites.push({
      sender: user,
      invitedUser
    });
    const socket = this.wss.sockets.sockets.get(invitedUser.socketId);
    socket.emit('addInvite', 'You have been invited to game');
  }

  @SubscribeMessage('acceptInvite')
  async acceptInvite(@ConnectedSocket() client: Socket, sender: UserEntity)
  {
    const invitedUser = await this.authService.getUserFromSocket(client);
    const index = this.invites.indexOf({sender, invitedUser});
    if (index === -1)
    {
      client.emit('acceptInvite', 'Invite doesnt exists');
      return ;
    }
    this.invites.slice(index, 1);
    const player1: Player = { player: sender };
    const player2: Player = { player: invitedUser };
    this.startGame(player1, player2);
  }

  @SubscribeMessage('leaveGame')
  async leaveGame(@ConnectedSocket() client: Socket, @MessageBody() room: string)
  {
    const game = this.games.find(e => e.name === room)
    this.endGame(game);
  }

  @SubscribeMessage('JoinQueue')
  async joinQueue(@ConnectedSocket() client: Socket)
  {
    const user = await this.authService.getUserFromSocket(client);
    this.queue.push(user);
    while (this.queue.length >= 2)
    {
      const player1: Player = { player: this.queue.shift() };
      const player2: Player = { player: this.queue.shift() };
      this.startGame(player1, player2);
    }
  }

  @SubscribeMessage('leaveQueue')
  async leaveQueue(@ConnectedSocket() client: Socket)
  {
    const user = await this.authService.getUserFromSocket(client);
    this.queue.filter(player => player.id !== user.id);
    this.wss.emit('leaveQueue', user);
  }

  @SubscribeMessage('addSpectator')
  async addSpectator(@ConnectedSocket() client: Socket, @MessageBody() room: string)
  {
    const user = await this.authService.getUserFromSocket(client);
    client.join(room);
    this.wss.to(room).emit('newSpectator', user);
  }



  async endGame(game: Game)
  {
    const matchBody: MatchDto = {
      homePlayerId: game.players[0].player.id,
      awayPlayerId: game.players[1].player.id,
      winnerId: game.winner.player.id,
      homeScore: game.players[0].score,
      awayScore: game.players[1].score
    };
    await axios({
      url: `http://localhost:3001/match`,
      method: 'POST',
      data: matchBody
    });
    this.wss.to(game.name).socketsLeave(game.name);
  }

  addPlayersToGame(player1: UserEntity, player2: UserEntity, room: string)
  {
    const socket1 = this.wss.sockets.sockets.get(player1.socketId);
    const socket2 = this.wss.sockets.sockets.get(player2.socketId);
    socket1.join(room);
    socket2.join(room);
    this.wss.to(room).emit('gameStarts', `Game between ${player1.username} and ${player2.username} starts now`);
  }

  async startGame(player1: Player, player2: Player)
  {
    const room = `game_with_${player1.player.id}_${player2.player.id}`;
    this.addPlayersToGame(player1.player, player2.player, room);
    this.createGame(player1, player2, this.defaultGameOptions, room);
  }

  createGame(player1: Player, player2: Player, gameOptions: GameOptions, room: string)
  {
    player1 = this.gameService.initPlayer1(player1.player, gameOptions);
    player2 = this.gameService.initPlayer2(player2.player, gameOptions);
    const ball = this.gameService.initBall(gameOptions);
    const sounds = this.gameService.initSound();
    const game: Game = {
        id: this.gameId++,
        options: gameOptions,
        players: [player1, player2],
        finished: false,
        name: room,
        ball,
        sounds
    };
    this.games.push(game);
    
  }

//   async createGame(player1: Player, player2: Player, gameOptions: GameOptions, room: string)
//   {
//  //   player1 = this.initPlayer1(player1);
//   }

  private error(@ConnectedSocket() socket: Socket, error: object, disconnect: boolean = false)
  {
    socket.emit('Error', error);
    if (disconnect)
      socket.disconnect();
  }
}
