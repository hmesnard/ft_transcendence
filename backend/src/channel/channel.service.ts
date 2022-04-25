import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { New_Channel } from './dto/channel.dto';
import { ChannelEntity } from './entities/channel.entity';

@Injectable()
export class ChannelService {
	constructor(
		@InjectRepository(ChannelEntity)
		private ChannelRepository : Repository<ChannelEntity>
	) {}

	// async create_channel(new_channel : New_Channel, user): Promise<ChannelEntity> {
	
	// }
}
