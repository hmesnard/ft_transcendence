import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { WsException } from '@nestjs/websockets';
import { UserEntity } from 'src/user/entities/user.entity';
import { UserService } from 'src/user/user.service';
import { Repository } from 'typeorm';
import { ChatUtilsService } from './chatUtils.service';
import { AdminUserDto, CreateMessageToChatDto, JoinedUserStatusDto, SetPasswordDto } from '../dto/chat.dto';
import { ChannelEntity, ChannelStatus } from '../entities/channel.entity';
import { JoinedUser } from '../entities/joinedUser.entity';
import { JoinedUserStatus } from '../entities/joinedUserStatus.entity';
import { MessageEntity } from '../entities/message.entity';

@Injectable()
export class ChatService {
    constructor(
        @InjectRepository(ChannelEntity)
        private channelRepository: Repository<ChannelEntity>,
        @InjectRepository(MessageEntity)
        private messageRepository: Repository<MessageEntity>,
        @InjectRepository(JoinedUser) 
        private joinedUserRepository: Repository<JoinedUser>,
        @InjectRepository(JoinedUserStatus) 
        private joinedUserStatusRepository: Repository<JoinedUserStatus>,
        private userService: UserService,
        private chatUtilService: ChatUtilsService
    ) {}

    async createPublicChannel(channelName: string, user: UserEntity)
    {
        const channel = await this.chatUtilService.getChannelByName(channelName);
        if (channel || channel.name.includes("direct_with_") === true)
            throw new WsException('Channel already exists');
            // throw new HttpException({status: HttpStatus.BAD_REQUEST, error: 'Chat already exists'}, HttpStatus.BAD_REQUEST);
        const newJoinedUser = await this.joinedUserRepository.create({
            user,
            owner: true,
            username: user.username,
        });
        await this.joinedUserRepository.save(newJoinedUser);
        const newJoinedUserStatus = await this.joinedUserStatusRepository.create({
            username: user.username,
            admin: true,
            channel, 
        });
        await this.joinedUserStatusRepository.save(newJoinedUserStatus);
        const newChannel = await this.channelRepository.create({
            name: channelName,
            joinedUsers: [newJoinedUser],
            joinedUserStatus: [newJoinedUserStatus],
        });
        await this.channelRepository.save(newChannel);
        return newChannel;
    }

    async createProtectedChannel(channelData: SetPasswordDto, user: UserEntity)
    {
        const channel = await this.chatUtilService.getChannelByName(channelData.name);
        if (channel || channel.name.includes("direct_with_") === true)
            throw new WsException('Channel already exists');
            // throw new HttpException({status: HttpStatus.BAD_REQUEST, error: 'Chat already exists'}, HttpStatus.BAD_REQUEST);
        if (!channelData.password)
            throw new WsException('Please insert a password');
            // throw new HttpException({status: HttpStatus.BAD_REQUEST, error: 'Please insert a password'}, HttpStatus.BAD_REQUEST);
        const newJoinedUser = await this.joinedUserRepository.create({
            user,
            owner: true,
            username: user.username,
        });
        await this.joinedUserRepository.save(newJoinedUser);
        const newJoinedUserStatus = await this.joinedUserStatusRepository.create({
            username: user.username,
            admin: true,
            channel,
        });
        await this.joinedUserStatusRepository.save(newJoinedUserStatus);
        const newChannel = await this.channelRepository.create({
            name: channelData.name,
            status: ChannelStatus.protected,
            password: channelData.password,
            joinedUsers: [newJoinedUser],
            joinedUserStatus: [newJoinedUserStatus],
        });
        await this.channelRepository.save(newChannel);
        return newChannel;
    }

    async disconnect(user: UserEntity)
    {
        const joinedUsers = await this.joinedUserRepository.find({ username: user.username });
        if (joinedUsers)
            for (const joinedUser of joinedUsers)
                await this.joinedUserRepository.delete(joinedUser);
        return ;
    }

