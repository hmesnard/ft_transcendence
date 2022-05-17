import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { WsException } from '@nestjs/websockets';
import { UserEntity } from 'src/user/entities/user.entity';
import { UserService } from 'src/user/user.service';
import { Repository } from 'typeorm';
import { ChatUtilsService } from './chatUtils.service';
import { AdminUserDto, CreateMessageToChatDto, JoinedUserStatusDto, SetPasswordDto } from '../dto/chat.dto';
import { ChannelEntity, ChannelStatus } from '../entities/channel.entity';
import { JoinedUserStatus } from '../entities/joinedUserStatus.entity';
import { MessageEntity } from '../entities/message.entity';

@Injectable()
export class ChatService {
    constructor(
        @InjectRepository(ChannelEntity)
        private channelRepository: Repository<ChannelEntity>,
        @InjectRepository(MessageEntity)
        private messageRepository: Repository<MessageEntity>,
        @InjectRepository(JoinedUserStatus) 
        private joinedUserStatusRepository: Repository<JoinedUserStatus>,
        private userService: UserService,
        private chatUtilService: ChatUtilsService
    ) {}

    // async inviteUserToChannel(data: JoinedUserStatusDto, user: UserEntity)
    // {
    //     const channel = await this.chatUtilService.utils_2(data.name, user);
    //     const friend = await this.userService.getUserById(data.targetId);
    //     if (await this.joinedUserRepository.findOne({ user: friend, channel }))
    //         throw new HttpException({status: HttpStatus.NOT_FOUND, error: 'User is already in the channel'}, HttpStatus.NOT_FOUND);
    //     const newJoinedUser = await this.joinedUserRepository.create({
    //         user: friend,
    //         userId: data.targetId,
    //         channel
    //     });
    //     await this.joinedUserRepository.save(newJoinedUser);
    //     if (await this.joinedUserStatusRepository.findOne({ userId: data.targetId, channel }))
    //         return ;
    //     const newJoinedUserStatus = await this.joinedUserStatusRepository.create({
    //         userId: data.targetId,
    //         channel,
    //     });
    //     await this.joinedUserStatusRepository.save(newJoinedUserStatus);
    // }

    async createPublicChannel(channelName: string, user: UserEntity)
    {
        const channel = await this.chatUtilService.getChannelByName(channelName);
        if (channel || channelName.includes("direct_with_") === true)
            throw new HttpException({status: HttpStatus.BAD_REQUEST, error: 'Chat already exists'}, HttpStatus.BAD_REQUEST);
        const newJoinedUserStatus = await this.joinedUserStatusRepository.create({
            owner: true,
            admin: true,
            channel,
            user,
        });
        await this.joinedUserStatusRepository.save(newJoinedUserStatus);
        const newChannel = await this.channelRepository.create({
            name: channelName,
            status: ChannelStatus.public,
            members: [user],
            joinedUserStatus: [newJoinedUserStatus],
        });
        await this.channelRepository.save(newChannel);
        return newChannel;
    }

    async createPrivateChannel(channelName: string, user: UserEntity)
    {
        const channel = await this.chatUtilService.getChannelByName(channelName);
        if (channel || channelName.includes("direct_with_") === true)
            throw new HttpException({status: HttpStatus.BAD_REQUEST, error: 'Chat already exists'}, HttpStatus.BAD_REQUEST);
        const newJoinedUserStatus = await this.joinedUserStatusRepository.create({
            owner: true,
            admin: true,
            channel,
            user,
        });
        await this.joinedUserStatusRepository.save(newJoinedUserStatus);
        const newChannel = await this.channelRepository.create({
            name: channelName,
            status: ChannelStatus.private,
            members: [user],
            joinedUserStatus: [newJoinedUserStatus],
        });
        await this.channelRepository.save(newChannel);
        return newChannel;
    }

