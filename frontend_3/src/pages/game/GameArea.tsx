import React, { useEffect, useState } from "react";
import { Socket } from "socket.io-client";
import Wrapper from "../../components/Wrapper";
import { BallClass, GameOptions, gameUpdate, PlayerClass, Sound } from "../../models/game";
import '../game/Game.css';

type Props = {
    socket: Socket | null,
    gameStart: string | null,
    gameUpdate: gameUpdate | null,
};

const GameArea = ({socket, gameStart, gameUpdate}: Props) =>
{
    // const [ballx, setBallx] = useState(0);
    const [player1, setPlayer1] = useState<PlayerClass | null>(null);
    const [player2, setPlayer2] = useState<PlayerClass | null>(null);
    const [ball, setBall] = useState<BallClass | null>(null);
    const [option, setOption] = useState<GameOptions | null>(null);
    const [name, setName] = useState('');
    const [sounds, setSounds] = useState<Sound | null>(null);
    const [finished, setFinished] = useState(false);

    window.addEventListener("keydown", function(event) {
        if (event.defaultPrevented)
            return ;  
        switch (event.key) {
            case "ArrowDown":
                socket?.emit('moveDownToServer');
                break ;
            case "ArrowUp":
                socket?.emit('moveUpToServer');
                break ;
            default:
                return ;
        }
        event.preventDefault();
    }, true);

    useEffect(() => {
        if (gameUpdate !== null)
        {
            setPlayer1(gameUpdate.player1);
            setPlayer2(gameUpdate.player2);
            setBall(gameUpdate.ball);
            setOption(gameUpdate.options);
            setName(gameUpdate.name);
            setSounds(gameUpdate.sounds);
            if (player1?.score === 10 || player2?.score === 10)
                setFinished(true);
        }
    }, [gameUpdate]);

    if (gameStart === null)
    {
        return(
            <Wrapper>
                waiting for the other player...
            </Wrapper>
        )
    }

    if (finished === true)
    {
        return (
            <Wrapper>
                Game finished
            </Wrapper>
        )
    }

    return(
        <Wrapper>
            {/* <div className="board">
                <div className='ball'>
                    <div className="ball_effect"></div>
                </div>
                <div className="paddle_1 paddle"></div>
                <div className="paddle_2  paddle"></div>
                <h1 className="player_1_score">0</h1>
                <h1 className="player_2_score">0</h1>
                <h1 className="message">
                    Score board
                </h1>
            </div> */}
            <div>
                ball:
                <br />
                y: {ball?.y}
                <br />
                x: {ball?.x}
                <br />
                size: {ball?.size}
                <br />
                player1:
                <br />
                user1: {player1?.user.username}
                <br />
                x: {player1?.x}
                <br />
                y: {player1?.y}
                <br />
                score: {player1?.score}
                <br />
                player2:
                <br />
                user2: {player2?.user.username}
                <br />
                x: {player2?.x}
                <br />
                y: {player2?.y}
                <br />
                score: {player2?.score}
                <br />
                options:
                <br />
                paddlesize: {option?.paddleSize}
                <br />
                paddlespeed: {option?.paddleSpeed}
                <br />
                ballSpeed: {option?.ballSpeed}
                <br />
                gamename: {name}
                {/* <br />
                sounds:
                <br />
                hit: {sounds?.hit.valueOf()}
                <br />
                wall: {sounds?.wall.valueOf()}
                <br />
                score: {sounds?.score.valueOf()}
                <br />
                win: {sounds?.win.valueOf()}
                <br />
                loose: {sounds?.loose.valueOf()} */}
            </div>
        </Wrapper>
    );
}

export default GameArea;