    async deleteChannel(id: number, user: UserEntity)
    {
        const channel = await this.chatUtilService.getChannelById(id);
        if (!channel)
            throw new WsException('channel doesnt exists');
            // throw new HttpException({status: HttpStatus.NOT_FOUND, error: 'Chat doesnt exists'}, HttpStatus.NOT_FOUND);
        const joinedUser = await this.joinedUserRepository.findOne({ user, channel });
        if (joinedUser && (joinedUser.username !== user.username || joinedUser.owner === false))
            throw new WsException('You dont have access to delete this channel, only owner can do that');
            // throw new HttpException({status: HttpStatus.FORBIDDEN, error: 'You dont have access to delete this chat, only owner can do that'}, HttpStatus.FORBIDDEN);
        await this.chatUtilService.deleteMessagesByChannel(channel);
        await this.chatUtilService.deleteJoinedUsersByChannel(channel);
        await this.chatUtilService.deleteJoinedUsersStatusByChannel(channel);    
        await this.channelRepository.delete(channel);
        return ;
    }

    async leaveChannel(id: number, user: UserEntity)
    {
        const channel = await this.chatUtilService.getChannelById(id);
        if (!channel)
            throw new WsException('channel doesnt exists');
            // throw new HttpException({status: HttpStatus.NOT_FOUND, error: 'Chat doesnt exists'}, HttpStatus.NOT_FOUND);
        const joinedUser = await this.joinedUserRepository.findOne({ user, channel });
        if (joinedUser)
            await this.joinedUserRepository.delete(joinedUser);
        return ;
    }

    async joinChannel(channelData: SetPasswordDto, user: UserEntity)
    {
        const channel = await this.chatUtilService.getChannelByName(channelData.name);
        if (channel)
        {
            if ((channel.direct === true || channel.status === ChannelStatus.private) && (channel.name.includes("direct_with_") === false || channel.name.includes(user.username) === false))
                throw new WsException('This is a private channel, you dont have access to join here');
                // throw new HttpException({status: HttpStatus.FORBIDDEN, error: 'This is a private chat, you dont have access to join here'}, HttpStatus.FORBIDDEN);
            const joinedUserStatus = await this.joinedUserStatusRepository.findOne({ username: user.username, channel });
            if (joinedUserStatus && joinedUserStatus.banned !== null)
            {
                const time = new Date;
                if (joinedUserStatus.banned > time)
                    throw new WsException('You are banned from this channel, you dont have access to join here');
                    // throw new HttpException({status: HttpStatus.FORBIDDEN, error: 'You are banned from this chat, you dont have access to join here'}, HttpStatus.FORBIDDEN);
                joinedUserStatus.banned = null;
                await this.joinedUserStatusRepository.save(joinedUserStatus);
            }
            if (channelData.password === channel.password || channel.status === ChannelStatus.public)
            {
                const joinedUser = await this.joinedUserRepository.findOne({ user, channel });
                if (!joinedUser)
                {
                    const newJoinedUser = await this.joinedUserRepository.create({
                        user,
                        channel,
                        username: user.username,
                    });
                    await this.joinedUserRepository.save(newJoinedUser);
                    if (await this.joinedUserStatusRepository.findOne({ username: user.username, channel }))
                        return ;
                    const newJoinedUserStatus = await this.joinedUserStatusRepository.create({
                        username: user.username,
                        channel,
                    });
                    await this.joinedUserStatusRepository.save(newJoinedUserStatus);
                    return ;
                }
                throw new WsException('You are already member of this channel');
                // throw new HttpException({status: HttpStatus.BAD_REQUEST, error: 'You are already member of this channel'}, HttpStatus.BAD_REQUEST);
            }
            throw new WsException('Wrong password, please try again');
            // throw new HttpException({status: HttpStatus.FORBIDDEN, error: 'Wrong password, please try again'}, HttpStatus.FORBIDDEN);
        }
        throw new WsException('Channel doesnt exists');
        // throw new HttpException({status: HttpStatus.NOT_FOUND, error: 'Chat doesnt exists'}, HttpStatus.NOT_FOUND);
    }

    async muteUser(data: JoinedUserStatusDto, user: UserEntity)
    {
        const targetUserStatus = await this.chatUtilService.utils(data, user);
        const time = new Date;
        if (targetUserStatus.muted > time)
            throw new WsException('User is already muted in this channel');
            // throw new HttpException('User is already muted in this chat', HttpStatus.BAD_REQUEST);
        targetUserStatus.muted = new Date;
        targetUserStatus.muted.setDate(time.getDate() + 1);
        await this.joinedUserStatusRepository.save(targetUserStatus);
        return ;
    }

