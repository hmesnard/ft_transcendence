import { Body, Controller, Post, UseGuards } from '@nestjs/common';
import { JwtGuard } from 'src/auth/guards/jwt.guard';
import { User } from 'src/decorators/user.decorator';
import { UserEntity } from 'src/user/entities/user.entity';
import { ChatService } from './chat.service';
import { CreateChannelDto } from './dto/create-channel.dto';

@Controller('chat')
export class ChatController {
    constructor(
        private chatService: ChatService
    ) {}

    @Post('channel')
    @UseGuards(JwtGuard)
    createChannel(
        @User() user: UserEntity,
        @Body() data: CreateChannelDto
    ) {
        
    }
}
