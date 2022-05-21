import { Module } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import { PassportModule } from '@nestjs/passport';
import { MulterModule } from '@nestjs/platform-express';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AuthService } from 'src/auth/auth.service';
import { ChannelEntity } from 'src/chat/entities/channel.entity';
import { JoinedUserStatus } from 'src/chat/entities/joinedUserStatus.entity';
import { MessageEntity } from 'src/chat/entities/message.entity';
import { ChatService } from 'src/chat/service/chat.service';
import { ChatUtilsService } from 'src/chat/service/chatUtils.service';
import { UserEntity } from './entities/user.entity';
import { UserController } from './user.controller';
import { UserService } from './user.service';

@Module({
  imports: [
    TypeOrmModule.forFeature([UserEntity, ChannelEntity, MessageEntity, JoinedUserStatus]),
    MulterModule.register({dest: './pictures'}),
    PassportModule.register({ defaultStrategy: 'jwt' }),
    JwtModule.register({
      secret: process.env.JWT_SECRET,
      signOptions: { expiresIn: 3600 }
    })],
  exports: [UserService],
  controllers: [UserController],
  providers: [UserService, AuthService, ChatUtilsService, ChatService]
})
export class UserModule {}
