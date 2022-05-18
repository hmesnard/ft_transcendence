import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { UserEntity } from 'src/user/entities/user.entity';
import { UserService } from 'src/user/user.service';
import { Repository } from 'typeorm';
import { AdminUserDto, CreateMessageToChatDto, JoinedUserStatusDto, SetPasswordDto } from '../dto/chat.dto';
import { ChannelEntity, ChannelStatus } from '../entities/channel.entity';
import { JoinedUserStatus } from '../entities/joinedUserStatus.entity';
import { MessageEntity } from '../entities/message.entity';
import { ChatUtilsService } from './chatUtils.service';

@Injectable()
export class ChatService
{
    constructor(@InjectRepository(ChannelEntity) private chatRepository: Repository<ChannelEntity>,
    @InjectRepository(MessageEntity) private messageRepository: Repository<MessageEntity>,
    @InjectRepository(JoinedUserStatus) private joinedUserStatusRepository: Repository<JoinedUserStatus>,
    @InjectRepository(UserEntity) private userRepository: Repository<UserEntity>,
    private chatUtilService: ChatUtilsService,
    private userService: UserService) {}

    async inviteUserToPrivateChannel(data: JoinedUserStatusDto, user: UserEntity)
    {
        const channel = await this.chatUtilService.getChannelByName(data.name);
        if (!channel)
            throw new HttpException('Channle doesnt exists', HttpStatus.NOT_FOUND);
        if (data.targetId === user.id)
            throw new HttpException('You have no access to choose yourself', HttpStatus.FORBIDDEN);
        if (await this.chatUtilService.clientIsMember(user, channel) === false)
            throw new HttpException('You are not member of this channel', HttpStatus.FORBIDDEN);
        const userStatus = await this.joinedUserStatusRepository.findOne({ user, channel });
        if (userStatus.owner === false)
            throw new HttpException('You are not owner of this channel', HttpStatus.FORBIDDEN);
        const friend = await this.userService.getUserById(data.targetId);
        if (!friend)
            throw new HttpException('Selected user doesnt exists', HttpStatus.NOT_FOUND);
        if (await this.chatUtilService.clientIsMember(friend, channel) === true)
            throw new HttpException('Selected user is already in channel', HttpStatus.FORBIDDEN);
        const friendUserStatus = await this.joinedUserStatusRepository.findOne({ user: friend, channel });
        if (!friendUserStatus)
        {
            const newFriendUserStatus = await this.joinedUserStatusRepository.create({
                user,
                channel
            });
            await this.joinedUserStatusRepository.save(newFriendUserStatus);
        }
        channel.members.push(friend);
        await this.chatRepository.save(channel);
        return ;
    }

    async createPublicChannel(channelName: string, user: UserEntity)
    {
        const channel = await this.chatUtilService.getChannelByName(channelName);
        if (channel || channelName.includes("direct_with_") === true)
            throw new HttpException({status: HttpStatus.BAD_REQUEST, error: 'Channel already exists'}, HttpStatus.BAD_REQUEST);
        const newJoinedUserStatus = await this.joinedUserStatusRepository.create({
            owner: true,
            admin: true,
            channel,
            user,
        });
        await this.joinedUserStatusRepository.save(newJoinedUserStatus);
        const newChannel = await this.chatRepository.create({
            name: channelName,
            status: ChannelStatus.public,
            members: [user],
            joinedUserStatus: [newJoinedUserStatus],
        });
        await this.chatRepository.save(newChannel);
        return newChannel;
    }

    async createPrivateChannel(channelName: string, user: UserEntity)
    {
        const channel = await this.chatUtilService.getChannelByName(channelName);
        if (channel || channelName.includes("direct_with_") === true)
            throw new HttpException({status: HttpStatus.BAD_REQUEST, error: 'Channel already exists'}, HttpStatus.BAD_REQUEST);
        const newJoinedUserStatus = await this.joinedUserStatusRepository.create({
            owner: true,
            admin: true,
            channel,
            user,
        });
        await this.joinedUserStatusRepository.save(newJoinedUserStatus);
        const newChannel = await this.chatRepository.create({
            name: channelName,
            status: ChannelStatus.private,
            members: [user],
            joinedUserStatus: [newJoinedUserStatus],
        });
        await this.chatRepository.save(newChannel);
        return newChannel;
    }

