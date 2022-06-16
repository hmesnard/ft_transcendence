import axios from "axios";
import React, { SyntheticEvent, useEffect, useState } from "react";
import { Navigate } from "react-router";
import { io, Socket } from "socket.io-client";
import background from "../assets/the_pong.png";

export var mySocket: Socket | null = null;

type Props = {
    socket: Socket | null,
};

const SingIn = ({socket}: Props) =>
{
    const [redirect, setRedirect] = useState(false);

    if (redirect === false)
    {
        mySocket?.disconnect();
        socket?.disconnect();
    }

    const submit = async (e: SyntheticEvent) => {
        e.preventDefault();

        const myWindow = window.open('http://localhost:3000/auth/42');
        
        const interval = setInterval(async () => {
            try {
                const {data} = await axios.get('user');
                await axios.patch('user/nullsocket', {data});
                myWindow?.close();
                setRedirect(true);
                mySocket = io(`http://localhost:3000`, {withCredentials: true, transports: ['websocket']});
                clearInterval(interval);
            } catch (e) {}
        }, 1000);
    }

    if (redirect)
    {
        return <Navigate to={'/'} />
    }

    return(
        <div style={{ backgroundImage: `url(${background})` }}>
            <div>
            <form onSubmit={submit}>
                <button style={{
                    margin: '40vh 30vw', width: '300px', height: '200px',
                    backgroundColor: 'white', color: 'black', border: '2px solid black'
                    }} type="submit"><h1><b><mark>42 SignIn</mark></b></h1></button>
            </form>
            </div>
        </div>
    );
}

export default SingIn;

