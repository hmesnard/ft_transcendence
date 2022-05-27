import { Injectable } from '@nestjs/common';
import { UserEntity } from 'src/user/entities/user.entity';
import { Ball, Canvas, Game, GameOptions, Paddle, Player, Sound } from './game.class';

@Injectable()
export class GameService
{
    constructor() {}

    private readonly defaultCanvas: Canvas = {
        h: 100,
        w: 200,
        hitpoint: 10
    };

    initPlayer1(user: UserEntity, gameOptions: GameOptions)
    {
        const paddle = this.initPaddle(gameOptions);
        const x = this.defaultCanvas.hitpoint;
        const y = this.defaultCanvas.h / 2;
        const player: Player = {
            player: user,
            x,
            y,
            paddle,
            color: 'red',
            score: 0
        };
        return player;
    }

    initPlayer2(user: UserEntity, gameOptions: GameOptions)
    {
        const paddle = this.initPaddle(gameOptions);
        const x = this.defaultCanvas.w - this.defaultCanvas.hitpoint;
        const y = this.defaultCanvas.h / 2;
        const player: Player = {
            player: user,
            x,
            y,
            paddle,
            color: 'blue',
            score: 0
        };
        return player;
    }

    initPaddle(gameOptions: GameOptions)
    {
        const h = (0.2 + (gameOptions.paddleSize - 1) * 0.1) * this.defaultCanvas.h;
        const w = 0.2 * 0.2 * this.defaultCanvas.h;
        const speed = 0.1 * (this.defaultCanvas.h / 2 - h);
        const paddle: Paddle = {
            h,
            w,
            speed
        };
        return paddle;
    }

    initBall(gameOptions: GameOptions)
    {
        const paddle = this.initPaddle(gameOptions);
        const x = this.defaultCanvas.w / 2;
        const y = this.defaultCanvas.h / 2;
        const size = paddle.w;
        var speed = gameOptions.ballSpeed;
        var speedX = Math.round((Math.random() * 100 - 3) % 6);
        var speedY = Math.round((Math.random() * 100 - 3) % 6);
        if (speedX === 0)
            speedX = 1;
        if (speedY === 0)
            speedY = -1;
        const ball: Ball = {
            x,
            y,
            speedX,
            speedY,
            speed,
            size,
            color: 'green'
        };
        return ball;
    }

    initSound()
    {
        const sound: Sound = {
            hit: true,
            wall: true,
            score: true,
            win: true,
            loose: true
        };
        return sound;
    }
}
