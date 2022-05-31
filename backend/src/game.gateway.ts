import { Logger } from '@nestjs/common';
import { ConnectedSocket, MessageBody, OnGatewayConnection, OnGatewayDisconnect, OnGatewayInit, SubscribeMessage, WebSocketGateway, WebSocketServer, WsException } from '@nestjs/websockets';
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
    paddleSize: 4,
    paddleSpeed: 1,
    ballSpeed: 1
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
      // if player is on queue, remove that player from there
      this.queue.filter(player => player.id !== user.id);
      client.disconnect();
    }
    catch (e) { this.error(client, e, true); }
  }

  @SubscribeMessage('addInvite')
  async invitePlayer(@ConnectedSocket() client: Socket, @MessageBody() id: number)
  {
    const user = await this.authService.getUserFromSocket(client);
    const invitedUser = await this.userService.getUserById_2(id);
    // add invited user to invites
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
    // remove invited user from invites
    this.invites.slice(index, 1);
    const player1: Player = { player: sender };
    const player2: Player = { player: invitedUser };
    // start the game
    this.startGame(player1, player2);
  }

  @SubscribeMessage('leaveGame')
  async leaveGame(@ConnectedSocket() client: Socket, @MessageBody() room: string)
  {
    // find the game
    const game = this.games.find(e => e.name === room)
    // end game and leave
    this.endGame(game);
  }

  @SubscribeMessage('JoinQueue')
  async joinQueue(@ConnectedSocket() client: Socket)
  {
    const user = await this.authService.getUserFromSocket(client);
    // user joins to queue
    this.queue.push(user);
    // add players to game until there queue has only 0 or 1 users
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
    // user leaves from queue
    this.queue.filter(player => player.id !== user.id);
    this.wss.emit('leaveQueue', user);
  }

  @SubscribeMessage('addSpectator')
  async addSpectator(@ConnectedSocket() client: Socket, @MessageBody() room: string)
  {
    const user = await this.authService.getUserFromSocket(client);
    // user joins to game as a spectator
    client.join(room);
    this.wss.to(room).emit('newSpectator', user);
  }

  @SubscribeMessage('moveUp')
  async handleMoveUp(@ConnectedSocket() client: Socket)
  {
    const user = await this.authService.getUserFromSocket(client);
    let index;
    index = this.games.findIndex(e => e.players[0].player.id === user.id);
    if (index === -1)
    {
      index = this.games.findIndex(e => e.players[1].player.id === user.id);
      if (index === -1)
        throw new WsException('Game doesnt exists');
    }
    let player1 = this.games[index].players[0];
    let player2 = this.games[index].players[1];
    if (player1.player.id === user.id)
      this.gameService.movePlayerUp(player1);
    else
      this.gameService.movePlayerUp(player2);
  }

  @SubscribeMessage('moveDown')
  async handleMoveDown(@ConnectedSocket() client: Socket)
  {
    const user = await this.authService.getUserFromSocket(client);
    let index;
    index = this.games.findIndex(e => e.players[0].player.id === user.id);
    if (index === -1)
    {
      index = this.games.findIndex(e => e.players[1].player.id === user.id);
      if (index === -1)
        throw new WsException('Game doesnt exists');
    }
    let player1 = this.games[index].players[0];
    let player2 = this.games[index].players[1];
    if (player1.player.id === user.id)
      this.gameService.movePlayerDown(player1);
    else
      this.gameService.movePlayerDown(player2);
  }

  async endGame(game: Game)
  {
    // game loop is ended
    clearInterval(game.intervalId);
    const matchBody: MatchDto = {
      homePlayerId: game.players[0].player.id,
      awayPlayerId: game.players[1].player.id,
      winnerId: game.winner.player.id,
      homeScore: game.players[0].score,
      awayScore: game.players[1].score
    };
    // save game data with sending http request
    await axios({
      url: `http://localhost:3000/match`,
      method: 'POST',
      data: matchBody
    });
    // players leaves from gameroom and game has been deleted from game array
    this.wss.to(game.name).socketsLeave(game.name);
    this.games.filter(e => e.id !== game.id);
  }

  addPlayersToGame(player1: UserEntity, player2: UserEntity, room: string)
  {
    const socket1 = this.wss.sockets.sockets.get(player1.socketId);
    const socket2 = this.wss.sockets.sockets.get(player2.socketId);
    // players join to game room
    socket1.join(room);
    socket2.join(room);
    this.wss.to(room).emit('gameStarts', `Game between ${player1.username} and ${player2.username} starts now`);
  }

  startGame(player1: Player, player2: Player)
  {
    // adding players to game room and game will be created
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
    let game: Game = {
        id: this.gameId++,
        options: gameOptions,
        players: [player1, player2],
        finished: false,
        name: room,
        ball,
        sounds
    };
    this.games.push(game);
    // Wait 5 seconds to start the game
    let pause = true;
    setTimeout(() => {
      pause = false;
    }, 5000);
    // create game loop with 60fps
    game.intervalId = setInterval(async () => 
    {
      if (pause === false)
      {
        // check ball position and move ball
        game = this.gameService.checkBallPosition(game);
        if (game.sounds.score === true)
        {
          // 1 second pause if someone scored
          pause = true;
          setTimeout(() => {
            pause = false;
          }, 1000);
          if (game.finished === true)
            this.endGame(game);
        }
      }
      this.sendGameUpdate(game);
      game.sounds = this.gameService.initSound();
    }, 16);
  }

  sendGameUpdate(game: Game)
  {
    const gameUpdate = {
      player1: {
        user: game.players[0].player,
        x: game.players[0].x,
        y: game.players[0].y,
        score: game.players[0].score
      },
      player2: {
        user: game.players[1].player,
        x: game.players[1].x,
        y: game.players[1].y,
        score: game.players[1].score
      },
      ball: {
        x: game.ball.x,
        y: game.ball.y,
        size: game.ball.size
      },
      options: game.options,
      name: game.name,
      sounds: game.sounds
    };
    this.wss.to(game.name).emit('gameUpdate', gameUpdate);
  }

  private error(@ConnectedSocket() socket: Socket, error: object, disconnect: boolean = false)
  {
    socket.emit('Error', error);
    if (disconnect)
      socket.disconnect();
  }
}
