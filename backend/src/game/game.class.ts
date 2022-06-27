import { UserEntity } from "src/user/entities/user.entity";

export enum Dir
{
    STOP = 0,
    LEFT = 1,
    UPLEFT = 2,
    DOWNLEFT = 3,
    RIGHT = 4,
    UPRIGHT = 5,
    DOWNRIGHT = 6
}

export class Game
{
    id: number;
    options: GameOptions;
    players: Player[];
    spectators?: UserEntity[];
    finished: boolean;
    winner?: Player;
    name: string;
    ball: Ball;
    sounds: Sound;
    intervalId?: NodeJS.Timer;
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

export class Ball
{
    x: number;
    y: number;
    direction: Dir;
    speed: number;
    size: number;
    color: string;
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
    paddleSpeed: number;
    ballSpeed: number;
    // map:
}

export class Sound
{
    hit: boolean;
    wall: boolean;
    score: boolean;
    win: boolean;
    loose: boolean;
}

export class Canvas
{
    h: number;
    w: number;
}

export class Invites
{
    sender: UserEntity;
    invitedUser: UserEntity;
}

export class gameNames
{
    id: number;
    name: string;
}