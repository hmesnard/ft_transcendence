import { Body, Controller, Get, Post, UseGuards } from '@nestjs/common';
import { JwtGuard } from 'src/auth/guards/jwt.guard';
import { User } from 'src/decorators/user.decorator';
import { UserEntity } from 'src/user/entities/user.entity';
import { MatchDto } from './dto/match.dto';
import { MatchService } from './match.service';

@Controller('match')
export class MatchController
{
    constructor(
        private matchService: MatchService
    ) {}

    @Post()
    saveMatch(@Body() matchData: MatchDto)
    {
        return this.matchService.saveMatch(matchData);
    }

    @Get()
    @UseGuards(JwtGuard)
    getMatches(@User() user: UserEntity)
    {
        return this.matchService.getMatches(user.id);
    }
}
