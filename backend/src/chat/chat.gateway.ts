import { Logger } from '@nestjs/common';
import { OnGatewayConnection, OnGatewayDisconnect, OnGatewayInit, SubscribeMessage, WebSocketGateway, WebSocketServer } from '@nestjs/websockets';
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
  handleMessage(client: Socket, payload: { sender: string, room: string, message: string }) {
    this.wss.to(payload.room).emit('chatToClient', payload);
  }

  @SubscribeMessage('joinRoom')
  joinRoom(client: Socket, room: string) {
    client.join(room);
  }

  @SubscribeMessage('leaveRoom')
  leaveRoom(client: Socket, room: string) {
    client.leave(room);
  }
}