    async createProtectedChannel(channelData: SetPasswordDto, user: UserEntity)
    {
        const channel = await this.chatUtilService.getChannelByName(channelData.name);
        if (channel || channelData.name.includes("direct_with_") === true)
            throw new HttpException({status: HttpStatus.BAD_REQUEST, error: 'Channel already exists'}, HttpStatus.BAD_REQUEST);
        if (!channelData.password)
            throw new HttpException({status: HttpStatus.BAD_REQUEST, error: 'Please insert a password'}, HttpStatus.BAD_REQUEST);
        const newJoinedUserStatus = await this.joinedUserStatusRepository.create({
            owner: true,
            admin: true,
            channel,
            user,
        });
        await this.joinedUserStatusRepository.save(newJoinedUserStatus);
        const newChannel = await this.chatRepository.create({
            name: channelData.name,
            status: ChannelStatus.protected,
            password: channelData.password,
            members: [user],
            joinedUserStatus: [newJoinedUserStatus],
        });
        await this.chatRepository.save(newChannel);
        return newChannel;
    }

    ////// Complains: Cannot query across many-to-many for property members ////////
    // async deleteChannel(id: number, user: UserEntity)
    // {
    //     const channel = await this.chatUtilService.getChannelById(id);
    //     if (!channel)
    //         throw new HttpException({status: HttpStatus.NOT_FOUND, error: 'Channel doesnt exists'}, HttpStatus.NOT_FOUND);
    //     const UserStatus = await this.joinedUserStatusRepository.findOne({ user, channel });
    //     if (!UserStatus)
    //         throw new HttpException({status: HttpStatus.NOT_FOUND, error: 'You are not member of this channel'}, HttpStatus.NOT_FOUND);
    //     if (UserStatus.owner === false)
    //         throw new HttpException({status: HttpStatus.FORBIDDEN, error: 'You dont have access to delete this channel, only owner can do that'}, HttpStatus.FORBIDDEN);
    //     for (var i = 0; i < channel.members.length; i++)
    //     {
    //         channel.members.pop();
    //     }
    //     await this.chatRepository.save(channel);
    //     await this.chatUtilService.deleteJoinedUsersStatusByChat(channel);
    //     await this.chatRepository.delete(channel);
    //     return ;
    // }

    async kickUserFromChannel(data: JoinedUserStatusDto, user: UserEntity)
    {
        const channel = await this.chatUtilService.getChannelByName(data.name);
        if (!channel)
            throw new HttpException('Channel doesnt exists', HttpStatus.NOT_FOUND);
        const friend = await this.userService.getUserById(data.targetId);
        if (!friend)
            throw new HttpException('User doesnt exists', HttpStatus.NOT_FOUND);
        if (friend.id === user.id)
            throw new HttpException('You cant kick yourself', HttpStatus.FORBIDDEN);
        const userStatus = await this.joinedUserStatusRepository.findOne({ user, channel });
        if (!userStatus)
            throw new HttpException('You are not member of this channel', HttpStatus.FORBIDDEN);
        if (userStatus.owner === false)
            throw new HttpException('You dont have access, you are not owner of this channel', HttpStatus.FORBIDDEN);
        if (await this.chatUtilService.clientIsMember(friend, channel) === false)
            throw new HttpException({status: HttpStatus.NOT_FOUND, error: 'User is not in this channel'}, HttpStatus.NOT_FOUND);
        channel.members = channel.members.filter((friend) => {return friend.id !== data.targetId});
        await this.chatRepository.save(channel);
        return ;
    }

    async leaveChannel(id: number, user: UserEntity)
    {
        const channel = await this.chatUtilService.getChannelById(id);
        if (!channel)
            throw new HttpException({status: HttpStatus.NOT_FOUND, error: 'Channel doesnt exists'}, HttpStatus.NOT_FOUND);
        const userStatus = await this.joinedUserStatusRepository.findOne({ user, channel });
        if (!userStatus)
            throw new HttpException('You are not member of this channel', HttpStatus.FORBIDDEN);
        for (const member of channel.members)
        {
            if (member.id === user.id)
            {
                userStatus.owner = false;
                await this.joinedUserStatusRepository.save(userStatus);
            }
        }
        channel.members = channel.members.filter((user) => {return user.id !== user.id});
        await this.chatRepository.save(channel);
        return ;
    }

