import { Controller, Get, Param, Post, Req } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { ChannelService } from './channel.service';
import { ChannelEntity } from './entities/channel.entity';

@Controller('channel')
export class ChannelController {
	constructor (
		@InjectRepository(ChannelService)
		private channelRepository: Repository <ChannelEntity>
	) {}

	// @Get('')

	@Post('/:id/create_channel')
	create_channel(
		@Param(':id') id: string,
	){}
}
