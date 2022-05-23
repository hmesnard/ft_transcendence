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
    private chatUtilService: ChatUtilsService,
    private userService: UserService) {}

    async inviteUserToPrivateChannel(data: JoinedUserStatusDto, user: UserEntity)
    {
        const channel = await this.chatUtilService.getChannelByName(data.name);
        const userStatus = await this.chatUtilService.getJoinedUserStatus(user, channel);
        const friend = await this.userService.getUserById_2(data.targetId);
        const friendUserStatus = await this.joinedUserStatusRepository.findOne({ user: friend, channel });
        await this.userService.isblocked(user, friend);
        this.userService.userIdIsSame(data.targetId, user.id);
        this.chatUtilService.checkClientIsMember(user, channel);
        this.chatUtilService.userIsOwner(userStatus);
        if (await this.chatUtilService.clientIsMember(friend, channel) === true)
            throw new HttpException({status: HttpStatus.FORBIDDEN, error: 'User is already in this chat'}, HttpStatus.FORBIDDEN);
        if (!friendUserStatus)
            await this.chatUtilService.createNewJoinedUserStatus(false, false, null, null, channel, friend); 
        channel.members.push(friend);
        await this.chatRepository.save(channel);
        return ;
    }

    async createPublicChannel(channelName: string, user: UserEntity)
    {
        const channel = await this.chatRepository.findOne({ name: channelName });
        this.chatUtilService.channelIsDirect(channel, channelName);
        const newJoinedUserStatus = await this.chatUtilService.createNewJoinedUserStatus(true, true, null, null, channel, user);
        return await this.chatUtilService.createNewChannel(channelName, ChannelStatus.public, null, newJoinedUserStatus, user);
    }

    async createPrivateChannel(channelName: string, user: UserEntity)
    {
        const channel = await this.chatRepository.findOne({ name: channelName });
        this.chatUtilService.channelIsDirect(channel, channelName);
        const newJoinedUserStatus = await this.chatUtilService.createNewJoinedUserStatus(true, true, null, null, channel, user);
        return await this.chatUtilService.createNewChannel(channelName, ChannelStatus.private, null, newJoinedUserStatus, user);
    }

    async createProtectedChannel(channelData: SetPasswordDto, user: UserEntity)
    {
        const channel = await this.chatRepository.findOne({ name: channelData.name});
        this.chatUtilService.channelIsDirect(channel, channelData.name);
        this.chatUtilService.checkIfPassword(channelData.password);
        const newJoinedUserStatus = await this.chatUtilService.createNewJoinedUserStatus(true, true, null, null, channel, user);
        return await this.chatUtilService.createNewChannel(channelData.name, ChannelStatus.protected, channelData.password, newJoinedUserStatus, user);
    }

    async deleteChannel(id: number, user: UserEntity)
    {
        const channel = await this.chatUtilService.getChannelById(id);
        const userStatus = await this.chatUtilService.getJoinedUserStatus(user, channel);
        this.chatUtilService.userIsOwner(userStatus);
        await this.chatUtilService.deleteMessagesByChannel(channel);
        await this.chatUtilService.deleteJoinedUsersStatusByChannel(channel);
        await this.chatRepository.delete(channel.id);
        return ;
    }

    async kickUserFromChannel(data: JoinedUserStatusDto, user: UserEntity)
    {
        const channel = await this.chatUtilService.getChannelByName(data.name);
        const friend = await this.userService.getUserById_2(data.targetId);
        const userStatus = await this.chatUtilService.getJoinedUserStatus(user, channel);
        this.userService.userIdIsSame(data.targetId, user.id);
        this.chatUtilService.userIsOwner(userStatus);
        this.chatUtilService.checkClientIsMember(friend, channel);
        channel.members = channel.members.filter((friend) => {return friend.id !== data.targetId});
        await this.chatRepository.save(channel);
        return ;
    }

    async leaveChannel(id: number, user: UserEntity)
    {
        const channel = await this.chatUtilService.getChannelById(id);
        const userStatus = await this.chatUtilService.getJoinedUserStatus(user, channel);
        for (const member of channel.members)
        {
            if (member.id === user.id)
            {
                var id2 = user.id;
                userStatus.owner = false;
                await this.joinedUserStatusRepository.save(userStatus);
            }
        }
        channel.members = channel.members.filter((user) => {return id2 !== user.id});
        await this.chatRepository.save(channel);
        if (channel.members.length === 0)
        {
            await this.chatUtilService.deleteMessagesByChannel(channel);
            await this.chatUtilService.deleteJoinedUsersStatusByChannel(channel);
            await this.chatRepository.delete(channel.id);
        }
        return ;
    }

    async joinChannel(channelData: SetPasswordDto, user: UserEntity)
    {
        const channel = await this.chatUtilService.getChannelByName(channelData.name);
        this.chatUtilService.channelIsPrivate(channel);
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
                await this.chatUtilService.createNewJoinedUserStatus(false, false, null, null, channel, user);
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
        await this.userService.isblocked(user, friend);
        this.userService.userIdIsSame(user.id, friend.id);
        if (await this.chatRepository.findOne({ name: `direct_with_${user.id}_${friend.id}` }) || await this.chatRepository.findOne({ name: `direct_with_${friend.id}_${user.id}` }))
            throw new HttpException('You already have direct channel with him', HttpStatus.FORBIDDEN);
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
        this.chatUtilService.checkClientIsMember(user, channel);
        const joinedUserStatus = await this.chatUtilService.getJoinedUserStatus(user, channel);
        const time = new Date;
        if (joinedUserStatus.banned > time)
            throw new HttpException('You are banned from this channel', HttpStatus.FORBIDDEN);
        if (joinedUserStatus.muted > time)
            return ;
        return await this.chatUtilService.createNewMessage(data.message, user, channel);
    }

    async getMessagesFromChannel(name: string, user: UserEntity)
    {
        const channel = await this.chatUtilService.getChannelByName(name);
        const messagesFromChannel = await this.messageRepository.find({ channel: channel })
        const allMessages: MessageEntity[] = [];
        for (const message of messagesFromChannel)
            allMessages.push(message);
        return allMessages;
    }

    async getAllUsersFromChannel(channelId: number)
    {
        const channel = await this.chatUtilService.getChannelById(channelId);
        return channel.members;
    }

    async getUserFromChannel(data: JoinedUserStatusDto)
    {
        const channel = await this.chatUtilService.getChannelByName(data.name);
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