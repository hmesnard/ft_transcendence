import { Injectable } from '@nestjs/common';
import { UserEntity } from 'src/user/entities/user.entity';
import { Ball, Canvas, Dir, Game, GameOptions, Paddle, Player, Sound } from './game.class';

@Injectable()
export class GameService
{
    constructor() {}

    private readonly defaultCanvas: Canvas = {
        h: 20,
        w: 40,
    };

    // when player hits the ball
    setRandomBallDirection(x: number)
    {
        var direction: Dir;
        if (x === 1) // home player
            direction = Math.round((Math.random() * 100) % 3) + 4;
        if (x === 2) // away player
            direction = Math.round((Math.random() * 100) % 3) + 1;
        return direction;
    }

    // when ball hits top or bottom
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
        player.x = 3;
        player.y = this.defaultCanvas.h / 2;
        return player;
    }

    resetPlayer2(player: Player)
    {
        player.x = this.defaultCanvas.w - 3;
        player.y = this.defaultCanvas.h / 2;
        return player;
    }

    // returns true if player hits the ball, false if its a goal
    checkIfHomePlayerHitsBall(game: Game)
    {
        var size = game.players[0].paddle.h;
        if (game.ball.x <= 3 && game.ball.x >= 2)
            while (--size >= 0)
                if (game.players[0].y + size === game.ball.y)
                    return true;
        return false;
    }

    // returns true if player hits the ball, false if its a goal
    checkIfAwayPlayerHitsBall(game: Game)
    {
        var size = game.players[0].paddle.h;
        if (game.ball.x <= this.defaultCanvas.w - 3 && game.ball.x >= this.defaultCanvas.w - 2)
            while (--size >= 0)
                if (game.players[1].y + size === game.ball.y)
                    return true;
        return false;
    }

    // checks if ball position hits bottom or top, or if it's a goal. If it's not a goal, ball moves
    checkBallPosition(game: Game)
    {
        if (game.ball.x < 3)
        {
            if (this.checkIfHomePlayerHitsBall(game) === true)
            {
                game.sounds.hit = true;
                game.ball.direction = this.setRandomBallDirection(1);
            }
            else
                return this.goal(2, game);
        }
        else if (game.ball.x > this.defaultCanvas.w - 3)
        {
            if (this.checkIfAwayPlayerHitsBall(game) === true)
            {
                game.sounds.hit = true;
                game.ball.direction = this.setRandomBallDirection(2);
            }
            else
                return this.goal(1, game);
        }
        else if (game.ball.y > this.defaultCanvas.h - 1 || game.ball.y < 1)
        {
            game.sounds.wall = true;
            game.ball.direction = this.changeBallDirection(game.ball.direction);
        }
        game.ball = this.moveBall(game.ball);
        return game;
    }

    goal(num: number, game: Game)
    {
        game.sounds.score = true;
        if (num === 1)
            game.players[0].score++;
        else if (num === 2)
            game.players[1].score++;
        if (game.players[0].score === 10)
        {
            game.sounds.win = true;
            game.sounds.loose = true;
            game.winner = game.players[0];
            game.finished = true;
        }
        else if (game.players[1].score === 10)
        {
            game.sounds.win = true;
            game.sounds.loose = true;
            game.winner = game.players[1];
            game.finished = true;
        }
        game.ball = this.resetBall(game.ball);
        game.players[0] = this.resetPlayer1(game.players[0]);
        game.players[1] = this.resetPlayer2(game.players[1]);
        return game;
    }

    movePlayerUp(player: Player)
    {
        if (player.y < this.defaultCanvas.h - player.paddle.h)
            player.y += player.paddle.speed;
        return player;
    }

    movePlayerDown(player: Player)
    {
        if (player.y > 0)
            player.y -= player.paddle.speed;
        return player;
    }

    moveBall(ball: Ball)
    {
        switch (ball.direction)
        {
            case Dir.STOP:
                break;
            case Dir.LEFT:
                ball.x -= ball.speed;
                break;
            case Dir.RIGHT:
                ball.x += ball.speed;
                break;
            case Dir.UPLEFT:
                ball.x -= ball.speed;
                ball.y += ball.speed;
                break;
            case Dir.DOWNLEFT:
                ball.x -= ball.speed;
                ball.y -= ball.speed;
                break;
            case Dir.UPRIGHT:
                ball.x += ball.speed;
                ball.y += ball.speed;
                break;
            case Dir.DOWNRIGHT:
                ball.x += ball.speed;
                ball.y -= ball.speed;
            default:
                break;
        }
        return ball;
    }

    initPlayer1(user: UserEntity, gameOptions: GameOptions)
    {
        const player: Player = {
            player: user,
            x: 3,
            y: this.defaultCanvas.h / 2 - gameOptions.paddleSize / 2,
            paddle: this.initPaddle(gameOptions),
            color: 'red',
            score: 0
        };
        return player;
    }

    initPlayer2(user: UserEntity, gameOptions: GameOptions)
    {
        const player: Player = {
            player: user,
            x: this.defaultCanvas.w - 3,
            y: this.defaultCanvas.h / 2 - gameOptions.paddleSize / 2,
            paddle: this.initPaddle(gameOptions),
            color: 'blue',
            score: 0
        };
        return player;
    }

    initPaddle(gameOptions: GameOptions)
    {
        const paddle: Paddle = {
            h: gameOptions.paddleSize,
            w: 1,
            speed: gameOptions.paddleSpeed
        };
        return paddle;
    }

    initBall(gameOptions: GameOptions)
    {
        const ball: Ball = {
            x: this.defaultCanvas.w / 2,
            y: this.defaultCanvas.h / 2,
            direction: Dir.STOP,
            speed: gameOptions.ballSpeed,
            size: 1,
            color: 'green'
        };
        return ball;
    }

    initSound()
    {
        const sound: Sound = {
            hit: false,
            wall: false,
            score: false,
            win: false,
            loose: false
        };
        return sound;
    }
}
