import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { WsException } from '@nestjs/websockets';
import { Socket } from 'socket.io';
import { AuthService } from 'src/auth/auth.service';
import { UserEntity } from 'src/user/entities/user.entity';
import { Repository } from 'typeorm';
import { ChannelEntity } from './entities/channel.entity';
import { MessageEntity } from './entities/message.entity';

@Injectable()
export class ChatService {
    constructor(
        @InjectRepository(ChannelEntity)
        private channelRepository: Repository<ChannelEntity>,
        @InjectRepository(MessageEntity)
        private messageRepository: Repository<MessageEntity>,
        private authService: AuthService
    ) {}

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
