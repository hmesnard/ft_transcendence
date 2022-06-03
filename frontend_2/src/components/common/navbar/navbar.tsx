import React from "react"
import './navbar.css'
import { Link } from "react-router-dom";

class Navbar extends React.Component {

	  render() {
    return (
      <div className='menu'>
        <nav>
          <Link to="/profile">Profile</Link>
          <Link to="/">Home</Link>
          <Link to="/chat">Chat</Link>
          <Link to="/signup">signup</Link>
          <Link to="/signin">login</Link>
          <Link to="/testing">testing</Link>
        </nav>
      </div>
    );  
  }
}

export default Navbar;