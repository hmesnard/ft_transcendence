
import { Logger } from '@nestjs/common';
import { ConnectedSocket, MessageBody, OnGatewayConnection, OnGatewayDisconnect, OnGatewayInit, SubscribeMessage, WebSocketGateway, WebSocketServer, WsException } from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';
import { AuthService } from './auth/auth.service';
import { AdminUserDto, CreateMessageToChatDto, JoinedUserStatusDto, SetPasswordDto } from './chat/dto/chat.dto';
import { ChatService } from './chat/service/chat.service';
import { ChatUtilsService } from './chat/service/chatUtils.service';
import { UserStatus } from './user/entities/user.entity';
import { UserService } from './user/user.service';

@WebSocketGateway({ cors: {origin: '*'} }) // ({namespace: 'chat', cors: { origin: `http://localhost:3001`, credentials: true } })
export class AppGateway implements OnGatewayInit, OnGatewayConnection, OnGatewayDisconnect {
  constructor(
    private authService: AuthService,
    private chatUtilService: ChatUtilsService,
    private userService: UserService,
    private chatService: ChatService,
  ) {}

  @WebSocketServer() wss: Server;

  private logger: Logger = new Logger('AppGateway');
  
  afterInit(server: Server)
  {
    this.logger.log('Initialized !');
  }

  async handleConnection(@ConnectedSocket() client: Socket)
  {
    try
    {
      const user = await this.authService.getUserFromSocket(client);
      this.userService.updateStatus(user.id, UserStatus.online);
      this.wss.emit('updateStatus', 'online');
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
      this.userService.updateStatus(user.id, UserStatus.offline);
      this.wss.emit('updateStatus', 'offline');
      this.logger.log(`client disconnected: ${client.id}`);
      client.disconnect();
    }
    catch (e) { this.error(client, e, true); }
  }

  @SubscribeMessage('invite')
  async inviteUserToPrivateChat(@ConnectedSocket() client: Socket, @MessageBody() data: JoinedUserStatusDto)
  {
    try
    {
      const user = await this.authService.getUserFromSocket(client);
      await this.chatService.inviteUserToPrivateChannel(data, user);
      const friend = await this.userService.getUserById_2(data.targetId);
      const socket = this.wss.sockets.sockets.get(friend.socketId);
      socket.join(data.name);
    }
    catch { throw new WsException('Something went wrong'); }
  }

  @SubscribeMessage('public')
  async createPublicChannel(@ConnectedSocket() client: Socket, @MessageBody() name: string)
  {
    try
    {
      const user = await this.authService.getUserFromSocket(client);
      await this.chatService.createPublicChannel(name, user);
      client.join(name);
    }
    catch { throw new WsException('Something went wrong'); }
  }

  @SubscribeMessage('private')
  async createPrivateChannel(@ConnectedSocket() client: Socket, @MessageBody() name: string)
  {
    try
    {
      const user = await this.authService.getUserFromSocket(client);
      await this.chatService.createPrivateChannel(name, user);
      client.join(name);
    }
    catch { throw new WsException('Something went wrong'); }
  }

  @SubscribeMessage('protected')
  async createProtectedChannel(@ConnectedSocket() client: Socket, @MessageBody() data: SetPasswordDto)
  {
    try
    {
      const user = await this.authService.getUserFromSocket(client);
      await this.chatService.createProtectedChannel(data, user);
      client.join(data.name);
    }
    catch { throw new WsException('Something went wrong'); }
  }

  @SubscribeMessage('delete')
  async deleteChannel(@ConnectedSocket() client: Socket, @MessageBody() id: number)
  {
    try
    {
      const user = await this.authService.getUserFromSocket(client);
      const channel = await this.chatUtilService.getChannelById(id);
      const userStatus = await this.chatUtilService.getJoinedUserStatus(user, channel)
      this.chatUtilService.userIsOwner(userStatus);
      for (const member of channel.members)
      {
          const socket = this.wss.sockets.sockets.get(member.socketId);
          socket.leave(channel.name);
      }
      await this.chatService.deleteChannel(id, user);
    }
    catch { throw new WsException('Something went wrong'); }
  }

  @SubscribeMessage('kick')
  async kickUserFromChannel(@ConnectedSocket() client: Socket, @MessageBody() data: JoinedUserStatusDto)
  {
    try
    {
      const user = await this.authService.getUserFromSocket(client);
      await this.chatService.kickUserFromChannel(data, user);
      const friend = await this.userService.getUserById_2(data.targetId);
      const socket = this.wss.sockets.sockets.get(friend.socketId);
      socket.leave(data.name);
    }
    catch { throw new WsException('Something went wrong'); }
  }

  @SubscribeMessage('leave')
  async leaveChannel(@ConnectedSocket() client: Socket, @MessageBody() id: number)
  {
    try
    {
      const user = await this.authService.getUserFromSocket(client);
      const channel = await this.chatUtilService.getChannelById(id);
      const name = channel.name;
      await this.chatService.leaveChannel(id, user);
      client.leave(name);
    }
    catch { throw new WsException('Something went wrong'); }
  }

  @SubscribeMessage('join')
  async joinRoom(@ConnectedSocket() client: Socket, @MessageBody() channelData: SetPasswordDto)
  {
    try
    {
      const user = await this.authService.getUserFromSocket(client);
      await this.chatService.joinChannel(channelData, user);
      client.join(channelData.name);
    }
    catch { throw new WsException('Something went wrong'); }
  }

