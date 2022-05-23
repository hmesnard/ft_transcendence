
import { Logger } from '@nestjs/common';
import { MessageBody, OnGatewayConnection, OnGatewayDisconnect, OnGatewayInit, SubscribeMessage, WebSocketGateway, WebSocketServer, WsException } from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';
import { AuthService } from './auth/auth.service';
import { CreateMessageToChatDto, SetPasswordDto } from './chat/dto/chat.dto';
import { ChatService } from './chat/service/chat.service';
import { ChatUtilsService } from './chat/service/chatUtils.service';
import { UserStatus } from './user/entities/user.entity';
import { UserService } from './user/user.service';

@WebSocketGateway({ cors: {origin: '*'} })
export class AppGateway implements OnGatewayInit, OnGatewayConnection, OnGatewayDisconnect {
  constructor(
    private authService: AuthService,
    private chatUtilService: ChatUtilsService,
    private userService: UserService,
    private chatService: ChatService,
  ) {}

  @WebSocketServer() wss: Server;

  private logger: Logger = new Logger('AppGateway');
  
  afterInit(server: Server) {
    this.logger.log('Initialized !');
  }

  async handleConnection(client: Socket, ...args: any[])
  {
    try {
      console.log(client.id);
      const user = await this.authService.getUserFromSocket(client);
      this.userService.updateStatus(user.id, UserStatus.online);
      this.wss.emit('updateStatus', 'online');
      await this.userService.updateUserSocketId(client.id, user);
      this.logger.log(`client connected:    ${client.id}`);
    } catch (e) {
      this.error(client, e, true);
    }
  }
  
  async handleDisconnect(client: Socket)
  {
    try {
      const user = await this.authService.getUserFromSocket(client);
      await this.userService.updateUserSocketId(null, user);
      this.userService.updateStatus(user.id, UserStatus.offline);
      this.wss.emit('updateStatus', 'offline');
      this.logger.log(`client disconnected: ${client.id}`);
      client.disconnect();
    } catch (e) {
      this.error(client, e, true);
    }
  }

  @SubscribeMessage('msgToServer')
  async handleMessage(client: Socket, @MessageBody() data: CreateMessageToChatDto)
  {
    try {
      const user = await this.authService.getUserFromSocket(client);
      const channel = await this.chatUtilService.getChannelByName(data.name);
      const message = await this.chatService.createMessageToChannel(data, user);
      for (const member of channel.members)
      {
        if (await this.userService.isblocked_true(user, member) === false)
        {
          // ---- test this if it works -----
          const socket = this.wss.sockets.sockets.get(member.socketId);
          socket.to(data.name).emit('msgToClient', message);

          // --- try these styles to get all connected sockets ---
          // const sockets = Array.from(this.wss.sockets.sockets).map(socket => socket[0]);
          // console.log(sockets);
          // const sockets2 = (await this.wss.fetchSockets()).map(socket => socket.id);
          // console.log(sockets2);

          // --- member owns this socket, I dont know how to get members socket with socketId ???? ---
          // socket.to(data.name).emit('msgToClient', message);
        }
      }
      // ---- this one sends message to all members in room, also to blocked ones ----
      // this.wss.to(data.name).emit('msgToClient', message);
    } catch (e) {
      this.error(client, e);
    }
  }

  @SubscribeMessage('joinRoom')
  async joinRoom(client: Socket, @MessageBody() channelData: SetPasswordDto)
  {
    try {
      const user = await this.authService.getUserFromSocket(client);
      await this.chatService.joinChannel(channelData, user);
      client.join(channelData.name);
    } catch (e) {
      this.error(client, e);
    }
  }

  @SubscribeMessage('leaveRoom')
  async leaveRoom(client: Socket, @MessageBody() room: string)
  {
    try {
      const user = await this.authService.getUserFromSocket(client);
      const channel = await this.chatUtilService.getChannelByName(room);
      await this.chatService.leaveChannel(channel.id, user);
      client.leave(room);
    } catch (e) {
      this.error(client, e);
    }

  }

  private error(socket: Socket, error: object, disconnect: boolean = false)
  {
    socket.emit('Error', error);
    if (disconnect)
      socket.disconnect();
  }
}