    async joinChannel(channelData: SetPasswordDto, user: UserEntity)
    {
        const channel = await this.chatUtilService.getChannelByName(channelData.name);
        if (!channel)
            throw new HttpException({status: HttpStatus.NOT_FOUND, error: 'Channel doesnt exists'}, HttpStatus.NOT_FOUND);
        if (channel.status === ChannelStatus.private)
            throw new HttpException({status: HttpStatus.FORBIDDEN, error: 'This is a private channel, you dont have access to join here'}, HttpStatus.FORBIDDEN);
        if (channel.status === ChannelStatus.direct && (channel.name.includes("direct_with_") === false || channel.name.includes(`${user.id}`) === false))
            throw new HttpException({status: HttpStatus.FORBIDDEN, error: 'This is a direct channel, you dont have access to join here'}, HttpStatus.FORBIDDEN);
        if (await this.chatUtilService.clientIsMember(user, channel) === true)
            throw new HttpException({status: HttpStatus.BAD_REQUEST, error: 'You are already member of this channel'}, HttpStatus.BAD_REQUEST);
        const userStatus = await this.joinedUserStatusRepository.findOne({ user, channel });
        if (userStatus)
        {
            if (userStatus.banned !== null)
            {
                const time = new Date;
                if (userStatus.banned > time)
                    throw new HttpException({status: HttpStatus.FORBIDDEN, error: 'You are banned from this channel, you dont have access to join here'}, HttpStatus.FORBIDDEN);
                userStatus.banned = null;
                await this.joinedUserStatusRepository.save(userStatus);
            }
        }
        if (channelData.password === channel.password || channel.status === ChannelStatus.public)
        {
            if (!userStatus)
            {
                const newUserStatus = await this.joinedUserStatusRepository.create({
                    user,
                    channel
                });
                await this.joinedUserStatusRepository.save(newUserStatus);
            }
            channel.members.push(user);
            await this.chatRepository.save(channel);
            return ;
        }
        throw new HttpException({status: HttpStatus.FORBIDDEN, error: 'Wrong password, please try again'}, HttpStatus.FORBIDDEN);
    }

    async muteUser(data: JoinedUserStatusDto, user: UserEntity)
    {
        const targetUserStatus = await this.chatUtilService.utils(data, user);
        const time = new Date;
        if (targetUserStatus.muted > time)
            throw new HttpException('User is already muted in this channel', HttpStatus.BAD_REQUEST);
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
            throw new HttpException('User is not muted in this channel', HttpStatus.BAD_REQUEST);
        targetUserStatus.muted = null;
        await this.joinedUserStatusRepository.save(targetUserStatus);
        return ;
    }

    async banUser(data: JoinedUserStatusDto, user: UserEntity)
    {
        const targetUserStatus = await this.chatUtilService.utils(data, user);
        const time = new Date;
        if (targetUserStatus.banned > time)
            throw new HttpException('User is already banned in this channel', HttpStatus.BAD_REQUEST);
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
            throw new HttpException('User is not banned in this channel', HttpStatus.BAD_REQUEST);
        targetUserStatus.banned = null;
        await this.joinedUserStatusRepository.save(targetUserStatus);
        return ;
    }

    async giveAdmin(adminData: AdminUserDto, user: UserEntity)
    {
        const targetUserStatus = await this.chatUtilService.utils_2(adminData, user);
        if (targetUserStatus.admin === true)
            throw new HttpException('User is already admin in this channel', HttpStatus.BAD_REQUEST);
        targetUserStatus.admin = true;
        await this.joinedUserStatusRepository.save(targetUserStatus);
        return ;
    }

    async unAdmin(adminData: AdminUserDto, user: UserEntity)
    {
        const targetUserStatus = await this.chatUtilService.utils_2(adminData, user);
        if (targetUserStatus.admin === false)
            throw new HttpException('User is not admin in this channel', HttpStatus.BAD_REQUEST);
        targetUserStatus.admin = false;
        await this.joinedUserStatusRepository.save(targetUserStatus);
        return ;
    }

