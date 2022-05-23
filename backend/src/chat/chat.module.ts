import { Module } from '@nestjs/common';
import { ChatController } from './chat.controller';
import { ChatService } from './service/chat.service';
import { AuthModule } from 'src/auth/auth.module';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ChannelEntity } from './entities/channel.entity';
import { MessageEntity } from './entities/message.entity';
import { JoinedUserStatus } from './entities/joinedUserStatus.entity';
import { UserService } from 'src/user/user.service';
import { ChatUtilsService } from './service/chatUtils.service';
import { UserEntity } from 'src/user/entities/user.entity';
import { JwtModule } from '@nestjs/jwt';
import { PassportModule } from '@nestjs/passport';

@Module({
  imports: [
    TypeOrmModule.forFeature([ChannelEntity, MessageEntity, JoinedUserStatus, UserEntity]),
    AuthModule, PassportModule.register({ defaultStrategy: 'jwt' }), JwtModule.register({
      secret: process.env.JWT_SECRET,
      signOptions: { expiresIn: 3600 }
    })
  ],
  exports: [ChatService, ChatUtilsService],
  controllers: [ChatController],
  providers: [ChatService, UserService, ChatUtilsService]
})
export class ChatModule {}