    // async createProtectedChannel(channelData: SetPasswordDto, user: UserEntity)
    // {
    //     const channel = await this.chatUtilService.getChannelByName(channelData.name);
    //     if (channel || channelData.name.includes("direct_with_") === true)
    //         throw new HttpException({status: HttpStatus.BAD_REQUEST, error: 'Chat already exists'}, HttpStatus.BAD_REQUEST);
    //     if (!channelData.password)
    //         throw new HttpException({status: HttpStatus.BAD_REQUEST, error: 'Please insert a password'}, HttpStatus.BAD_REQUEST);
    //     const newJoinedUser = await this.joinedUserRepository.create({
    //         user,
    //         owner: true,
    //         userId: user.id
    //     });
    //     await this.joinedUserRepository.save(newJoinedUser);
    //     const newJoinedUserStatus = await this.joinedUserStatusRepository.create({
    //         userId: user.id,
    //         admin: true
    //     });
    //     await this.joinedUserStatusRepository.save(newJoinedUserStatus);
    //     const newChannel = await this.channelRepository.create({
    //         name: channelData.name,
    //         status: ChannelStatus.protected,
    //         password: channelData.password,
    //         joinedUsers: [newJoinedUser],
    //         joinedUserStatus: [newJoinedUserStatus],
    //     });
    //     await this.channelRepository.save(newChannel);
    //     return newChannel;
    // }

    // async disconnect(user: UserEntity)
    // {
    //     const joinedUsers = await this.joinedUserRepository.find({ userId: user.id });
    //     if (joinedUsers)
    //         for (const joinedUser of joinedUsers)
    //             await this.joinedUserRepository.delete(joinedUser);
    //     return ;
    // }

    // async deleteChannel(id: number, user: UserEntity)
    // {
    //     const channel = await this.chatUtilService.getChannelById(id);
    //     if (!channel)
    //         throw new HttpException({status: HttpStatus.NOT_FOUND, error: 'Chat doesnt exists'}, HttpStatus.NOT_FOUND);
    //     const joinedUser = await this.joinedUserRepository.findOne({ user, channel });
    //     if (joinedUser && (joinedUser.userId !== user.id || joinedUser.owner === false))
    //         throw new HttpException({status: HttpStatus.FORBIDDEN, error: 'You dont have access to delete this chat, only owner can do that'}, HttpStatus.FORBIDDEN);
    //     await this.chatUtilService.deleteMessagesByChannel(channel);
    //     await this.chatUtilService.deleteJoinedUsersByChannel(channel);
    //     await this.chatUtilService.deleteJoinedUsersStatusByChannel(channel);    
    //     await this.channelRepository.delete(channel);
    //     return ;
    // }

    // async kickUserFromChannel(data: JoinedUserStatusDto, user: UserEntity)
    // {
    //     if (data.targetId === user.id)
    //         throw new HttpException({status: HttpStatus.FORBIDDEN, error: 'You cant kick yourself'}, HttpStatus.FORBIDDEN);
    //     const channel = await this.chatUtilService.utils_2(data.name, user);
    //     const friend = await this.userService.getUserById(data.targetId);
    //     const joinedFriend = await this.joinedUserRepository.findOne({ user: friend, channel });
    //     if (!joinedFriend)
    //         throw new HttpException({status: HttpStatus.NOT_FOUND, error: 'User is not in this channel'}, HttpStatus.NOT_FOUND);
    //     await this.joinedUserRepository.delete(joinedFriend);
    // }

    // async leaveChannel(id: number, user: UserEntity)
    // {
    //     const channel = await this.chatUtilService.getChannelById(id);
    //     if (!channel)
    //         throw new HttpException({status: HttpStatus.NOT_FOUND, error: 'Chat doesnt exists'}, HttpStatus.NOT_FOUND);
    //     const joinedUser = await this.joinedUserRepository.findOne({ user, channel });
    //     if (joinedUser)
    //         await this.joinedUserRepository.delete(joinedUser);
    //     return ;
    // }

