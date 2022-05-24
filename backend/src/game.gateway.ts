import { Logger } from '@nestjs/common';
import { ConnectedSocket, OnGatewayConnection, OnGatewayDisconnect, OnGatewayInit, SubscribeMessage, WebSocketGateway, WebSocketServer } from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';
import { AuthService } from './auth/auth.service';
import { UserService } from './user/user.service';

@WebSocketGateway({ namespace: 'game', cors: { origin: `http://localhost:3000`, credentials: true }}) // ({namespace: 'chat', cors: { origin: `http://localhost:${FRONT_END_PORT}`, credentials: true } })
export class GameGateway implements OnGatewayInit, OnGatewayConnection, OnGatewayDisconnect
{
  constructor(private authService: AuthService,
    private userService: UserService) {}

  @WebSocketServer() wss: Server;

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

  

  joinRoom(client_1: Socket, client_2: Socket, room: string)
  {
    client_1.join(room);
    client_2.join(room);
  }

  leaveRoom(client_1: Socket, client_2: Socket, room: string)
  {
    client_1.leave(room);
    client_2.leave(room);
  }

  private error(@ConnectedSocket() socket: Socket, error: object, disconnect: boolean = false)
  {
    socket.emit('Error', error);
    if (disconnect)
      socket.disconnect();
  }
}
