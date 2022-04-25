import { Controller, Get, Param, Post, Req, Res, UseGuards } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { JwtGuard } from 'src/auth/guards/jwt.guard';
import { User } from 'src/decorators/user.decorator';
import { Repository } from 'typeorm';
import { ChannelService } from './channel.service';
import { ChannelEntity } from './entities/channel.entity';

@Controller('channel')
export class ChannelController {
// 	constructor (
// 		@InjectRepository(ChannelService)
// 		private channelRepository: Repository <ChannelEntity>
// 	) {}

	
	// @Post('create_channel')
	// @UseGuards(JwtGuard)
	// create_channel(
	// 	@Res() response: Response,
	// 	@User() user
	// ){
		
	// }
}
