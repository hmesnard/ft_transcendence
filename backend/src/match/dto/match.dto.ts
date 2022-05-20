import { IsNotEmpty, IsNumber } from "class-validator";

export class MatchDto {

    @IsNotEmpty()
    @IsNumber()
    homePlayerId: number;

    @IsNotEmpty()
    @IsNumber()
    awayPlayerId: number;

    @IsNotEmpty()
    @IsNumber()
    winnerId: number;

    @IsNotEmpty()
    @IsNumber()
    homeScore: number;

    @IsNotEmpty()
    @IsNumber()
    awayScore: number;
}