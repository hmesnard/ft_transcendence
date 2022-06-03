import 'bootstrap/dist/css/bootstrap.min.css';
import'bootstrap/dist/js/bootstrap.bundle.min';
import React from 'react';
import ReactDOM from 'react-dom';
import App from './App';
import reportWebVitals from './reportWebVitals';
import { BrowserRouter, Route, Routes } from 'react-router-dom';
import { UserProfile, NewUser, Stats } from './components/user';
import ChatPage from './components/chat/ChatPage'
import './index.css';
import { Provider } from 'react-redux';
import store from './store';
import SettingsPage from './components/chat/settings/SettingsPage';
import LogIn from './components/signin/SignIn';
import PersonAdd from './components/signin/testing';


ReactDOM.render(
  <Provider store={store}>
  <BrowserRouter>
    <App />
    <Routes>
      <Route path="/profile" element={<UserProfile name={"Alessandro"}/>}/> 
      <Route path="/signup" element={<NewUser />}/>
      <Route path="/signin" element={<LogIn />}/>
      <Route path="/testing" element={<PersonAdd />}/>
      <Route path='/profile/stats'/>
      <Route path='/chat' element={<ChatPage />}/>
      <Route path='/profile/stats' element={<Stats gamesLost={0} gamesWon={0} />}/>

	  <Route path='/chat/settings' element={<SettingsPage />}/>
    </Routes>
  </BrowserRouter>
  </Provider>
  , document.getElementById('root')
);

// If you want to start measuring performance in your app, pass a function
// to log results (for example: reportWebVitals(console.log))
// or send to an analytics endpoint. Learn more: https://bit.ly/CRA-vitals
reportWebVitals(console.log);
