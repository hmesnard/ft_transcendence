import React from 'react';
import './App.css';
import { Nav } from './components/Nav';
import { Menu } from './components/Menu';
import { BrowserRouter, Routes, Route } from "react-router-dom";
import FrontPage from './pages/FrontPage';
import { Users } from './pages/Users';

function App() {
  return (
    <div className="App">
      <Nav/>

      <div className="container-fluid">
        <div className="row">
          <Menu/>

          <main className="col-md-9 ms-sm-auto col-lg-10 px-md-4">
            <BrowserRouter>
              <Routes>
                {/* <FrontPage/> */}
                <Route path="/" element={<FrontPage/>}></Route>
              </Routes>
            </BrowserRouter>
          </main>
        </div>
      </div>
    </div>
  );
}

export default App;
