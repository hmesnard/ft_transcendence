import React from 'react';
import logo from './logo.svg';
import { Counter } from './features/counter/Counter';
import './App.css';
import {
  BrowserRouter,
 Switch,
  Route,
  Link
} from "react-router-dom";
import Header from './components/header';
import styled from 'styled-components';
import SideBar from './components/Sidebar';

function App() {
  return (
    <div className="App">

      <BrowserRouter>
          <Header/>
          <AppBody>
            < SideBar />
              <switch>
                    <Route path="/" exact>
                      {/* Chat */}
                    </Route>
                </switch>
          </AppBody>
      </BrowserRouter>
      </div>
  );
}

export default App;

const AppBody = styled.div`
 display: flex;
 height: 100vh;
`;