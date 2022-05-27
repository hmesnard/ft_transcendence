import { Injectable } from '@nestjs/common';
import { UserEntity } from 'src/user/entities/user.entity';
import { Ball, Canvas, Dir, Game, GameOptions, Paddle, Player, Sound } from './game.class';

@Injectable()
export class GameService
{
    constructor() {}

    private readonly defaultCanvas: Canvas = {
        h: 100,
        w: 200,
        hitpoint: 10
    };

    setRandomBallDirection(x: number)
    {
        var direction: Dir;
        if (x === 1) // home player
            direction = Math.round((Math.random() * 100) % 3) + 4;
        if (x === 2) // away player
            direction = Math.round((Math.random() * 100) % 3) + 1;
        return direction;
    }

    // when ball hits top and bottom
    changeBallDirection(direction: Dir)
    {
        if (direction === Dir.DOWNLEFT)
            direction = Dir.UPLEFT;
        else if (direction === Dir.UPLEFT)
            direction = Dir.DOWNLEFT;
        else if (direction === Dir.DOWNRIGHT)
            direction = Dir.UPRIGHT;
        else if (direction === Dir.UPRIGHT)
            direction = Dir.DOWNRIGHT;
        return direction;
    }

    resetBall(ball: Ball)
    {
        ball.direction = Dir.STOP;
        ball.x = this.defaultCanvas.w / 2;
        ball.y = this.defaultCanvas.h / 2;
        return ball;
    }

    resetPlayer1(player: Player)
    {
        player.x = this.defaultCanvas.hitpoint;
        player.y = this.defaultCanvas.h / 2;
        return player;
    }

    resetPlayer2(player: Player)
    {
        player.x = this.defaultCanvas.w - this.defaultCanvas.hitpoint;
        player.y = this.defaultCanvas.h / 2;
        return player;
    }

    goal(num: number, game: Game)
    {
        if (num === 1)
            game.players[0].score++;
        else if (num === 2)
            game.players[1].score++;
        if (game.players[0].score === 10)
        {
            game.winner = game.players[0];
            game.finished = true;
        }
        else if (game.players[1].score === 10)
        {
            game.winner = game.players[1];
            game.finished = true;
        }
        game.ball = this.resetBall(game.ball);
        game.players[0] = this.resetPlayer1(game.players[0]);
        game.players[1] = this.resetPlayer2(game.players[1]);
        return game;
    }

    moveBall(ball: Ball)
    {
        switch (ball.direction)
        {
            case Dir.STOP:
                break;
            case Dir.LEFT:
                ball.x--;
                break;
            case Dir.RIGHT:
                ball.x++;
                break;
            case Dir.UPLEFT:
                ball.x--;
                ball.y++;
                break;
            case Dir.DOWNLEFT:
                ball.x--;
                ball.y--;
                break;
            case Dir.UPRIGHT:
                ball.x++;
                ball.y++;
                break;
            case Dir.DOWNRIGHT:
                ball.x++;
                ball.y--;
            default:
                break;
        }
        return ball;
    }

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
        var direction = Dir.STOP;
        const ball: Ball = {
            x,
            y,
            direction,
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
