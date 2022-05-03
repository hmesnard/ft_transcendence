import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { UserService } from 'src/user/user.service';
import { Repository } from 'typeorm';
import { MatchDto } from './dto/match.dto';
import { MatchEntity } from './entities/match.entity';

@Injectable()
export class MatchService {
    constructor(
        @InjectRepository(MatchEntity)
        private matchRepository: Repository<MatchEntity>,
        private userService: UserService
    ) {}

    async saveMatch(matchData: MatchDto) {
        const match = this.matchRepository.create();

        match.homePlayer = await this.userService.findOneById(matchData.homePlayerId);
        match.awayPlayer = await this.userService.findOneById(matchData.awayPlayerId);
        match.winner = await this.userService.findOneById(matchData.winnerId);
        match.homeScore = matchData.homeScore;
        match.awayScore = matchData.awayScore;

        return this.matchRepository.save(match);
    }

    async getHomeMatches(id: number): Promise<MatchEntity[]> {
        return await this.matchRepository.find({ where: { homePlayer: id } });
    }

    async getAwayMatches(id: number): Promise<MatchEntity[]> {
        return await this.matchRepository.find({ where: { awayPlayer: id } });
    }

    async getMatches(id: number): Promise<MatchEntity[]> {
        return (await this.getHomeMatches(id)).concat(await this.getAwayMatches(id));
    }
}
