import { Injectable } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { WsException } from "@nestjs/websockets";
import { UserEntity } from "src/user/entities/user.entity";
import { Repository } from "typeorm";
import { JoinedUserStatusDto } from "../dto/chat.dto";
import { ChannelEntity } from "../entities/channel.entity";
import { JoinedUser } from "../entities/joinedUser.entity";
import { JoinedUserStatus } from "../entities/joinedUserStatus.entity";
import { MessageEntity } from "../entities/message.entity";

@Injectable()
export class ChatUtilsService
{
    constructor(@InjectRepository(ChannelEntity) private channelRepository: Repository<ChannelEntity>,
        @InjectRepository(JoinedUser) private joinedUserRepository: Repository<JoinedUser>,
        @InjectRepository(MessageEntity) private messageRepository: Repository<MessageEntity>,
        @InjectRepository(JoinedUserStatus) private joinedUserStatusRepository: Repository<JoinedUserStatus>) {}

    async getAllChannels()
    {
        return await this.channelRepository.find();
    }

    async getChannelByName(channelName: string)
    {
        const channel = await this.channelRepository.findOne({ name: channelName });
        if (channel)
            return channel;
        return ; 
    }

    async getMessageById(id: number)
    {
        const message = await this.messageRepository.findOne(id);
        if (message)
            return message;
        return ;
    }

    async getChannelById(id: number)
    {
        const channel = await this.channelRepository.findOne(id);
        if (channel)
            return channel;
        return ;
    }

    async utils(data: JoinedUserStatusDto, user: UserEntity)
    {
        const channel = await this.getChannelByName(data.name);
        if (!channel)
            throw new WsException('Channel doesnt exists');
            // throw new HttpException('Chat doesnt exists', HttpStatus.NOT_FOUND);
        if (!await this.joinedUserRepository.findOne({ user, channel }))
            throw new WsException('You are not memeber of this channel');
            // throw new HttpException('You are not member of this chat', HttpStatus.FORBIDDEN);
        const joinedUserStatus = await this.joinedUserStatusRepository.findOne({ username: user.username, channel });
        if (joinedUserStatus && joinedUserStatus.admin === false)
            throw new WsException('You are not admin of this channel');
            // throw new HttpException('You are not admin of this chat', HttpStatus.FORBIDDEN);
        if (!await this.joinedUserRepository.findOne({ username: data.target }))
            throw new WsException('Selected user doesnt exists');
            // throw new HttpException('Selected user doesnt exists', HttpStatus.NOT_FOUND);
        const targetUserStatus = await this.joinedUserStatusRepository.findOne({ username: data.target, channel });
        if (targetUserStatus && user.username === targetUserStatus.username)
            throw new WsException('You have no access to choose yourself');
            // throw new HttpException('You have no access to choose yourself', HttpStatus.FORBIDDEN);
        return targetUserStatus;
    }

    async utils_2(channelName: string, user: UserEntity)
    {
        const channel = await this.getChannelByName(channelName);
        if (!channel)
            throw new WsException('Channel doesnt exists');
            // throw new HttpException('Chat doesnt exists', HttpStatus.NOT_FOUND);
        const joinedUser = await this.joinedUserRepository.findOne({ user, channel });
        if (!joinedUser)
            throw new WsException('You are not member of this channel');
            // throw new HttpException('You are not member of this chat', HttpStatus.FORBIDDEN);
        if (joinedUser.owner === false)
            throw new WsException('You are already member of this channel');
            // throw new HttpException('You dont have access, you are not owner of this chat', HttpStatus.FORBIDDEN);
        return channel;
    }

    async deleteMessagesByUser(user: UserEntity)
    {
        const messages = await this.messageRepository.find({ author: user });
        if (!messages)
            return ;
        for (const message of messages)
            await this.messageRepository.delete(message);
        return ;
    }

    async deleteMessagesByChannel(channel: ChannelEntity)
    {
        const messages = await this.messageRepository.find({ channel });
        if (!messages)
            return ;
        for (const message of messages)
            await this.messageRepository.delete(message);
        return ;
    }

    async deleteJoinedUsersByUser(user: UserEntity)
    {
        const joinedUsers = await this.joinedUserRepository.find({ user });
        if (!joinedUsers)
            return ;
        for (const joinedUser of joinedUsers)
            await this.joinedUserRepository.delete(joinedUser);
        return ;
    }

    async deleteJoinedUsersByChannel(channel: ChannelEntity)
    {
        const joinedUsers = await this.joinedUserRepository.find({ channel });
        if (!joinedUsers)
            return ;
        for (const joinedUser of joinedUsers)
            await this.joinedUserRepository.delete(joinedUser);
        return ;
    }

    async deleteJoinedUsersStatusByChannel(channel: ChannelEntity)
    {
        const joinedUsersStatus = await this.joinedUserStatusRepository.find({ channel });
        if (!joinedUsersStatus)
            return ;
        for (const joinedUserStatus of joinedUsersStatus)
            await this.joinedUserStatusRepository.delete(joinedUserStatus);
        return ;
    }

    async deleteJoinedUsersStatusByUser(user: UserEntity)
    {
        const joinedUsersStatus = await this.joinedUserStatusRepository.find({ username: user.username });
        if (!joinedUsersStatus)
            return ;
        for (const joinedUserStatus of joinedUsersStatus)
            await this.joinedUserStatusRepository.delete(joinedUserStatus);
        return ;
    }
}