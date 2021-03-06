import { Module } from '@nestjs/common';
import { ChatController } from './chat.controller';
import { ChatService } from './chat.service';
import { AuthModule } from 'src/auth/auth.module';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ChannelEntity } from './entities/channel.entity';
import { MessageEntity } from './entities/message.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([ChannelEntity, MessageEntity]),
    AuthModule
  ],
  exports: [ChatService],
  controllers: [ChatController],
  providers: [ChatService]
})
export class ChatModule {}
