import { UserEntity } from "src/user/entities/user.entity";

export class Game
{
    id: number;
    options: GameOptions;
    players: Player[];
    spectators?: UserEntity[];
    finished: boolean;
    winner?: Player;
    name: string;
}

export class Player
{
    player: UserEntity;
    x?: number;
    y?: number;
    paddle?: Paddle;
    color?: string;
    score?: number;
}

export class Paddle
{
    h: number;
    w: number;
    speed: number;
}

export class GameOptions
{
    paddleSize: number;
    ballSpeed: number;
}

export class Sound
{
    hit: boolean;
    wall: boolean;
    score: boolean;
    win: boolean;
    loose: boolean;
}

export class Invites
{
    sender: UserEntity;
    invitedUser: UserEntity;
}