    async unMuteUser(data: JoinedUserStatusDto, user: UserEntity)
    {
        const targetUserStatus = await this.chatUtilService.utils(data, user);
        const time = new Date;
        if (targetUserStatus.muted === null || targetUserStatus.muted < time)
            throw new WsException('User is not muted in this channel');
            // throw new HttpException('User is not muted in this chat', HttpStatus.BAD_REQUEST);
        targetUserStatus.muted = null;
        await this.joinedUserStatusRepository.save(targetUserStatus);
        return ;
    }

    async banUser(data: JoinedUserStatusDto, user: UserEntity)
    {
        const targetUserStatus = await this.chatUtilService.utils(data, user);
        const time = new Date;
        if (targetUserStatus.banned > time)
            throw new WsException('User is already banned in this channel');
            // throw new HttpException('User is already banned in this chat', HttpStatus.BAD_REQUEST);
        targetUserStatus.banned = new Date;
        targetUserStatus.banned.setDate(time.getDate() + 1);
        await this.joinedUserStatusRepository.save(targetUserStatus);
        return ;
    }

    async unBanUser(data: JoinedUserStatusDto, user: UserEntity)
    {
        const targetUserStatus = await this.chatUtilService.utils(data, user);
        const time = new Date;
        if (targetUserStatus.banned === null || targetUserStatus.banned < time)
            throw new WsException('User is not banned in this channel');
            // throw new HttpException('User is not banned in this chat', HttpStatus.BAD_REQUEST);
        targetUserStatus.banned = null;
        await this.joinedUserStatusRepository.save(targetUserStatus);
        return ;
    }

    async giveAdmin(adminData: AdminUserDto, user: UserEntity)
    {
        const channel = await this.chatUtilService.utils_2(adminData.name, user);
        const adminUser = await this.joinedUserRepository.findOne({ username: adminData.admin, channel });
        if (!adminUser || user.username === adminUser.username)
            throw new WsException('User to admin doesnt exists');
            // throw new HttpException('User to admin doesnt exists', HttpStatus.FORBIDDEN);
        const adminUserStatus = await this.joinedUserStatusRepository.findOne({ username: adminData.admin, channel });
        if (adminUserStatus && adminUserStatus.admin === true)
            throw new WsException('User is already admin in this channel');
            // throw new HttpException('User is already admin in this chat', HttpStatus.BAD_REQUEST);
        adminUserStatus.admin = true;
        await this.joinedUserStatusRepository.save(adminUserStatus);
        return ;
    }

    async unAdmin(adminData: AdminUserDto, user: UserEntity)
    {
        const channel = await this.chatUtilService.utils_2(adminData.name, user);
        const adminUser = await this.joinedUserRepository.findOne({ username: adminData.admin, channel });
        if (!adminUser || user.username === adminUser.username || adminUser.owner === true)
            throw new WsException('you dont have access to unadmin the user');
            // throw new HttpException('You dont have access to unadmin the user', HttpStatus.FORBIDDEN);
        const adminUserStatus = await this.joinedUserStatusRepository.findOne({ username: adminData.admin, channel });
        if (adminUserStatus && adminUserStatus.admin === false)
            throw new WsException('User is not admin in this channel');
            // throw new HttpException('User is not admin in this chat', HttpStatus.BAD_REQUEST);
        adminUserStatus.admin = false;
        await this.joinedUserStatusRepository.save(adminUserStatus);
        return ;
    }

    async setPassword(passwordData: SetPasswordDto, user: UserEntity)
    {
        if (!passwordData.password)
            throw new WsException('Please set a password');
            // throw new HttpException('Please set a password', HttpStatus.BAD_REQUEST);
        const channel = await this.chatUtilService.utils_2(passwordData.name, user);
        channel.password = passwordData.password;
        if (channel.status !== ChannelStatus.protected)
            channel.status = ChannelStatus.protected;
        await this.channelRepository.save(channel);
        return ;
    }

    async removePassword(channelName: string, user: UserEntity)
    {
        const channel = await this.chatUtilService.utils_2(channelName, user);
        channel.password = null;
        if (channel.status !== ChannelStatus.public)
            channel.status = ChannelStatus.public;
        await this.channelRepository.save(channel);
        return ;
    }

