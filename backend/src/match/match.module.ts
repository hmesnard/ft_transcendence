import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { UserModule } from 'src/user/user.module';
import { MatchEntity } from './entities/match.entity';
import { MatchController } from './match.controller';
import { MatchService } from './match.service';

@Module({
  imports: [
    TypeOrmModule.forFeature([MatchEntity]),
    UserModule
  ],
  controllers: [MatchController],
  providers: [MatchService]
})
export class MatchModule {}
