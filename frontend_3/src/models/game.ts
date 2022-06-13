import { User } from "./user";

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

export class GameClass
{
    constructor(
        public options: GameOptions,
        public players: Player[],
        public spectators: User,
        public finished: boolean,
        public winner: Player,
        public name: string,
        public ball: Ball,
        public sounds: Sound,
    ){}
}

export class Player
{
    constructor(
        public player: User,
        public x: number,
        public y: number,
        public paddle: Paddle,
        public color: string,
        public score: number,
    ) {}
}

export class Ball
{
    constructor(
        public x: number,
        public y: number,
        public direction: Dir,
        public speed: number,
        public size: number,
        public color: string,
    ) {}
}

export class Paddle
{
    constructor(
        public h: number,
        public w: number,
        public speed: number,
    ) {}
}

export class GameOptions
{
    constructor(
        public paddleSize: number,
        public paddleSpeed: number,
        public ballSpeed: number,
        // map:
    ) {}
}

export class Sound
{
    constructor(
        public hit: boolean,
        public wall: boolean,
        public score: boolean,
        public win: boolean,
        public loose: boolean,
    ) {}
}

export class Canvas
{
    constructor(
        public h: number,
        public w: number,
    ) {}
}