    async createDirectChannel(user: UserEntity, friend: UserEntity)
    {
        if (user.id === friend.id)
            throw new WsException('You cant create direct channel with yourself');
            // throw new HttpException('You cant create direct chat with yourself', HttpStatus.FORBIDDEN);
        if (await this.chatUtilService.getChannelByName("direct_with_" + user.username + "_" + friend.username) || await this.chatUtilService.getChannelByName("direct_with_" + friend.username + "_" + user.username))
            throw new WsException('You already have direct channel with him');
            // throw new HttpException('You already have direct chat with him', HttpStatus.FORBIDDEN);
        const joinedUser = await this.joinedUserRepository.create({
            user,
            username: user.username
        });
        await this.joinedUserRepository.save(joinedUser);
        const joinedUserStatus = await this.joinedUserStatusRepository.create({
            username: user.username, 
        });
        await this.joinedUserStatusRepository.save(joinedUserStatus);
        const joinedFriend = await this.joinedUserRepository.create({
            user: friend,
            username: friend.username
        });
        await this.joinedUserRepository.save(joinedFriend);
        const joinedFriendStatus = await this.joinedUserStatusRepository.create({
            username: friend.username, 
        });
        await this.joinedUserStatusRepository.save(joinedFriendStatus);
        const channelName = "direct_with_" + user.username + "_" + friend.username;
        const channel = await this.channelRepository.create({
            name: channelName,
            status: ChannelStatus.private,
            direct: true,
            joinedUsers: [joinedUser, joinedFriend],
            joinedUserStatus: [joinedUserStatus, joinedFriendStatus],
        });
        await this.channelRepository.save(channel);
        return channel;
    }

    async createMessageToChannel(data: CreateMessageToChatDto, user: UserEntity)
    {
        const channel = await this.chatUtilService.getChannelByName(data.name);
        if (channel)
        {
            if (!await this.joinedUserRepository.findOne({ user, channel }))
                throw new WsException('You are not member of this channel');
                // throw new HttpException('You are not member of this chat', HttpStatus.FORBIDDEN);
            const joinedUserStatus = await this.joinedUserStatusRepository.findOne({ channel, username: user.username });
            const time = new Date;
            if (joinedUserStatus && joinedUserStatus.banned > time)
                throw new WsException('You are banned from this channel');
                // throw new HttpException('You are banned from this chat', HttpStatus.FORBIDDEN);
            if (joinedUserStatus.muted > time)
                return ;
            const newMessage = await this.messageRepository.create({
                content: data.message,
                author: user,
                channel,
            });
            await this.messageRepository.save(newMessage);
            return newMessage;
        }
        throw new WsException('Channel doesnt exists');
        // throw new HttpException('Chat doesnt exists', HttpStatus.NOT_FOUND);
    }

    async getMessagesFromChannel(name: string, user: UserEntity)
    {
        const channel = await this.chatUtilService.getChannelByName(name);
        if (!channel)
            throw new WsException('Channel doesnt exists');
            // throw new HttpException('Chat doesnt exists', HttpStatus.NOT_FOUND);
        const messagesFromChat = await this.messageRepository.find({ channel })
        const allMessages: MessageEntity[] = [];
        for (const message of messagesFromChat)
            allMessages.push(message);
        return allMessages;
    }

    async getAllUsersFromChannel(channelId: number)
    {
        const channel = await this.chatUtilService.getChannelById(channelId);
        if (!channel)
            throw new WsException('Channel doesnt exists');
        const joinedUsers = await this.joinedUserRepository.find({ channel });
        if (!joinedUsers)
            throw new WsException('There is no users in channel');
        const users: UserEntity[] = [];
        for (const joinedUser of joinedUsers)
        {
            const user = await this.userService.getUserByName(joinedUser.username);
            users.push(user);
        }
        return users;
    }

    async getUserFromChannel(data: JoinedUserStatusDto)
    {
        const channel = await this.chatUtilService.getChannelByName(data.name);
        if (!channel)
            throw new WsException('Channel doesnt exists');
        const joinedUser = await this.joinedUserRepository.findOne({ username: data.target, channel });
        if (!joinedUser)
            throw new WsException('There is no users in channel');
        const user = await this.userService.getUserByName(joinedUser.username);
        return user;
    }
}
