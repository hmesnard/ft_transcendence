import { Logger } from '@nestjs/common';
import { ConnectedSocket, MessageBody, OnGatewayConnection, OnGatewayDisconnect, OnGatewayInit, SubscribeMessage, WebSocketGateway, WebSocketServer } from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';
import { AuthService } from './auth/auth.service';
import { Game, Player } from './game/game.class';
import { MatchDto } from './match/dto/match.dto';
import { UserEntity } from './user/entities/user.entity';
import { UserService } from './user/user.service';
import axios from 'axios';

// All the emits are missing, I add them soon!

@WebSocketGateway({ namespace: 'game', cors: { origin: `http://localhost:3000`, credentials: true }}) // ({namespace: 'chat', cors: { origin: `http://localhost:${FRONT_END_PORT}`, credentials: true } })
export class GameGateway implements OnGatewayInit, OnGatewayConnection, OnGatewayDisconnect
{
  constructor(private authService: AuthService,
    private userService: UserService) {}

  @WebSocketServer() wss: Server;

  private queue: UserEntity[] = [];

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
      client.disconnect();
    }
    catch (e) { this.error(client, e, true); }
  }

  addPlayersToGame(player1: UserEntity, player2: UserEntity, room: string)
  {
    const socket1 = this.wss.sockets.sockets.get(player1.socketId);
    const socket2 = this.wss.sockets.sockets.get(player2.socketId);
    if (socket1 !== undefined)
      socket1.join(room);
    if (socket2 !== undefined)
      socket2.join(room);
  }

  // removePlayersFromGame(player1: UserEntity, player2: UserEntity, room: string)
  // {
  //   const socket1 = this.wss.sockets.sockets.get(player1.socketId);
  //   const socket2 = this.wss.sockets.sockets.get(player2.socketId);
  //   if (socket1 !== undefined)
  //     socket1.leave(room);
  //   if (socket2 !== undefined)
  //     socket2.leave(room);
  // }

  @SubscribeMessage('leaveGame')
  async leaveGame(@ConnectedSocket() client: Socket, @MessageBody() room: string)
  {
    // end game
    // left player loose and other player wins
    // other player leaves too
    client.leave(room);
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
  }

  async startGame(player1: Player, player2: Player)
  {
    const room = `game_with_${player1.player.id}_${player2.player.id}`;
    this.addPlayersToGame(player1.player, player2.player, room);
    // create game in gameService
  }

  @SubscribeMessage('addSpectator')
  async addSpectator(@ConnectedSocket() client: Socket, @MessageBody() room: string)
  {
    client.join(room);
  }

  leaveRoom(socket: Socket, room: string)
  {
    socket.leave(room);
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

  @SubscribeMessage('invite')
  async invitePlayer(@ConnectedSocket() client: Socket, @MessageBody() id: number)
  {
    // invite player
    // send emit to invited player
  }

  private error(@ConnectedSocket() socket: Socket, error: object, disconnect: boolean = false)
  {
    socket.emit('Error', error);
    if (disconnect)
      socket.disconnect();
  }
}
