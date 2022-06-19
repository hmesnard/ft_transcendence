import React, { useEffect, useState } from 'react';
import './App.css';
import { BrowserRouter, Routes, Route } from "react-router-dom";
import Users from './pages/users/Users';
import SingIn from './pages/SignIn';
import Profile from './pages/Profile';
import Channels from './pages/chat/Channels';
import Game from './pages/game/Game';
import { io, Socket } from 'socket.io-client';

function App() {
  const [socket, setSocket] = useState<Socket | null>(null);
  const [joinMsg, setJoinMsg] = useState('');

  useEffect(() => {
    const newSocket = io(`http://localhost:3000`, {withCredentials: true, transports: ['websocket']});
    newSocket.on('joinToClient', (data) => {
      setJoinMsg(data);
    });
    newSocket.on('JoinQueueToClient', (data) => {
      console.log(data);
    });
    newSocket.on('leaveToClient', (data) => {
      console.log(data);
    });
    newSocket.on('msgToClient', (data) => {
      console.log(data);
    });
    newSocket.on('getGamesToClient', (data) => {
      console.log(data);
    });
    newSocket.on('addInviteToClient', (data) => {
      console.log(data);
    });
    newSocket.on('leaveQueueToClient', (data) => {
      console.log(data);
    });
    newSocket.on('newSpectatorToClient', (data) => {
      console.log(data);
    });
    newSocket.on('gameStartsToClient', (data) => {
      console.log(data);
    });
    newSocket.on('gameUpdateToClient', (data) => {
      console.log(data);
    });
    setSocket(newSocket);

    return () => {
      newSocket.disconnect();
    }
  }, []);

  return (
    <div className="App">
      <BrowserRouter>
        <Routes>
          <Route path="/game" element={<Game socket={socket}/>}></Route>
          <Route path="/" element={<Profile socket={socket}/>}></Route>
          <Route path="/users" element={<Users socket={socket}/>}></Route>
          <Route path="/signin" element={<SingIn socket={socket}/>}></Route>
          <Route path="/channels" element={<Channels socket={socket} joinMsg={joinMsg}/>}></Route>
        </Routes>
      </BrowserRouter>
    </div>
  );
}

export default App;
