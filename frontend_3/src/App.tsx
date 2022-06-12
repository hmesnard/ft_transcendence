import React from 'react';
import './App.css';
import { BrowserRouter, Routes, Route } from "react-router-dom";
import Users from './pages/users/Users';
import SingIn from './pages/SignIn';
import Profile from './pages/Profile';
import Channels from './pages/chat/Channels';
import Game from './pages/game/Game';
import GameLoop from './pages/game/GameLoop';

function App() {
  return (
    <div className="App">
      <BrowserRouter>
        <Routes>
          <Route path="/game" element={<Game/>}></Route>
          <Route path="/" element={<Profile/>}></Route>
          <Route path="/users" element={<Users/>}></Route>
          <Route path="/signin" element={<SingIn/>}></Route>
          <Route path="/channels" element={<Channels/>}></Route>
          <Route path="/gameloop" element={<GameLoop/>}></Route>
        </Routes>
      </BrowserRouter>
    </div>
  );
}

export default App;
