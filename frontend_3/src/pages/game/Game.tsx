import React, { Component, SyntheticEvent, useEffect, useState } from "react";
import Wrapper from "../../components/Wrapper";
import io, { Socket } from 'socket.io-client';
import background from "../../assets/pong.png";
import { Navigate } from "react-router";
import Profile from "../Profile";
import { User } from "../../models/user";
import axios from "axios";
import { setInterval } from "timers/promises";
import GameLoop from "./GameLoop";
import { sockets, user } from "../../components/Wrapper";

const Game = () =>
{
    const [place, setPlace] = useState<string | null>(null);
    const [paddleSize, setPaddleSize] = useState(4);
    const [paddleSpeed, setPaddleSpeed] = useState(1);
    const [ballSpeed, setBallSpeed] = useState(1);
    const [invitedUser, setInvitedUser] = useState<string | null>(null);
    const [matchMaking, setMatchMaking] = useState(false);
    const [player2, setPlayer2] = useState<User | null>(null);

    const submit = async (e: SyntheticEvent) => {
        e.preventDefault();
        setPlace("option");
    }

    if (sockets[0] !== undefined && user[0] !== undefined)
    {
        for (var i=0; i < sockets.length; i++)
        {
            if (sockets[i].id === user[0].socketId)
                sockets[i].emit("leave", { id: 4 });
        }
    }

    const options = async (e: SyntheticEvent) => {
        e.preventDefault();
        const {data} = await axios.get(`http://localhost:3000/user/get/user?username=${invitedUser}`);
        if (data === '')
        {
            // user not exists alert
            setPlace(null);
            return ;
        }
        setPlace("game");
    }

    if (place === "option")
    {
        return(
            <Wrapper>
                 <div style={{ width: "878px", height: "776px", backgroundImage: `url(${background})` }}>
                    <form onSubmit={options}>
                    <input style={{
                        background: "linear-gradient(81.4deg, #BC8F8F 0%, #CD5C5C 100%)",
                        margin: '250px 30px',
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
                        margin: '250px 30px',
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
                        margin: '150px 30px',
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
                        }} type="submit">Start Game</button>
                    </form>
            </div>
            </Wrapper>
        )
    }

    if (place === "game")
    {  
        // send invite to other player
        // game loop starts, but game dont start before invited user accept invite.

        return(
            <Wrapper>
                
                <p>paddleSize: {paddleSize}</p>
                <p>paddleSpeed: {paddleSpeed}</p>
                <p>ballSpeed: {ballSpeed}</p>
                <p>invitedUser: {invitedUser}</p>
            </Wrapper>
        )
        // return <GameLoop/>
      //  return <Navigate to={'/gameloop'} />
    }

    return(
        <Wrapper>
            <div style={{ width: "878px", height: "776px", backgroundImage: `url(${background})` }}>
                <div>
                    <form onSubmit={submit}>
                        <button style={{
                            background: "linear-gradient(81.4deg, #BC8F8F 0%, #CD5C5C 100%)",
                            margin: '30vh 25vw',
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
                </div>
            </div>
        </Wrapper>
    );
}
export default Game;