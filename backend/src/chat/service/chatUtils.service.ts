import { HttpException, HttpStatus, Injectable } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { WsException } from "@nestjs/websockets";
import { UserEntity } from "src/user/entities/user.entity";
import { UserService } from "src/user/user.service";
import { Repository } from "typeorm";
import { AdminUserDto, JoinedUserStatusDto } from "../dto/chat.dto";
import { ChannelEntity } from "../entities/channel.entity";
import { JoinedUserStatus } from "../entities/joinedUserStatus.entity";
import { MessageEntity } from "../entities/message.entity";

@Injectable()
export class ChatUtilsService
{
    constructor(@InjectRepository(ChannelEntity) private channelRepository: Repository<ChannelEntity>,
        @InjectRepository(MessageEntity) private messageRepository: Repository<MessageEntity>,
        @InjectRepository(JoinedUserStatus) private joinedUserStatusRepository: Repository<JoinedUserStatus>,
        private userService: UserService) {}

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

    async clientIsMember(user: UserEntity, chat: ChannelEntity): Promise<boolean> {
        for(var i = 0; i < chat.members.length; i++) {
            if (chat.members[i].id === user.id) {
                return true;
            }
        }
        return false;
    }

    async getAllChannels()
    {
        return await this.channelRepository.find();
    }

    async getChannelByName(channelName: string)
    {
        const channel = await this.channelRepository.findOne({ name: channelName })
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
            throw new HttpException('Channel doesnt exists', HttpStatus.NOT_FOUND);
        if (data.targetId === user.id)
            throw new HttpException('You have no access to choose yourself', HttpStatus.FORBIDDEN);
        if (await this.clientIsMember(user, channel) === false)
            throw new HttpException('You are not member of this channel', HttpStatus.FORBIDDEN);
        const userStatus = await this.joinedUserStatusRepository.findOne({ user, channel });
        if (userStatus.admin === false)
            throw new HttpException('You are not admin of this channel', HttpStatus.FORBIDDEN);
        const friend = await this.userService.getUserById(data.targetId);
        if (!friend)
            throw new HttpException('Selected user doesnt exists', HttpStatus.NOT_FOUND);
        if (await this.clientIsMember(friend, channel) === false)
            throw new HttpException('Selected user is not member of this channel', HttpStatus.FORBIDDEN);
        const friendUserStatus = await this.joinedUserStatusRepository.findOne({ user: friend, channel });
        if (friendUserStatus.owner === true)
            throw new HttpException('You have no access to mute owner', HttpStatus.FORBIDDEN);
        return friendUserStatus;
    }

    async utils_2(adminData: AdminUserDto, user: UserEntity)
    {
        const channel = await this.getChannelByName(adminData.name);
        if (!channel)
            throw new HttpException('Channel doesnt exists', HttpStatus.NOT_FOUND);
        if (adminData.adminId === user.id)
            throw new HttpException('You have no access to choose yourself', HttpStatus.FORBIDDEN);
        if (await this.clientIsMember(user, channel) === false)
            throw new HttpException('You are not member of this channel', HttpStatus.FORBIDDEN);
        const userStatus = await this.joinedUserStatusRepository.findOne({ user, channel });
        if (userStatus.owner === false)
            throw new HttpException('You are not owner of this channel', HttpStatus.FORBIDDEN);
        const friend = await this.userService.getUserById(adminData.adminId);
        if (!friend)
            throw new HttpException('Selected user doesnt exists', HttpStatus.NOT_FOUND);
        if (await this.clientIsMember(friend, channel) === false)
            throw new HttpException('Selected user is not member of this channel', HttpStatus.FORBIDDEN);
        const friendUserStatus = await this.joinedUserStatusRepository.findOne({ user: friend, channel });
        return friendUserStatus;
    }

    async utils_3(channelName: string, user: UserEntity)
    {
        const channel = await this.getChannelByName(channelName);
        if (!channel)
            throw new HttpException('Channel doesnt exists', HttpStatus.NOT_FOUND);
        if (await this.clientIsMember(user, channel) === false)
            throw new HttpException('You are not member of this channel', HttpStatus.FORBIDDEN);
        const userStatus = await this.joinedUserStatusRepository.findOne({ user, channel });
        if (userStatus.owner === false)
            throw new HttpException('You are not owner of this channel', HttpStatus.FORBIDDEN);
        return channel;
    }

    // async deleteMessagesByUser(user: User)
    // {
    //     const messages = await this.messageRepository.find({ user });
    //     if (!messages)
    //         return ;
    //     for (const message of messages)
    //         await this.messageRepository.delete(message);
    //     return ;
    // }

    // async deleteMessagesByChannel(channel: ChannelEntity)
    // {
    //     const messages = await this.messageRepository.find({ channel });
    //     if (!messages)
    //         return ;
    //     for (const message of messages)
    //         await this.messageRepository.delete(message);
    //     return ;
    // }

    async deleteJoinedUsersStatusByChannel(channel: ChannelEntity)
    {
        const joinedUsersStatus = await this.joinedUserStatusRepository.find({ channel });
        if (!joinedUsersStatus)
            return ;
        for (const joinedUserStatus of joinedUsersStatus)
            await this.joinedUserStatusRepository.delete(joinedUserStatus);
        return ;
    }

    // async deleteJoinedUsersStatusByUser(user: User)
    // {
    //     const joinedUsersStatus = await this.joinedUserStatusRepository.find({ user });
    //     if (!joinedUsersStatus)
    //         return ;
    //     for (const joinedUserStatus of joinedUsersStatus)
    //         await this.joinedUserStatusRepository.delete(joinedUserStatus);
    //     return ;
    // }
}