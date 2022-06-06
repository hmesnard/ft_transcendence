import './App.css';
import { BrowserRouter, Route, Switch } from "react-router-dom";
import Profile from './pages/Profile';
import Game from './pages/Game';
import SingIn from './pages/SignIn';
import Channels from './pages/Channels';
// import Header from './components/header';
// import styled from 'styled-components';
// import SideBar from './components/Sidebar';

function App()
{
  return (
    <div className="App">

      <BrowserRouter>
        <Switch>
          <Route path="/" exact component={Game}/>
          <Route path={"/profile"} component={Profile} />
          <Route path={"/channels"} component={Channels} />
          <Route path={"/signin"} exact component={SingIn} />
            {/* Chat */}
        </Switch>
          {/* <Header/>
          <AppBody>
            < SideBar />
              
          </AppBody> */}
      </BrowserRouter>
      </div>
  );
}

export default App;