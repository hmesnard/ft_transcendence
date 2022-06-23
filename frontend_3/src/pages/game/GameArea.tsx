import React, { useEffect, useState } from "react";
import { Socket } from "socket.io-client";
import Wrapper from "../../components/Wrapper";
import { gameUpdate } from "../../models/game";
import '../game/Game.css';

type Props = {
    socket: Socket | null,
    gameStart: string | null,
    gameUpdate: gameUpdate | null,
};

const GameArea = ({socket, gameStart, gameUpdate}: Props) =>
{
    // const [ballx, setBallx] = useState(0);

    // useEffect(() => {
    //     if (gameUpdate !== null)
    //         setBallx(gameUpdate.ball.x)
    // }, [gameUpdate]);

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
            {/* <div>
                {ballx}
            </div> */}
            <p>game starts wiht matchmaking system</p>
        </Wrapper>
    );
}

export default GameArea;