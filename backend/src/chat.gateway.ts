
// import { Logger } from '@nestjs/common';
// import { ConnectedSocket, MessageBody, OnGatewayConnection, OnGatewayDisconnect, OnGatewayInit, SubscribeMessage, WebSocketGateway, WebSocketServer, WsException } from '@nestjs/websockets';
// import { Server, Socket } from 'socket.io';
// import { AuthService } from './auth/auth.service';
// import { CreateMessageToChatDto, JoinedUserStatusDto, SetPasswordDto } from './chat/dto/chat.dto';
// import { ChatService } from './chat/service/chat.service';
// import { ChatUtilsService } from './chat/service/chatUtils.service';
// import { UserService } from './user/user.service';

// @WebSocketGateway({ namespace: 'chat', cors: { origin: `http://localhost:3000`, credentials: true } }) // ({namespace: 'chat', cors: { origin: `http://localhost:${FRONT_END_PORT}`, credentials: true } })
// export class ChatGateway implements OnGatewayInit, OnGatewayConnection, OnGatewayDisconnect
// {
//   constructor(
//     private authService: AuthService,
//     private chatUtilService: ChatUtilsService,
//     private userService: UserService,
//     private chatService: ChatService,
//   ) {}

//   @WebSocketServer() wss: Server;

//   private logger: Logger = new Logger('ChatGateway');
  
//   afterInit(server: Server)
//   {
//     this.logger.log('Initialized !');
//   }

//   async handleConnection(@ConnectedSocket() client: Socket)
//   {
//       console.log('lol');
//     try
//     {
//       const user = await this.authService.getUserFromSocket(client);
//       await this.userService.updateUserSocketId(client.id, user);
//       const rooms = await this.chatService.getChannelsFromUser(user.id);
//       for (const room of rooms)
//         client.join(room.name);
//       this.logger.log(`client connected:    ${client.id}`);
//     }
//     catch (e) { this.error(client, e, true); }
//   }

//   async handleDisconnect(@ConnectedSocket() client: Socket)
//   {
//     try
//     {
//       const user = await this.authService.getUserFromSocket(client);
//       await this.userService.updateUserSocketId(null, user);
//       this.logger.log(`client disconnected: ${client.id}`);
//       client.disconnect();
//     }
//     catch (e) { this.error(client, e, true); }
//   }

//   @SubscribeMessage('invite')
//   async inviteUserToPrivateChat(@ConnectedSocket() client: Socket, @MessageBody() data: JoinedUserStatusDto)
//   {
//     try
//     {
//       const user = await this.authService.getUserFromSocket(client);
//       const channel = await this.chatUtilService.getChannelByName(data.name);
//       await this.chatService.inviteUserToPrivateChannel(data, user);
//       const friend = await this.userService.getUserById_2(data.targetId);
//       const socket = this.wss.sockets.sockets.get(friend.socketId);
//       if (socket !== undefined)
//       {
//         socket.join(data.name);
//       }
//       this.wss.to(channel.name).emit('joinRoom', `User: ${friend.username} joined to channel`);
//       socket.emit('invite', channel);
//     }
//     catch { throw new WsException('Something went wrong'); }
//   }

//   @SubscribeMessage('public')
//   async createPublicChannel(@ConnectedSocket() client: Socket, @MessageBody() name: string)
//   {
//     try
//     {
//       const user = await this.authService.getUserFromSocket(client);
//       await this.chatService.createPublicChannel(name, user);
//       const channel = await this.chatUtilService.getChannelByName(name);
//       client.join(name);
//       this.wss.emit('newChannel', channel);
//     }
//     catch { throw new WsException('Something went wrong'); }
//   }

//   @SubscribeMessage('private')
//   async createPrivateChannel(@ConnectedSocket() client: Socket, @MessageBody() name: string)
//   {
//     try
//     {
//       const user = await this.authService.getUserFromSocket(client);
//       await this.chatService.createPrivateChannel(name, user);
//       const channel = await this.chatUtilService.getChannelByName(name);
//       client.join(name);
//       this.wss.emit('newChannel', channel);
//     }
//     catch { throw new WsException('Something went wrong'); }
//   }

//   @SubscribeMessage('protected')
//   async createProtectedChannel(@ConnectedSocket() client: Socket, @MessageBody() data: SetPasswordDto)
//   {
//     try
//     {
//       const user = await this.authService.getUserFromSocket(client);
//       await this.chatService.createProtectedChannel(data, user);
//       const channel = await this.chatUtilService.getChannelByName(data.name);
//       client.join(data.name);
//       this.wss.emit('newChannel', channel);
//     }
//     catch { throw new WsException('Something went wrong'); }
//   }

