import { IsNotEmpty } from "class-validator";

export class MatchDto {

    @IsNotEmpty()
    homePlayerId: number;

    @IsNotEmpty()
    awayPlayerId: number;

    @IsNotEmpty()
    winnerId: number;

    @IsNotEmpty()
    homeScore: number;

    @IsNotEmpty()
    awayScore: number;
}