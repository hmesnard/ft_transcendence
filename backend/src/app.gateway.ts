import { Logger } from '@nestjs/common';
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
    const user = await this.authService.getUserFromSocket(client);
    this.userService.updateStatus(user.id, true);
    this.wss.emit('updateStatus', 'online');
    this.logger.log(`client connected:    ${client.id}`);
  }
  
  async handleDisconnect(client: Socket) {
    const user = await this.authService.getUserFromSocket(client);
    this.userService.updateStatus(user.id, false);
    this.wss.emit('updateStatus', 'offline');
    this.logger.log(`client disconnected: ${client.id}`);
  }
  
  @SubscribeMessage('msgToServer')
  async handleMessage(client: Socket, payload: { room: string, content: string }) {
    const user = await this.authService.getUserFromSocket(client);
    const chat = await this.chatService.getChatById(+payload.room);
    if (!this.chatService.clientIsMember(user, chat)) {
      throw new WsException('Client is not member of this chat');
    }

    const message = await this.chatService.saveMessage(payload.content, user, chat);
    this.wss.to(payload.room).emit('msgToClient', message);
  }

  @SubscribeMessage('joinRoom')
  async joinRoom(client: Socket, room: string) {
    const user = await this.authService.getUserFromSocket(client);
    const chat = await this.chatService.getChatById(+room);
    if (!this.chatService.clientIsMember(user, chat)) {
      throw new WsException('Client is not member of this chat');
    }

    client.join(room);
  }

  @SubscribeMessage('leaveRoom')
  leaveRoom(client: Socket, room: string) {
    client.leave(room);
  }
}
