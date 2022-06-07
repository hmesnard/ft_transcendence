import axios from "axios";
import React, { SyntheticEvent, useEffect, useState } from "react";
import { Navigate } from "react-router";
import background from "../assets/the_pong.png";
import io, { Socket } from 'socket.io-client';

const SingIn = () =>
{
    const [redirect, setRedirect] = useState(false);
  //  const [socket, setSocket] = useState();

    const submit = async (e: SyntheticEvent) => {
        e.preventDefault();

        const myWindow = window.open('http://localhost:3000/auth/42');
        
        const interval = setInterval(async () => {
            try {
                await axios.get('user');
                myWindow?.close();
                setRedirect(true);
                const newSocket = io(`http://localhost:3000/game`, {withCredentials: true, transports: ['websocket']});
                console.log(newSocket);
               // setSocket(newSocket)
                // useEffect(() => {
                //     const newSocket = io(`http://localhost:3000/game`, {withCredentials: true, transports: ['websocket']});
                //     // setSocket(newSocket);
                //     // return () => newSocket.close();
                //     console.log(newSocket);
                //   }, [setSocket]);
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