    // async joinChannel(channelData: SetPasswordDto, user: UserEntity)
    // {
    //     const channel = await this.chatUtilService.getChannelByName(channelData.name);
    //     if (channel)
    //     {
    //         if (channel.status === ChannelStatus.private)
    //             throw new HttpException({status: HttpStatus.FORBIDDEN, error: 'This is a private chat, you dont have access to join here'}, HttpStatus.FORBIDDEN);
    //         if (channel.status === ChannelStatus.direct && (channel.name.includes("direct_with_") === false || channel.name.includes(`${user.id}`) === false))
    //             throw new HttpException({status: HttpStatus.FORBIDDEN, error: 'This is a direct chat, you dont have access to join here'}, HttpStatus.FORBIDDEN);
    //         const joinedUserStatus = await this.joinedUserStatusRepository.findOne({ userId: user.id, channel });
    //         if (joinedUserStatus && joinedUserStatus.banned !== null)
    //         {
    //             const time = new Date;
    //             if (joinedUserStatus.banned > time)
    //                 throw new HttpException({status: HttpStatus.FORBIDDEN, error: 'You are banned from this chat, you dont have access to join here'}, HttpStatus.FORBIDDEN);
    //             joinedUserStatus.banned = null;
    //             await this.joinedUserStatusRepository.save(joinedUserStatus);
    //         }
    //         if (channelData.password === channel.password || channel.status === ChannelStatus.public)
    //         {
    //             const joinedUser = await this.joinedUserRepository.findOne({ user, channel });
    //             if (!joinedUser)
    //             {
    //                 const newJoinedUser = await this.joinedUserRepository.create({
    //                     user,
    //                     channel,
    //                     userId: user.id,
    //                 });
    //                 await this.joinedUserRepository.save(newJoinedUser);
    //                 if (await this.joinedUserStatusRepository.findOne({ userId: user.id, channel }))
    //                     return ;
    //                 const newJoinedUserStatus = await this.joinedUserStatusRepository.create({
    //                     userId: user.id,
    //                     channel,
    //                 });
    //                 await this.joinedUserStatusRepository.save(newJoinedUserStatus);
    //                 return ;
    //             }
    //             throw new HttpException({status: HttpStatus.BAD_REQUEST, error: 'You are already member of this channel'}, HttpStatus.BAD_REQUEST);
    //         }
    //         throw new HttpException({status: HttpStatus.FORBIDDEN, error: 'Wrong password, please try again'}, HttpStatus.FORBIDDEN);
    //     }
    //     throw new HttpException({status: HttpStatus.NOT_FOUND, error: 'Chat doesnt exists'}, HttpStatus.NOT_FOUND);
    // }

    // async muteUser(data: JoinedUserStatusDto, user: UserEntity)
    // {
    //     const targetUserStatus = await this.chatUtilService.utils(data, user);
    //     const time = new Date;
    //     if (targetUserStatus.muted > time)
    //         throw new HttpException('User is already muted in this chat', HttpStatus.BAD_REQUEST);
    //     targetUserStatus.muted = new Date;
    //     targetUserStatus.muted.setDate(time.getDate() + 1);
    //     await this.joinedUserStatusRepository.save(targetUserStatus);
    //     return ;
    // }

    // async unMuteUser(data: JoinedUserStatusDto, user: UserEntity)
    // {
    //     const targetUserStatus = await this.chatUtilService.utils(data, user);
    //     const time = new Date;
    //     if (targetUserStatus.muted === null || targetUserStatus.muted < time)
    //         throw new HttpException('User is not muted in this chat', HttpStatus.BAD_REQUEST);
    //     targetUserStatus.muted = null;
    //     await this.joinedUserStatusRepository.save(targetUserStatus);
    //     return ;
    // }

    // async banUser(data: JoinedUserStatusDto, user: UserEntity)
    // {
    //     const targetUserStatus = await this.chatUtilService.utils(data, user);
    //     const time = new Date;
    //     if (targetUserStatus.banned > time)
    //         throw new HttpException('User is already banned in this chat', HttpStatus.BAD_REQUEST);
    //     targetUserStatus.banned = new Date;
    //     targetUserStatus.banned.setDate(time.getDate() + 1);
    //     await this.joinedUserStatusRepository.save(targetUserStatus);
    //     return ;
    // }

    // async unBanUser(data: JoinedUserStatusDto, user: UserEntity)
    // {
    //     const targetUserStatus = await this.chatUtilService.utils(data, user);
    //     const time = new Date;
    //     if (targetUserStatus.banned === null || targetUserStatus.banned < time)
    //         throw new HttpException('User is not banned in this chat', HttpStatus.BAD_REQUEST);
    //     targetUserStatus.banned = null;
    //     await this.joinedUserStatusRepository.save(targetUserStatus);
    //     return ;
    // }

