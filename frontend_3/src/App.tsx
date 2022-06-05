import React from 'react';
import './App.css';
import { BrowserRouter, Routes, Route } from "react-router-dom";
import Users from './pages/users/Users';
import SingIn from './pages/SignIn';
import Profile from './pages/Profile';

function App() {
  return (
    <div className="App">
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<Profile/>}></Route>
          <Route path="/users" element={<Users/>}></Route>
          <Route path="/signin" element={<SingIn/>}></Route>
        </Routes>
      </BrowserRouter>
    </div>
  );
}

export default App;
