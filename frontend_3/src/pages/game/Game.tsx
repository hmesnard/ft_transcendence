import React, { SyntheticEvent, useEffect, useState } from "react";
import Wrapper from "../../components/Wrapper";
import { Socket } from 'socket.io-client';
import background from "../../assets/pong.png";
import { User } from "../../models/user";
import axios from "axios";
import { GameClass, gameNames } from "../../models/game";
import './Game.css';
import { Navigate } from "react-router";

type Props = {
    socket: Socket | null,
    games: gameNames[],
};

const Game = ({socket, games}: Props) =>
{
    const [place, setPlace] = useState<string | null>(null);
    const [paddleSize, setPaddleSize] = useState(4);
    const [paddleSpeed, setPaddleSpeed] = useState(1);
    const [ballSpeed, setBallSpeed] = useState(1);
    const [invitedUser, setInvitedUser] = useState<string | null>(null);
    const [matchMaking, setMatchMaking] = useState(false);
    const [player2, setPlayer2] = useState<User | null>(null);
    const [acceptInvite, setAcceptInvite] = useState(false);
    const [allGames, setAllGames] = useState<GameClass | null>(null);
    const [name, setName] = useState('');

    const emit = async (event: string) =>
    {
        console.log('emit event: ' + event);
        const response = await axios.get('user');
    }

    const spectatorJoin = async (e: SyntheticEvent) =>
    {
      e.preventDefault();
      setPlace("queue"); // change it later, go to spectating game
    }

    const submit = async (e: SyntheticEvent) => {
        e.preventDefault();
        setPlace("option");
    }

    const submit_spectator = async (e: SyntheticEvent) => {
        e.preventDefault();
        socket?.emit('getGamesToServer');
        // emit('getGamesToServer');
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
        socket?.emit('JoinQueueToServer');
        // emit('JoinQueueToServer');
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

        socket?.emit('JoinQueueToServer');
    }
    }, []);
    
    if (place === "queue")
    {
        return <Navigate to={'/gamearea'} />;
    }

    if (place === "matches_list")
    {
        return(
            <Wrapper>
                <div>
                <table className="table table-striped table-sm"> 
                    <thead>
                    <tr>
                        <th scope="col">#</th>
                        <th scope="col">name</th>
                        <th scope="col">join</th>
                    </tr>
                    </thead>
                    <tbody>
                    {games.map((game: gameNames) => {
                        return (
                        <tr key={game.id}>
                            <td>{game.id}</td>
                            <td>{game.name}</td>
                            <td>
                            <form onSubmit={spectatorJoin}>
                                <button onClick={e => setName(game.name)} type="submit">Join as spectator</button>
                            </form>
                            </td>
                        </tr>  
                        )
                    })}
                    </tbody>
                </table>
                </div>
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