//   @SubscribeMessage('delete')
//   async deleteChannel(@ConnectedSocket() client: Socket, @MessageBody() id: number)
//   {
//     try
//     {
//       const user = await this.authService.getUserFromSocket(client);
//       const channel = await this.chatUtilService.getChannelById(id);
//       const userStatus = await this.chatUtilService.getJoinedUserStatus(user, channel)
//       this.chatUtilService.userIsOwner(userStatus);
//       for (const member of channel.members)
//       {
//           const socket = this.wss.sockets.sockets.get(member.socketId);
//           if (socket !== undefined)
//           {
//             socket.emit('delete', `Channel: ${channel.name} has been deleted`);
//             socket.leave(channel.name);
//           }
//       }
//       this.wss.emit('delete', channel);
//       await this.chatService.deleteChannel(id, user);
//     }
//     catch { throw new WsException('Something went wrong'); }
//   }

//   @SubscribeMessage('kick')
//   async kickUserFromChannel(@ConnectedSocket() client: Socket, @MessageBody() data: JoinedUserStatusDto)
//   {
//     try
//     {
//       const user = await this.authService.getUserFromSocket(client);
//       await this.chatService.kickUserFromChannel(data, user);
//       const friend = await this.userService.getUserById_2(data.targetId);
//       const socket = this.wss.sockets.sockets.get(friend.socketId);
//       if (socket !== undefined)
//       {
//         socket.leave(data.name);
//         socket.emit('kick', `You have been kicked out from channel: ${data.name}`)
//       }
//       client.emit('kick', `You kicked out user: ${friend.username} from the channel`)
//     }
//     catch { throw new WsException('Something went wrong'); }
//   }

//   @SubscribeMessage('leave')
//   async leaveChannel(@ConnectedSocket() client: Socket, @MessageBody() id: number)
//   {
//     try
//     {
//       const user = await this.authService.getUserFromSocket(client);
//       const channel = await this.chatUtilService.getChannelById(id);
//       const name = channel.name;
//       await this.chatService.leaveChannel(id, user);
//       client.leave(name);
//       client.emit('leave', 'You left from the channel');
//       this.wss.to(name).emit('leave', `User: ${user.username} just left from the channel`);
//     }
//     catch { throw new WsException('Something went wrong'); }
//   }

//   @SubscribeMessage('join')
//   async joinRoom(@ConnectedSocket() client: Socket, @MessageBody() channelData: SetPasswordDto)
//   {
//     try
//     {
//       const user = await this.authService.getUserFromSocket(client);
//       await this.chatService.joinChannel(channelData, user);
//       client.join(channelData.name);
//       this.wss.to(channelData.name).emit('joinRoom', `User: ${user.username} joined to channel`);
//     }
//     catch { throw new WsException('Something went wrong'); }
//   }

//   @SubscribeMessage('direct')
//   async createDirectChannel(@ConnectedSocket() client: Socket, @MessageBody() id: number)
//   {
//     try
//     {
//       const user = await this.authService.getUserFromSocket(client);
//       const friend = await this.userService.getUserById_2(id);
//       const channel = await this.chatService.createDirectChannel(user, friend);
//       const socket = this.wss.sockets.sockets.get(friend.socketId);
//       client.join(channel.name);
//       if (socket !== undefined)
//         socket.join(channel.name);
//       this.wss.to(channel.name).emit('newChannel', `New direct chat with ${user.username} and ${friend.username}`);
//     }
//     catch { throw new WsException('Something went wrong'); }
//   }

//   @SubscribeMessage('msgToServer')
//   async handleMessage(@ConnectedSocket() client: Socket, @MessageBody() data: CreateMessageToChatDto)
//   {
//     try
//     {
//       const user = await this.authService.getUserFromSocket(client);
//       const channel = await this.chatUtilService.getChannelByName(data.name);
//       const message = await this.chatService.createMessageToChannel(data, user);
//       for (const member of channel.members)
//       {
//         if (await this.userService.isblocked_true(user, member) === false)
//         {
//           const socket = this.wss.sockets.sockets.get(member.socketId);
//           if (socket !== undefined)
//             socket.to(data.name).emit('msgToClient', message);
//         }
//       }
//     }
//     catch { throw new WsException('Something went wrong'); }
//   }

//   private error(@ConnectedSocket() socket: Socket, error: object, disconnect: boolean = false)
//   {
//     socket.emit('Error', error);
//     if (disconnect)
//       socket.disconnect();
//   }
// }
