import React, { Component, useEffect, useState } from "react";
import Wrapper from "../../components/Wrapper";
import io, { Socket } from 'socket.io-client';

const Game = () =>
{
    const [socket, setSocket] = useState<null | Socket>(null);

    useEffect(() => {
        const newSocket = io(`http://localhost:3000/game`, {withCredentials: true, transports: ['websocket']});
        setSocket(newSocket);
        // return () => newSocket.close();
        console.log(newSocket);
      }, [setSocket]);

    return(
        <Wrapper>
            <script src="https://cdnjs.cloudflare.com/ajax/libs/socket.io/2.3.0/socket.io.js"></script>
            <p>This is a mighty pong game page</p>
        </Wrapper>
    );
}

export default Game;
