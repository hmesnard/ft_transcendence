import { Logger, UnauthorizedException } from '@nestjs/common';
import { MessageBody, OnGatewayConnection, OnGatewayDisconnect, OnGatewayInit, SubscribeMessage, WebSocketGateway, WebSocketServer, WsException } from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';
import { AuthService } from './auth/auth.service';
import { AdminUserDto, CreateMessageToChatDto, JoinedUserStatusDto, SetPasswordDto } from './chat/dto/chat.dto';
import { ChatService } from './chat/service/chat.service';
import { ChatUtilsService } from './chat/service/chatUtils.service';
import { UserService } from './user/user.service';

@WebSocketGateway({ cors: {origin: '*'} })
export class AppGateway implements OnGatewayInit, OnGatewayConnection, OnGatewayDisconnect {
  constructor(
    private authService: AuthService,
    private chatService: ChatService,
    private userService: UserService,
    private chatUtilService: ChatUtilsService
  ) {}

  @WebSocketServer() server: Server;

  private logger: Logger = new Logger('AppGateway');
  
  afterInit(server: any)
  {
    this.logger.log('Initialized!');
  }

  async handleConnection(socket: Socket)
  {
    try {
      const user = await this.authService.getUserFromSocket(socket);
      console.log(`user: "${user.username}" is connected`);
    } catch {
      return this.disconnect(socket);
    }
  }

  async handleDisconnect(socket: Socket)
  {
    try {
      const user = await this.authService.getUserFromSocket(socket);
      await this.chatService.disconnect(user);
      console.log(`user: "${user.username}" is disconnected`);
    } catch {
      socket.disconnect();
    }
  }

  @SubscribeMessage('createPublicChannelToServer')
  async createPublicChannel(socket: Socket, @MessageBody() channelName: string)
  {
    const user = await this.authService.getUserFromSocket(socket);
    const channel = await this.chatService.createPublicChannel(channelName, user);
    this.server.emit('createPublicChannelToClient', channel);
  }

  @SubscribeMessage('createProtectedChannelToServer')
  async createProtectedChannel(socket: Socket, @MessageBody() channelData: SetPasswordDto)
  {
    const user = await this.authService.getUserFromSocket(socket);
    const channel = await this.chatService.createProtectedChannel(channelData, user);
    this.server.emit('createProtectedChannelToClient', channel);
  }

  @SubscribeMessage('deleteChannel')
  async deleteChannel(socket: Socket, @MessageBody() channelId: number)
  {
    const user = await this.authService.getUserFromSocket(socket);
    await this.chatService.deleteChannel(channelId, user);
  }

  @SubscribeMessage('leaveChannelToServer')
  async leaveChannel(socket: Socket, @MessageBody() channelId: number)
  {
    const user = await this.authService.getUserFromSocket(socket);
    await this.chatService.leaveChannel(channelId, user);
    const channel = await this.chatUtilService.getChannelById(channelId);
    const text = `${user.username} has been left from the channel`;
    this.server.to(channel.name).emit('leaveChannelToClient', text);
  }

  @SubscribeMessage('joinChannelToServer')
  async joinChannel(socket: Socket, @MessageBody() channelData: SetPasswordDto)
  {
    const user = await this.authService.getUserFromSocket(socket);
    await this.chatService.joinChannel(channelData, user);
    const text = `${user.username} join to channel`;
    this.server.to(channelData.name).emit('joinChannelToClient', text);
  }

  @SubscribeMessage('muteUserToServer')
  async muteUser(socket: Socket, @MessageBody() data: JoinedUserStatusDto)
  {
    const user = await this.authService.getUserFromSocket(socket);
    await this.chatService.muteUser(data, user);
    this.server.emit('muteUserToClient', 'user has been muted');
  }

  @SubscribeMessage('unMuteUserToServer')
  async unMuteUser(socket: Socket, @MessageBody() data: JoinedUserStatusDto)
  {
    const user = await this.authService.getUserFromSocket(socket);
    await this.chatService.unMuteUser(data, user);
    this.server.emit('unMuteUserToClient', 'user has been unmuted');
  }

  @SubscribeMessage('banUserToServer')
  async banUser(socket: Socket, @MessageBody() data: JoinedUserStatusDto)
  {
    const user = await this.authService.getUserFromSocket(socket);
    await this.chatService.banUser(data, user);
    this.server.emit('banUserToClient', 'user has been banned');
  }

  @SubscribeMessage('unBanUserToServer')
  async unBanUser(socket: Socket, @MessageBody() data: JoinedUserStatusDto)
  {
    const user = await this.authService.getUserFromSocket(socket);
    await this.chatService.unBanUser(data, user);
    this.server.emit('unBanUserToClient', 'user has been unbanned');
  }

  @SubscribeMessage('giveAdminToServer')
  async giveAdmin(socket: Socket, @MessageBody() adminData: AdminUserDto)
  {
    const user = await this.authService.getUserFromSocket(socket);
    await this.chatService.giveAdmin(adminData, user);
    this.server.emit('giveAdminToClient', 'user is admin now');
  }

