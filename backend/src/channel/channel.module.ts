import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ChannelController } from './channel.controller';
import { ChannelService } from './channel.service';
import { ChannelEntity } from './entities/channel.entity';

@Module({
  imports: [TypeOrmModule.forFeature([ChannelEntity])],
  exports: [ChannelService],
  controllers: [ChannelController],
  providers: [ChannelService]
})
export class ChannelModule {}
