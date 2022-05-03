import { Body, Controller, Post } from '@nestjs/common';
import { MatchDto } from './dto/match.dto';
import { MatchService } from './match.service';

@Controller('match')
export class MatchController {
    constructor(
        private matchService: MatchService
    ) {}

    @Post()
    saveMatch(
        @Body() matchData: MatchDto
    ) {
        return this.matchService.saveMatch(matchData);
    }
}
