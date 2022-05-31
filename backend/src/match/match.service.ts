import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { UserEntity, UserLevel } from 'src/user/entities/user.entity';
import { UserService } from 'src/user/user.service';
import { Repository } from 'typeorm';
import { MatchDto } from './dto/match.dto';
import { MatchEntity } from './entities/match.entity';

@Injectable()
export class MatchService
{
    constructor(
        @InjectRepository(MatchEntity) private matchRepository: Repository<MatchEntity>,
        @InjectRepository(UserEntity) private userRepository: Repository<UserEntity>,
        private userService: UserService
    ) {}

    async addUserRank(user: UserEntity)
    {
        const map1 = new Map();
        const allPlayers = await this.userRepository.find();
        for (const player of allPlayers)
            map1.set(player.id, player.wins - player.losses);
        const mapSort1 = new Map([...map1.entries()].sort((a, b) => b[1] - a[1]));
        const index = mapSort1.get(user.id);
        user.rank = index;
        await this.userRepository.save(user);
    }

    async addNewLevel(user: UserEntity)
    {
        if (user.wins - user.losses > 5)
            user.level = UserLevel.advanced;
        if (user.wins - user.losses > 10)
            user.level = UserLevel.pro;
        if (user.wins - user.losses > 15)
            user.level = UserLevel.expert;
        await this.userRepository.save(user);   
    }

    async addNewStats(homePlayer: UserEntity, awayPlayer: UserEntity, winner: UserEntity)
    {
        if (winner.id === homePlayer.id)
        {
            homePlayer.wins++;
            awayPlayer.losses++;
        }
        else
        {   awayPlayer.wins++;
            homePlayer.losses++;
        }
        await this.userRepository.save(homePlayer);
        await this.userRepository.save(awayPlayer);
    }

    async saveMatch(matchData: MatchDto) {
        const match = this.matchRepository.create();

        match.homePlayer = await this.userService.getUserById(matchData.homePlayerId);
        match.awayPlayer = await this.userService.getUserById(matchData.awayPlayerId);
        match.winner = await this.userService.getUserById(matchData.winnerId);
        match.homeScore = matchData.homeScore;
        match.awayScore = matchData.awayScore;

        await this.addNewStats(match.homePlayer, match.awayPlayer, match.winner);
        await this.addNewLevel(match.homePlayer);
        await this.addNewLevel(match.awayPlayer);
        await this.addUserRank(match.homePlayer);
        await this.addUserRank(match.awayPlayer);

        return this.matchRepository.save(match);
    }

    async getHomeMatches(id: number): Promise<MatchEntity[]>
    {
        return await this.matchRepository.find({ where: { homePlayer: id } });
    }

    async getAwayMatches(id: number): Promise<MatchEntity[]>
    {
        return await this.matchRepository.find({ where: { awayPlayer: id } });
    }

    async getMatches(id: number): Promise<MatchEntity[]>
    {
        return (await this.getHomeMatches(id)).concat(await this.getAwayMatches(id));
    }
}