    // async giveAdmin(adminData: AdminUserDto, user: UserEntity)
    // {
    //     const channel = await this.chatUtilService.utils_2(adminData.name, user);
    //     const adminUser = await this.joinedUserRepository.findOne({ userId: adminData.adminId, channel });
    //     if (!adminUser || user.id === adminUser.userId)
    //         throw new HttpException('User to admin doesnt exists', HttpStatus.FORBIDDEN);
    //     const adminUserStatus = await this.joinedUserStatusRepository.findOne({ userId: adminData.adminId, channel });
    //     if (adminUserStatus && adminUserStatus.admin === true)
    //         throw new HttpException('User is already admin in this chat', HttpStatus.BAD_REQUEST);
    //     adminUserStatus.admin = true;
    //     await this.joinedUserStatusRepository.save(adminUserStatus);
    //     return ;
    // }

    // async unAdmin(adminData: AdminUserDto, user: UserEntity)
    // {
    //     const channel = await this.chatUtilService.utils_2(adminData.name, user);
    //     const adminUser = await this.joinedUserRepository.findOne({ userId: adminData.adminId, channel });
    //     if (!adminUser || user.id === adminUser.userId || adminUser.owner === true)
    //         throw new HttpException('You dont have access to unadmin the user', HttpStatus.FORBIDDEN);
    //     const adminUserStatus = await this.joinedUserStatusRepository.findOne({ userId: adminData.adminId, channel });
    //     if (adminUserStatus && adminUserStatus.admin === false)
    //         throw new HttpException('User is not admin in this chat', HttpStatus.BAD_REQUEST);
    //     adminUserStatus.admin = false;
    //     await this.joinedUserStatusRepository.save(adminUserStatus);
    //     return ;
    // }

    // async setPassword(passwordData: SetPasswordDto, user: UserEntity)
    // {
    //     if (!passwordData.password)
    //         throw new HttpException('Please set a password', HttpStatus.BAD_REQUEST);
    //     const channel = await this.chatUtilService.utils_2(passwordData.name, user);
    //     channel.password = passwordData.password;
    //     if (channel.status !== ChannelStatus.protected)
    //         channel.status = ChannelStatus.protected;
    //     await this.channelRepository.save(channel);
    //     return ;
    // }

    // async removePassword(channelName: string, user: UserEntity)
    // {
    //     const channel = await this.chatUtilService.utils_2(channelName, user);
    //     channel.password = null;
    //     if (channel.status !== ChannelStatus.public)
    //         channel.status = ChannelStatus.public;
    //     await this.channelRepository.save(channel);
    //     return ;
    // }

    // async createDirectChannel(user: UserEntity, friend: UserEntity)
    // {
    //     if (user.id === friend.id)
    //         throw new HttpException('You cant create direct chat with yourself', HttpStatus.FORBIDDEN);
    //     if (await this.chatUtilService.getChannelByName("direct_with_" + user.id + "_" + friend.id) || await this.chatUtilService.getChannelByName("direct_with_" + friend.id + "_" + user.id))
    //         throw new HttpException('You already have direct chat with him', HttpStatus.FORBIDDEN);
    //     const joinedUser = await this.joinedUserRepository.create({
    //         user,
    //         userId: user.id
    //     });
    //     await this.joinedUserRepository.save(joinedUser);
    //     const joinedUserStatus = await this.joinedUserStatusRepository.create({
    //         userId: user.id, 
    //     });
    //     await this.joinedUserStatusRepository.save(joinedUserStatus);
    //     const joinedFriend = await this.joinedUserRepository.create({
    //         user: friend,
    //         userId: friend.id
    //     });
    //     await this.joinedUserRepository.save(joinedFriend);
    //     const joinedFriendStatus = await this.joinedUserStatusRepository.create({
    //         userId: friend.id, 
    //     });
    //     await this.joinedUserStatusRepository.save(joinedFriendStatus);
    //     const channelName = "direct_with_" + user.id + "_" + friend.id;
    //     const channel = await this.channelRepository.create({
    //         name: channelName,
    //         status: ChannelStatus.direct,
    //         joinedUsers: [joinedUser, joinedFriend],
    //         joinedUserStatus: [joinedUserStatus, joinedFriendStatus],
    //     });
    //     await this.channelRepository.save(channel);
    //     return channel;
    // }

