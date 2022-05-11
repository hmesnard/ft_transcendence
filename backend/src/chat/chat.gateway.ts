import { Logger } from '@nestjs/common';
import { OnGatewayConnection, OnGatewayDisconnect, OnGatewayInit, SubscribeMessage, WebSocketGateway, WebSocketServer, WsException } from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';
import { ChatService } from './chat.service';

@WebSocketGateway({cors: {origin: '*'}})
export class ChatGateway implements OnGatewayInit, OnGatewayConnection, OnGatewayDisconnect {
  constructor(
    private chatService: ChatService
  ) {}

  @WebSocketServer() wss: Server;

  private logger: Logger = new Logger('ChatGateway');
  
  afterInit(server: Server) {
    this.logger.log('Initialized !');
  }
  
  handleConnection(client: Socket, ...args: any[]) {
    this.logger.log(`client connected:    ${client.id}`);
    this.chatService.getUserFromSocket(client);
  }
  
  handleDisconnect(client: Socket) {
    this.logger.log(`client disconnected: ${client.id}`);
  }
  
  @SubscribeMessage('msgToServer')
  async handleMessage(client: Socket, payload: { room: string, content: string }) {
    const user = await this.chatService.getUserFromSocket(client);
    const chat = await this.chatService.getChatById(+payload.room);
    if (!this.chatService.clientIsMember(user, chat)) {
      throw new WsException('Client is not member of this chat');
    }

    const message = await this.chatService.saveMessage(payload.content, user, chat);
    this.wss.to(payload.room).emit('msgToClient', message);
  }

  @SubscribeMessage('joinRoom')
  async joinRoom(client: Socket, room: string) {
    const user = await this.chatService.getUserFromSocket(client);
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