    async setPassword(passwordData: SetPasswordDto, user: UserEntity)
    {
        if (!passwordData.password)
            throw new HttpException('Please set a password', HttpStatus.BAD_REQUEST);
        const channel = await this.chatUtilService.utils_3(passwordData.name, user);
        channel.password = passwordData.password;
        if (channel.status !== ChannelStatus.protected)
            channel.status = ChannelStatus.protected;
        await this.chatRepository.save(channel);
        return ;
    }

    async removePassword(channelName: string, user: UserEntity)
    {
        const channel = await this.chatUtilService.utils_3(channelName, user);
        channel.password = null;
        if (channel.status !== ChannelStatus.public)
            channel.status = ChannelStatus.public;
        await this.chatRepository.save(channel);
        return ;
    }

    async createDirectChannel(user: UserEntity, friend: UserEntity)
    {
        if (user.id === friend.id)
            throw new HttpException('You cant create direct channel with yourself', HttpStatus.FORBIDDEN);
        if (await this.chatUtilService.getChannelByName("direct_with_" + user.id + "_" + friend.id) || await this.chatUtilService.getChannelByName("direct_with_" + friend.id + "_" + user.id))
            throw new HttpException('You already have direct chat with him', HttpStatus.FORBIDDEN);
        const joinedUserStatus = await this.joinedUserStatusRepository.create({
            user,
        });
        await this.joinedUserStatusRepository.save(joinedUserStatus);
        const joinedFriendStatus = await this.joinedUserStatusRepository.create({
            user: friend, 
        });
        await this.joinedUserStatusRepository.save(joinedFriendStatus);
        const channelName = "direct_with_" + user.id + "_" + friend.id;
        const channel = await this.chatRepository.create({
            name: channelName,
            status: ChannelStatus.direct,
            members: [user, friend],
            joinedUserStatus: [joinedUserStatus, joinedFriendStatus],
        });
        await this.chatRepository.save(channel);
        return channel;
    }

    async createMessageToChannel(data: CreateMessageToChatDto, user: UserEntity)
    {
        const channel = await this.chatUtilService.getChannelByName(data.name);
        if (channel)
        {
            if (await this.chatUtilService.clientIsMember(user, channel) === false)
                throw new HttpException('You are not member of this channel', HttpStatus.FORBIDDEN);
            const joinedUserStatus = await this.joinedUserStatusRepository.findOne({ user, channel });
            const time = new Date;
            if (joinedUserStatus.banned > time)
                throw new HttpException('You are banned from this channel', HttpStatus.FORBIDDEN);
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
        throw new HttpException('Channel doesnt exists', HttpStatus.NOT_FOUND);
    }

    async getMessagesFromChannel(name: string, user: UserEntity)
    {
        const channel = await this.chatUtilService.getChannelByName(name);
        if (!channel)
            throw new HttpException('Channel doesnt exists', HttpStatus.NOT_FOUND);
        const messagesFromChat = await this.messageRepository.find({ channel })
        const allMessages: MessageEntity[] = [];
        for (const message of messagesFromChat)
        {
            allMessages.push(message);
        }
        return allMessages;
    }

    async getAllUsersFromChannel(channelId: number)
    {
        const channel = await this.chatUtilService.getChannelById(channelId);
        if (!channel)
            throw new HttpException({status: HttpStatus.NOT_FOUND, error: 'Channel doesnt exists'}, HttpStatus.NOT_FOUND);
        return channel.members;
    }

    async getUserFromChannel(data: JoinedUserStatusDto)
    {
        const channel = await this.chatUtilService.getChannelByName(data.name);
        if (!channel)
            throw new HttpException({status: HttpStatus.NOT_FOUND, error: 'Channel doesnt exists'}, HttpStatus.NOT_FOUND);
        for (const member of channel.members)
            if (member.id === data.targetId)
                return member;
        return ;
    }

    async getChannelsFromUser(userId: number)
    {
        const AllChannels = await this.chatUtilService.getAllChannels();
        const ChannelsfromUser: ChannelEntity[] = [];
        for (const channel of AllChannels)
            for (const member of channel.members)
                if (member.id === userId)
                    ChannelsfromUser.push(channel);
        return ChannelsfromUser;
    }
}