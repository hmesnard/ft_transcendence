import { HttpException, HttpStatus, Injectable } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { WsException } from "@nestjs/websockets";
import { UserEntity } from "src/user/entities/user.entity";
import { UserService } from "src/user/user.service";
import { Repository } from "typeorm";
import { AdminUserDto, JoinedUserStatusDto } from "../dto/chat.dto";
import { ChannelEntity, ChannelStatus } from "../entities/channel.entity";
import { JoinedUserStatus } from "../entities/joinedUserStatus.entity";
import { MessageEntity } from "../entities/message.entity";

@Injectable()
export class ChatUtilsService
{
    constructor(@InjectRepository(ChannelEntity) private chatRepository: Repository<ChannelEntity>,
        @InjectRepository(MessageEntity) private messageRepository: Repository<MessageEntity>,
        @InjectRepository(JoinedUserStatus) private joinedUserStatusRepository: Repository<JoinedUserStatus>,
        private userService: UserService) {}

    async createNewJoinedUserStatus(owner: boolean, admin: boolean, muted: Date, banned: Date, channel: ChannelEntity, user: UserEntity)
    {
        const newUserStatus = await this.joinedUserStatusRepository.create({
            owner,
            admin,
            muted,
            banned,
            channel,
            user
        });
        await this.joinedUserStatusRepository.save(newUserStatus);
        return newUserStatus;
    }
    
    async createNewChannel(name: string, status: ChannelStatus, password: string, newJoinedUserStatus: JoinedUserStatus, member: UserEntity)
    {
        const newChannel = await this.chatRepository.create({
            name,
            status,
            password,
            joinedUserStatus: [newJoinedUserStatus],
            members: [member],
        });
        await this.chatRepository.save(newChannel);
    }

    async createNewMessage(content: string, author: UserEntity, channel: ChannelEntity)
    {
        const newMessage = await this.messageRepository.create({
            content,
            author,
            channel,
        });
        await this.messageRepository.save(newMessage);
        return newMessage;
    }
    
    async clientIsMember(user: UserEntity, channel: ChannelEntity): Promise<boolean>
    {
        for(var i = 0; i < channel.members.length; i++) {
            if (channel.members[i].id === user.id) {
                return true;
            }
        }
        return false;
    }

    channelIsDirect(channel: ChannelEntity, channelName: string) {
        if (channel !== undefined || channelName.includes("direct_with_") === true)
            throw new HttpException({status: HttpStatus.BAD_REQUEST, error: 'Channel already exists'}, HttpStatus.BAD_REQUEST);
    }

    userIsOwner(userStatus: JoinedUserStatus) {
        if (userStatus.owner === false)
            throw new HttpException('You dont have access, you are not owner of this channel', HttpStatus.FORBIDDEN);
    }

    channelIsPrivate(channel: ChannelEntity) {
        if (channel.status === ChannelStatus.private)
            throw new HttpException({status: HttpStatus.FORBIDDEN, error: 'This is a private channel, you dont have access to join here'}, HttpStatus.FORBIDDEN);
    }

    checkIfPassword(password: string) {
        if (!password)
            throw new HttpException({status: HttpStatus.BAD_REQUEST, error: 'Please insert a password'}, HttpStatus.BAD_REQUEST);
    }

    async checkClientIsMember(user: UserEntity, channel: ChannelEntity) {
        if (await this.clientIsMember(user, channel) === false)
            throw new HttpException('You are not member of this channel', HttpStatus.FORBIDDEN);
    }

    async paginate(page: number = 1): Promise<any>
    {
        const take = 15;
        const [channels, total] = await this.chatRepository.findAndCount({
            take,
            skip: (page - 1) * take
        });
        return { data: channels, meta: { total, page, last_page: Math.ceil(total / take)}};
    }

    async getAllChannels() {
        return await this.chatRepository.find();
    }