    // async createMessageToChannel(data: CreateMessageToChatDto, user: UserEntity)
    // {
    //     const channel = await this.chatUtilService.getChannelByName(data.name);
    //     if (channel)
    //     {
    //         if (!await this.joinedUserRepository.findOne({ user, channel }))
    //             throw new HttpException('You are not member of this chat', HttpStatus.FORBIDDEN);
    //         const joinedUserStatus = await this.joinedUserStatusRepository.findOne({ channel, userId: user.id });
    //         const time = new Date;
    //         if (joinedUserStatus && joinedUserStatus.banned > time)
    //             throw new HttpException('You are banned from this chat', HttpStatus.FORBIDDEN);
    //         if (joinedUserStatus.muted > time)
    //             return ;
    //         const newMessage = await this.messageRepository.create({
    //             content: data.message,
    //             author: user,
    //             channel,
    //         });
    //         await this.messageRepository.save(newMessage);
    //         return newMessage;
    //     }
    //     throw new HttpException('Chat doesnt exists', HttpStatus.NOT_FOUND);
    // }

    // async getMessagesFromChannel(name: string, user: UserEntity)
    // {
    //     const channel = await this.chatUtilService.getChannelByName(name);
    //     if (!channel)
    //         throw new HttpException('Chat doesnt exists', HttpStatus.NOT_FOUND);
    //     const messagesFromChat = await this.messageRepository.find({ channel })
    //     const allMessages: MessageEntity[] = [];
    //     for (const message of messagesFromChat)
    //         allMessages.push(message);
    //     return allMessages;
    // }

    // async getAllUsersFromChannel(channelId: number)
    // {
    //     const channel = await this.chatUtilService.getChannelById(channelId);
    //     if (!channel)
    //         return ;
    //     const joinedUsers = await this.joinedUserRepository.find({ channel });
    //     if (!joinedUsers)
    //         return ;
    //     const users: UserEntity[] = [];
    //     for (const joinedUser of joinedUsers)
    //     {
    //         const user = await this.userService.getUserById(joinedUser.userId);
    //         users.push(user);
    //     }
    //     return users;
    // }

    // async getUserFromChannel(data: JoinedUserStatusDto)
    // {
    //     const channel = await this.chatUtilService.getChannelByName(data.name);
    //     if (!channel)
    //         throw new WsException('Channel doesnt exists');
    //     const joinedUser = await this.joinedUserRepository.findOne({ userId: data.targetId, channel });
    //     if (!joinedUser)
    //         throw new WsException('There is no users in channel');
    //     const user = await this.userService.getUserById(joinedUser.userId);
    //     return user;
    // }

    // async getChannelsFromUser(userId: number)
    // {
    //     const AllChannels = await this.chatUtilService.getAllChannels();
    //     const ChannelsfromUser: ChannelEntity[] = [];
    //     for (const channel of AllChannels)
    //         if (await this.joinedUserRepository.findOne({ userId, channel }))
    //             ChannelsfromUser.push(channel);
    //     return ChannelsfromUser;
    // }

    async getChannelById(id: number): Promise<ChannelEntity> {
        return await this.channelRepository.findOne(id);
    }

    async clientIsMember(user: UserEntity, chat: ChannelEntity): Promise<boolean> {
        for(var i = 0; i < chat.members.length; i++) {
            if (chat.members[i].id === user.id) {
                return true;
            }
        }
        return false;
    }

    async saveMessage(content: string, user: UserEntity, channel: ChannelEntity) {
        let message = this.messageRepository.create({
            content: content,
            author: user,
            channel: channel
        });
        console.log(message);
        try {
            message = await this.messageRepository.save(message);
        } catch (e) {
            throw new WsException('Error while saving message to the database');
        }
        return message;
    }
}