  @SubscribeMessage('unAdminToServer')
  async unAdmin(socket: Socket, @MessageBody() adminData: AdminUserDto)
  {
    const user = await this.authService.getUserFromSocket(socket);
    await this.chatService.unAdmin(adminData, user);
    this.server.emit('unAdminToClient', 'user is not admin anymore');
  }

  @SubscribeMessage('setPasswordToServer')
  async setPassword(socket: Socket, @MessageBody() passwordData: SetPasswordDto)
  {
    const user = await this.authService.getUserFromSocket(socket);
    await this.chatService.setPassword(passwordData, user);
    this.server.to(passwordData.name).emit('setPasswordToClient', 'owner set a new password for the channel');
  }

  @SubscribeMessage('removePasswordToServer')
  async removePassword(socket: Socket, @MessageBody() channelName: string)
  {
    const user = await this.authService.getUserFromSocket(socket);
    await this.chatService.removePassword(channelName, user);
    this.server.to(channelName).emit('removePasswordToClient', 'owner removed password from this channel');
  }

  @SubscribeMessage('createDirectChannelToServer')
  async createDirectChannel(socket: Socket, @MessageBody() username: string)
  {
    const user = await this.authService.getUserFromSocket(socket);
    const friend = await this.userService.getUserByName(username);
    if (!friend)
      throw new WsException('user doesnt exists');
    const channel = await this.chatService.createDirectChannel(user, friend);
    const text = `${user.username} and ${friend.username} have a private channel now`;
    this.server.to(channel.name).emit('createDirectChannelToClient', text);
  }

  @SubscribeMessage('createMessageToChannelToServer')
  async createMessageToChannel(socket: Socket, @MessageBody() data: CreateMessageToChatDto)
  {
    const user = await this.authService.getUserFromSocket(socket);
    const newMessage = await this.chatService.createMessageToChannel(data, user);
    this.server.to(data.name).emit('createMessageToChannelToClient', newMessage);
  }

  @SubscribeMessage('getMessagesFromChannelToServer')
  async getMessagesFromChannel(socket: Socket, @MessageBody() name: string)
  {
    const user = await this.authService.getUserFromSocket(socket);
    const messages = await this.chatService.getMessagesFromChannel(name, user);
    this.server.emit('getMessagesFromChannelToClient', messages);
  }

  @SubscribeMessage('getAllUsersFromChannelToServer')
  async getAllUsersFromChannel(socket: Socket, @MessageBody() chatId: number)
  {
    const users = await this.chatService.getAllUsersFromChannel(chatId);
    this.server.emit('getAllUsersFromChannelToClient', users);
  }

  @SubscribeMessage('getUserFromChannelToServer')
  async getUserFromChannel(socket: Socket, @MessageBody() data: JoinedUserStatusDto)
  {
    const user = await this.chatService.getUserFromChannel(data);
    this.server.emit('getUserFromChannelToClient', user);
  }

  @SubscribeMessage('getAllChannelsToServer')
  async getAllChannels(socket: Socket)
  {
    const channels = await this.chatUtilService.getAllChannels();
    this.server.emit('getAllChannelsToClient', channels);
  }

  private disconnect(socket: Socket)
  {
    socket.emit('Error', new UnauthorizedException());
    socket.disconnect();
  }

  // ------------------------------------------------------------ //

  // @WebSocketServer() wss: Server;

  // private logger: Logger = new Logger('AppGateway');
  
  // afterInit(server: Server) {
  //   this.logger.log('Initialized !');
  // }
  
  // async handleConnection(client: Socket, ...args: any[]) {
  //   const user = await this.authService.getUserFromSocket(client);
  //   this.userService.updateStatus(user.id, true);
  //   this.wss.emit('updateStatus', 'online');
  //   this.logger.log(`client connected:    ${client.id}`);
  // }
  
  // async handleDisconnect(client: Socket) {
  //   const user = await this.authService.getUserFromSocket(client);
  //   this.userService.updateStatus(user.id, false);
  //   this.wss.emit('updateStatus', 'offline');
  //   this.logger.log(`client disconnected: ${client.id}`);
  // }
  
  // @SubscribeMessage('msgToServer')
  // async handleMessage(client: Socket, payload: { room: string, content: string }) {
  //   const user = await this.authService.getUserFromSocket(client);
  //   const channel = await this.chatService.getChannelById(+payload.room);
  //   if (!this.chatService.clientIsMember(user, channel)) {
  //     throw new WsException('Client is not member of this chat');
  //   }

  //   const message = await this.chatService.saveMessage(payload.content, user, channel);
  //   this.wss.to(payload.room).emit('msgToClient', message);
  // }

  // @SubscribeMessage('joinRoom')
  // async joinRoom(client: Socket, room: string) {
  //   const user = await this.authService.getUserFromSocket(client);
  //   const channel = await this.chatService.getChannelById(+room);
  //   if (!this.chatService.clientIsMember(user, channel)) {
  //     throw new WsException('Client is not member of this chat');
  //   }

  //   client.join(room);
  // }

  // @SubscribeMessage('leaveRoom')
  // leaveRoom(client: Socket, room: string) {
  //   client.leave(room);
  // }
}
