import { Logger, UnauthorizedException } from '@nestjs/common';
import { OnGatewayConnection, OnGatewayDisconnect, OnGatewayInit, SubscribeMessage, WebSocketGateway, WebSocketServer, WsException } from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';
import { AuthService } from './auth/auth.service';
import { ChatService } from './chat/chat.service';
import { UserService } from './user/user.service';

@WebSocketGateway({ cors: {origin: '*'} })
export class AppGateway implements OnGatewayInit, OnGatewayConnection, OnGatewayDisconnect {
  constructor(
    private authService: AuthService,
    private chatService: ChatService,
    private userService: UserService
  ) {}

  @WebSocketServer() wss: Server;

  private logger: Logger = new Logger('AppGateway');
  
  afterInit(server: Server) {
    this.logger.log('Initialized !');
  }
  
  async handleConnection(client: Socket, ...args: any[]) {
    try {
      const user = await this.authService.getUserFromSocket(client);
      this.userService.updateStatus(user.id, true);
      this.wss.emit('updateStatus', 'online');
      this.logger.log(`client connected:    ${client.id}`);
    } catch (e) {
      this.error(client, e, true);
    }
  }
  
  async handleDisconnect(client: Socket) {
    try {
      const user = await this.authService.getUserFromSocket(client);
      this.userService.updateStatus(user.id, false);
      this.wss.emit('updateStatus', 'offline');
      this.logger.log(`client disconnected: ${client.id}`);
      client.disconnect();
    } catch (e) {
      this.error(client, e, true);
    }
  }
  
  @SubscribeMessage('msgToServer')
  async handleMessage(client: Socket, payload: { room: string, content: string }) {
    try {
      const user = await this.authService.getUserFromSocket(client);
      const channel = await this.chatService.getChannelById(+payload.room);
      if (!this.chatService.clientIsMember(user, channel)) {
        throw new WsException('Client is not member of this chat');
      }

      const message = await this.chatService.saveMessage(payload.content, user, channel);
      this.wss.to(payload.room).emit('msgToClient', message);
    } catch (e) {
      this.error(client, e);
    }
  }

  @SubscribeMessage('joinRoom')
  async joinRoom(client: Socket, room: string) {
    try {
      const user = await this.authService.getUserFromSocket(client);
      const channel = await this.chatService.getChannelById(+room);
      if (!this.chatService.clientIsMember(user, channel)) {
        throw new WsException('Client is not member of this chat');
      }

      client.join(room);
    } catch (e) {
      this.error(client, e);
    }
  }

  @SubscribeMessage('leaveRoom')
  leaveRoom(client: Socket, room: string) {
    client.leave(room);
  }

  private error(socket: Socket, error: object, disconnect: boolean = false)
    {
      socket.emit('Error', error);
      if (disconnect)
        socket.disconnect();
    }
}