    async getJoinedUserStatus(user: UserEntity, channel: ChannelEntity)
    {
        const userStatus = await this.joinedUserStatusRepository.findOne({ user, channel });
        if (userStatus)
            return userStatus;
        throw new HttpException('You are not member of this channel', HttpStatus.FORBIDDEN);
    }

    async getChannelByName(channelName: string)
    {
        const channel = await this.chatRepository.findOne({ name: channelName })
        if (channel)
            return channel;
        throw new HttpException('Channel doesnt exists', HttpStatus.NOT_FOUND);
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
        const channel = await this.chatRepository.findOne(id);
        if (channel)
            return channel;
        throw new HttpException('Channel doesnt exists', HttpStatus.NOT_FOUND);
    }

    async utils(data: JoinedUserStatusDto, user: UserEntity)
    {
        const channel = await this.getChannelByName(data.name);
        this.userService.userIdIsSame(data.targetId, user.id);
        this.checkClientIsMember(user, channel);
        const userStatus = await this.getJoinedUserStatus(user, channel);
        if (userStatus.admin === false)
            throw new HttpException('You are not admin of this channel', HttpStatus.FORBIDDEN);
        const friend = await this.userService.getUserById_2(data.targetId);
        this.checkClientIsMember(friend, channel);
        const friendUserStatus = await this.getJoinedUserStatus(friend, channel);
        if (friendUserStatus.owner === true)
            throw new HttpException('You have no access to mute owner', HttpStatus.FORBIDDEN);
        return friendUserStatus;
    }

    async utils_2(adminData: AdminUserDto, user: UserEntity)
    {
        const channel = await this.getChannelByName(adminData.name);
        this.userService.userIdIsSame(adminData.adminId, user.id);
        this.checkClientIsMember(user, channel);
        const userStatus = await this.getJoinedUserStatus(user, channel);
        if (userStatus.owner === false)
            throw new HttpException('You are not owner of this channel', HttpStatus.FORBIDDEN);
        const friend = await this.userService.getUserById_2(adminData.adminId);
        this.checkClientIsMember(friend, channel);
        const friendUserStatus = await this.getJoinedUserStatus(friend, channel);
        return friendUserStatus;
    }

    async utils_3(channelName: string, user: UserEntity)
    {
        const channel = await this.getChannelByName(channelName);
        this.checkClientIsMember(user, channel);
        const userStatus = await this.getJoinedUserStatus(user, channel);
        if (userStatus.owner === false)
            throw new HttpException('You are not owner of this channel', HttpStatus.FORBIDDEN);
        return channel;
    }

    async deleteMessagesByUser(author: UserEntity)
    {
        const messages = await this.messageRepository.find({ author });
        if (!messages)
            return ;
        for (const message of messages)
            await this.messageRepository.delete(message.id);
        return ;
    }

    async deleteMessagesByChannel(channel: ChannelEntity)
    {
        const messages = await this.messageRepository.find({ channel });
        if (!messages)
            return ;
        for (const message of messages)
            await this.messageRepository.delete(message.id);
        return ;
    }

    async deleteJoinedUsersStatusByChannel(channel: ChannelEntity)
    {
        const joinedUsersStatus = await this.joinedUserStatusRepository.find({ channel });
        if (!joinedUsersStatus)
            return ;
        for (const joinedUserStatus of joinedUsersStatus)
            await this.joinedUserStatusRepository.delete(joinedUserStatus.id);
        return ;
    }

    async deleteJoinedUsersStatusByUser(user: UserEntity)
    {
        const joinedUsersStatus = await this.joinedUserStatusRepository.find({ user });
        if (!joinedUsersStatus)
            return ;
        for (const joinedUserStatus of joinedUsersStatus)
            await this.joinedUserStatusRepository.delete(joinedUserStatus.id);
        return ;
    }

    async saveMessage(content: string, user: UserEntity, channel: ChannelEntity)
    {
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