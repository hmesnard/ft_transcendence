import React, { Component, SyntheticEvent, useEffect, useState } from "react";
import Wrapper from "../../components/Wrapper";
import io, { Socket } from 'socket.io-client';
import background from "../../assets/pong.png";
import { Navigate } from "react-router";
import Profile from "../Profile";
import { User } from "../../models/user";
import axios from "axios";
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
    const [acceptInvite, setAcceptInvite] = useState(false);

    const submit = async (e: SyntheticEvent) => {
        e.preventDefault();
        setPlace("option");
    }

    // use useState later, this is temporary for testing
    var setPasswordDto = { name: "name", password: "password" };
    var createMessageToChatDto = { name: "name", message: "message" };
    var gameRoom = { room: "room" };

    if (sockets[0] !== undefined && user[0] !== undefined)
    {
        if (sockets[0].id === user[0].socketId)
        {
            // // user joins to chat room
            // sockets[0].emit("joinToServer", setPasswordDto);
            // // user leaves from the chat room
            // sockets[0].emit("leaveToServer", 1);
            // // send message to channel
            // sockets[0].emit("msgToServer", createMessageToChatDto);
            // // invite user to play game
            // sockets[0].emit("addInviteToServer", 1);
            // // accept invite from player and start game
            // sockets[0].emit("acceptInviteToServer", /* invited user */);
            // // leave and end game
            // sockets[0].emit("leaveGameToServer", gameRoom);
            // // join queue
            // sockets[0].emit("JoinQueueToServer");
            // // leave queue
            // sockets[0].emit("leaveQueueToServer");
            // // join to gameroom as spectator
            // sockets[0].emit("newSpectatorToServer", gameRoom);
            // // move paddle up
            // sockets[0].emit("moveUpToServer");
            // // move paddle down
            // sockets[0].emit("moveDownToServer");
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

    const queue = async (e: SyntheticEvent) => {
        e.preventDefault();
        setPlace("queue");
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
            return(
                <Wrapper>
                    <p>game starts</p>
                </Wrapper>
            )
        }
    }

    if (place === "queue")
    {
        // looking for other player and game start when there is 2 or more in queue
        
        return(
            <Wrapper>
                <p>game starts wiht matchmaking system</p>
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