  // @SubscribeMessage('mute')
  // async muteUser(@ConnectedSocket() client: Socket, @MessageBody() data: JoinedUserStatusDto)
  // {
  //   try
  //   {
  //     const user = await this.authService.getUserFromSocket(client);
  //     await this.chatService.muteUser(data, user);
  //   }
  //   catch { throw new WsException('Something went wrong'); }
  // }

  // @SubscribeMessage('unmute')
  // async unMuteUser(@ConnectedSocket() client: Socket, @MessageBody() data: JoinedUserStatusDto)
  // {
  //   try
  //   {
  //     const user = await this.authService.getUserFromSocket(client);
  //     await this.chatService.unMuteUser(data, user);
  //   }
  //   catch { throw new WsException('Something went wrong'); }
  // }

  // @SubscribeMessage('ban')
  // async banUser(@ConnectedSocket() client: Socket, @MessageBody() data: JoinedUserStatusDto)
  // {
  //   try
  //   {
  //     const user = await this.authService.getUserFromSocket(client);
  //     await this.chatService.banUser(data, user);
  //   }
  //   catch { throw new WsException('Something went wrong'); }
  // }

  // @SubscribeMessage('mute')
  // async unBanUser(@ConnectedSocket() client: Socket, @MessageBody() data: JoinedUserStatusDto)
  // {
  //   try
  //   {
  //     const user = await this.authService.getUserFromSocket(client);
  //     await this.chatService.unBanUser(data, user);
  //   }
  //   catch { throw new WsException('Something went wrong'); }
  // }

  // @SubscribeMessage('admin')
  // async giveAdmin(@ConnectedSocket() client: Socket, @MessageBody() data: AdminUserDto)
  // {
  //   try
  //   {
  //     const user = await this.authService.getUserFromSocket(client);
  //     await this.chatService.giveAdmin(data, user);
  //   }
  //   catch { throw new WsException('Something went wrong'); }
  // }

  // @SubscribeMessage('unadmin')
  // async unAdmin(@ConnectedSocket() client: Socket, @MessageBody() data: AdminUserDto)
  // {
  //   try
  //   {
  //     const user = await this.authService.getUserFromSocket(client);
  //     await this.chatService.unAdmin(data, user);
  //   }
  //   catch { throw new WsException('Something went wrong'); }
  // }

  // @SubscribeMessage('password')
  // async setPassword(@ConnectedSocket() client: Socket, @MessageBody() data: SetPasswordDto)
  // {
  //   try
  //   {
  //     const user = await this.authService.getUserFromSocket(client);
  //     await this.chatService.setPassword(data, user);
  //   }
  //   catch { throw new WsException('Something went wrong'); }
  // }

  // @SubscribeMessage('removepassword')
  // async removePassword(@ConnectedSocket() client: Socket, @MessageBody() name: string)
  // {
  //   try
  //   {
  //     const user = await this.authService.getUserFromSocket(client);
  //     await this.chatService.removePassword(name, user);
  //   }
  //   catch { throw new WsException('Something went wrong'); }
  // }

  @SubscribeMessage('direct')
  async createDirectChannel(@ConnectedSocket() client: Socket, @MessageBody() id: number)
  {
    try
    {
      const user = await this.authService.getUserFromSocket(client);
      const friend = await this.userService.getUserById_2(id);
      const channel = await this.chatService.createDirectChannel(user, friend);
      const socket = this.wss.sockets.sockets.get(friend.socketId);
      client.join(channel.name);
      socket.join(channel.name);
    }
    catch { throw new WsException('Something went wrong'); }
  }

  @SubscribeMessage('msgToServer')
  async handleMessage(@ConnectedSocket() client: Socket, @MessageBody() data: CreateMessageToChatDto)
  {
    try
    {
      const user = await this.authService.getUserFromSocket(client);
      const channel = await this.chatUtilService.getChannelByName(data.name);
      const message = await this.chatService.createMessageToChannel(data, user);
      for (const member of channel.members)
      {
        if (await this.userService.isblocked_true(user, member) === false)
        {
          const socket = this.wss.sockets.sockets.get(member.socketId);
          socket.to(data.name).emit('msgToClient', message);
        }
      }
    }
    catch { throw new WsException('Something went wrong'); }
  }

  // @SubscribeMessage('getusers')
  // async getAllUsersFromChannel(@ConnectedSocket() client: Socket, @MessageBody() id: number)
  // {
  //   try
  //   {
  //     const users = await this.chatService.getAllUsersFromChannel(id);
  //     client.emit('getusers', users);
  //   }
  //   catch { throw new WsException('Something went wrong'); }
  // }

  // @SubscribeMessage('getuser')
  // async getUserFromChannel(@ConnectedSocket() client: Socket, @MessageBody() data: JoinedUserStatusDto)
  // {
  //   try
  //   {
  //     const user = await this.chatService.getUserFromChannel(data);
  //     client.emit('getuser', user);
  //   }
  //   catch { throw new WsException('Something went wrong'); }
  // }

  // @SubscribeMessage('getchannels')
  // async getChannelsFromUser(@ConnectedSocket() client: Socket, @MessageBody() id: number)
  // {
  //   try
  //   {
  //     const channels = await this.chatService.getChannelsFromUser(id);
  //     client.emit('getchannels', channels);
  //   }
  //   catch { throw new WsException('Something went wrong'); }
  // }

  private error(@ConnectedSocket() socket: Socket, error: object, disconnect: boolean = false)
  {
    socket.emit('Error', error);
    if (disconnect)
      socket.disconnect();
  }
}
