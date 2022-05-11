import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { WsException } from '@nestjs/websockets';
import { Socket } from 'socket.io';
import { AuthService } from 'src/auth/auth.service';
import { UserEntity } from 'src/user/entities/user.entity';
import { Repository } from 'typeorm';
import { ChatEntity } from './entities/chat.entity';
import { MessageEntity } from './entities/message.entity';

@Injectable()
export class ChatService {
    constructor(
        @InjectRepository(ChatEntity)
        private chatRepository: Repository<ChatEntity>,
        @InjectRepository(MessageEntity)
        private messageRepository: Repository<MessageEntity>,
        private authService: AuthService
    ) {}

    async getUserFromSocket(socket: Socket) {
        const cookie = socket.handshake.headers.cookie;
        //const { access_token: authenticationToken } = parse(cookie); //Parse cookie if necessary (https://wanago.io/2021/01/25/api-nestjs-chat-websockets/)
        const user = await this.authService.getUserFromAuthenticationToken(cookie);
        if (!user) {
          throw new WsException('Invalid credentials.');
        }
        console.log(user);
        return user;
    }

    async getChatById(id: number): Promise<ChatEntity> {
        return await this.chatRepository.findOne(id);
    }

    async clientIsMember(user: UserEntity, chat: ChatEntity): Promise<boolean> {
        for(var i = 0; i < chat.members.length; i++) {
            if (chat.members[i].id === user.id) {
                return true;
            }
        }
        return false;
    }

    async saveMessage(content: string, user: UserEntity, chat: ChatEntity) {
        let message = this.messageRepository.create({
            content: content,
            author: user,
            chat: chat
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
