import React from "react";
import { Socket } from "socket.io-client";
import Wrapper from "../../components/Wrapper";
import '../game/Game.css';

type Props = {
    socket: Socket | null,
    gameStart: string | null,
};

const GameArea = ({socket, gameStart}: Props) =>
{
    if (gameStart === null)
    {
        return(
            <Wrapper>
                waiting for the other player...
            </Wrapper>
        )
    }

    return(
        <Wrapper>
            <div className="board">
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
            </div>
            <p>game starts wiht matchmaking system</p>
        </Wrapper>
    );
}

export default GameArea;