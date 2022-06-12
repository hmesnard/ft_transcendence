import React from 'react';
import ReactDOM from 'react-dom/client';
import './index.css';
import App from './App';
import reportWebVitals from './reportWebVitals';
import axios from 'axios';

axios.defaults.baseURL = 'http://localhost:3000/';
axios.defaults.withCredentials = true;

// const keyInput = ({}) => {
//   const PLAYER_UP   = 38  // up arrow
//   const PLAYER_DOWN = 40  // down arrow
//   const OPPONENT_UP    = 90; /* z */
//   const OPPONENT_DOWN    = 98; /* x */
// }

const root = ReactDOM.createRoot
(
  document.getElementById('root') as HTMLElement,
  // document.onkeydown = this.keyInput
);
root.render(
    <App />
);

// If you want to start measuring performance in your app, pass a function
// to log results (for example: reportWebVitals(console.log))
// or send to an analytics endpoint. Learn more: https://bit.ly/CRA-vitals
reportWebVitals();
