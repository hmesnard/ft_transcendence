import React, { Component, SyntheticEvent, useEffect, useState } from "react";
import Wrapper from "../../components/Wrapper";
import io, { Socket } from 'socket.io-client';
import background from "../../assets/pong.png";
import { Navigate } from "react-router";
import Profile from "../Profile";
import { User } from "../../models/user";
import axios from "axios";
import { GameClass } from "../../models/game";
import { mySocket } from '../SignIn';
import './Game.css';

type Props = {
    socket: Socket | null,
};

const Game = ({socket}: Props) =>
{
    const [place, setPlace] = useState<string | null>(null);
    const [paddleSize, setPaddleSize] = useState(4);
    const [paddleSpeed, setPaddleSpeed] = useState(1);
    const [ballSpeed, setBallSpeed] = useState(1);
    const [invitedUser, setInvitedUser] = useState<string | null>(null);
    const [matchMaking, setMatchMaking] = useState(false);
    const [player2, setPlayer2] = useState<User | null>(null);
    const [acceptInvite, setAcceptInvite] = useState(false);
    const [games, setGames] = useState<GameClass | null>(null);

    const emit = async (event: string) =>
    {
        console.log('emit event: ' + event);
        const response = await axios.get('user');
    }

    const submit = async (e: SyntheticEvent) => {
        e.preventDefault();
        setPlace("option");
    }

    const submit_spectator = async (e: SyntheticEvent) => {
        e.preventDefault();
        emit('getGamesToServer');
        setPlace("matches_list");
    }

    const options = async (e: SyntheticEvent) => {
        e.preventDefault();
        const {data} = await axios.get(`http://localhost:3000/user/get/user?username=${invitedUser}`);
        if (data === '')
        {
            window.alert(`User: (${invitedUser}) doesn't exists, try again`);
            setPlace(null);
            return ;
        }
        emit('addInviteToServer');
        setPlace("game");
    }

    const queue = async (e: SyntheticEvent) => {
        e.preventDefault();
        emit('JoinQueueToServer');
        setPlace("queue");
    }

    if (place === "game")
    {
        // send invite to other player
        // game loop starts when opponent accept invite, otherwise user is waiting.

        if (acceptInvite === false)
        {
            return(
                <Wrapper>
                    <p>Waiting other user to accept invite</p>
                </Wrapper>
            )
        }
        else
        {
            // sockets[0].on('JoinQueueToClient', (data) => {
            //     console.log(data);
            // });
            return(
                <Wrapper>
                    <p>game starts</p>
                </Wrapper>
            )
        }
    }

    useEffect(() => {
    if (place === "queue")
    {
        // looking for other player and game start when there is 2 or more in queue

        if (socket !== null && socket.connected === true)
        {
            socket.emit('JoinQueueToServer');
            socket.on('JoinQueueToClient', (data) => {
                console.log(data);
            });
        }
        else
        {
            if (mySocket !== null)
            {
                mySocket.emit('JoinQueueToServer');
                mySocket.on('JoinQueueToClient', (data) => {
                    console.log(data);
                });
            }
        }
        return () => 
        {
            if (socket !== null && socket.connected === true)
                socket.off('JoinQueueToClient');
            else
                if (mySocket !== null)
                    mySocket.off('JoinQueueToClient');
        }
    }
    });
    
    if (place === "queue")
    {
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
        )
    }

    if (place === "matches_list")
    {
        // All the games what is going on, and you can choose what game to spectate
        return(
            <Wrapper>
                <p>list of all going games</p>
            </Wrapper>
        )
    }

    if (place === "option")
    {
        return(
            <Wrapper>
                 <div style={{ width: "878px", height: "776px", backgroundImage: `url(${background})` }}>
                    <input style={{
                        background: "linear-gradient(81.4deg, #BC8F8F 0%, #CD5C5C 100%)",
                        // margin: '250px 30px',
                        padding: "13px 0",
                        width: "100px",
                        height: "50px",
                        border: "ridge",
                        borderColor: "gray",
                        borderRadius: "20px",
                        color: "white",
                        fontSize: "18px",
                        textAlign: "center",
                        fontWeight: "bold",
                        fontFamily: "Optima, sans-serif"
                    }} placeholder="invitedUser" onChange={e => setInvitedUser(e.target.value)}/>
                    <input style={{
                        background: "linear-gradient(81.4deg, #BC8F8F 0%, #CD5C5C 100%)",
                        // margin: '250px 30px',
                        padding: "13px 0",
                        width: "100px",
                        height: "50px",
                        border: "ridge",
                        borderColor: "gray",
                        borderRadius: "20px",
                        color: "white",
                        fontSize: "18px",
                        textAlign: "center",
                        fontWeight: "bold",
                        fontFamily: "Optima, sans-serif"
                    }} placeholder="paddleSize" required defaultValue={4} onChange={e => setPaddleSize(parseInt(e.target.value))}/>
                    <input style={{
                        background: "linear-gradient(81.4deg, #BC8F8F 0%, #CD5C5C 100%)",
                        padding: "13px 0",
                        width: "100px",
                        height: "50px",
                        border: "ridge",
                        borderColor: "gray",
                        borderRadius: "20px",
                        color: "white",
                        fontSize: "18px",
                        textAlign: "center",
                        fontWeight: "bold",
                        fontFamily: "Optima, sans-serif"
                    }} placeholder="paddleSpeed" size={19} required defaultValue={1} onChange={e => setPaddleSpeed(parseInt(e.target.value))}/>
                    <input style={{
                        background: "linear-gradient(81.4deg, #BC8F8F 0%, #CD5C5C 100%)",
                        // margin: '150px 30px',
                        padding: "13px 0",
                        width: "100px",
                        height: "50px",
                        border: "ridge",
                        borderColor: "gray",
                        borderRadius: "20px",
                        color: "white",
                        fontSize: "18px",
                        textAlign: "center",
                        fontWeight: "bold",
                        fontFamily: "Optima, sans-serif"
                    }} placeholder="ballSpeed" size={19} required defaultValue={1} onChange={e => setBallSpeed(parseInt(e.target.value))}/>
                    <div>
                    <form onSubmit={options}>
                        <button style={{
                            background: "linear-gradient(81.4deg, #BC8F8F 0%, #CD5C5C 100%)",
                            padding: "13px 0",
                            width: "200px",
                            height: "100px",
                            border: "ridge",
                            borderColor: "gray",
                            borderRadius: "20px",
                            color: "white",
                            fontWeight: "bold",
                            fontFamily: "Optima, sans-serif"
                        }} type="submit">Start Game With Invited User</button>
                    </form>
                    <form onSubmit={queue}>
                        <button style={{
                                background: "linear-gradient(81.4deg, #BC8F8F 0%, #CD5C5C 100%)",
                                padding: "13px 0",
                                width: "200px",
                                height: "100px",
                                border: "ridge",
                                borderColor: "gray",
                                borderRadius: "20px",
                                color: "white",
                                fontWeight: "bold",
                                fontFamily: "Optima, sans-serif"
                        }} type="submit">Join Queue And Start Game</button>
                    </form>
                    </div>
            </div>
            </Wrapper>
        )
    }

    return(
        <Wrapper>
            <div style={{ width: "878px", height: "776px", backgroundImage: `url(${background})` }}>
                <div>
                    <form onSubmit={submit}>
                        <button style={{
                            background: "linear-gradient(81.4deg, #BC8F8F 0%, #CD5C5C 100%)",
                            padding: "13px 0",
                            width: "200px",
                            height: "100px",
                            border: "ridge",
                            borderColor: "gray",
                            borderRadius: "20px",
                            color: "white",
                            fontWeight: "bold",
                            fontFamily: "Optima, sans-serif"
                        }} type="submit">Game Options</button>
                    </form>
                    <form onSubmit={submit_spectator}>
                        <button style={{
                            background: "linear-gradient(81.4deg, #BC8F8F 0%, #CD5C5C 100%)",
                            padding: "13px 0",
                            width: "200px",
                            height: "100px",
                            border: "ridge",
                            borderColor: "gray",
                            borderRadius: "20px",
                            color: "white",
                            fontWeight: "bold",
                            fontFamily: "Optima, sans-serif"
                        }} type="submit">On Going Games</button>
                    </form>
                </div>
            </div>
        </Wrapper>
    );
}
export default Game;