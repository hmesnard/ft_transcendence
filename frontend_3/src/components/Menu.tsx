import React from "react";
import { NavLink } from "react-router-dom";

export const Menu = () => {
    return (
        <nav id="sidebarMenu" className="col-md-3 col-lg-2 d-md-block bg-light sidebar collapse">
            <div className="position-sticky pt-3">
              <ul className="nav flex-column">
              <li className="nav-item">
                  <NavLink to={'/'} className={({isActive}) => (isActive ? "nav-link active" : "nav-link")}>
                    Game
                  </NavLink>
                </li>
                <li className="nav-item">
                  <NavLink to={'/profile'} className={({isActive}) => (isActive ? "nav-link active" : "nav-link")}>
                    Profile
                  </NavLink>
                </li>
                <li className="nav-item">
                  <NavLink to={'/users'} className={({isActive}) => (isActive ? "nav-link active" : "nav-link")}>
                    Users
                  </NavLink>
                </li>
                <li className="nav-item">
                  <NavLink to={'/channels'} className={({isActive}) => (isActive ? "nav-link active" : "nav-link")}>
                    Channels
                  </NavLink>
                </li> 
                {/* <li className="nav-item">
                  <Link to={'/game'} className="nav-link active">
                    Game
                  </Link>
                </li> */}
              </ul>
            </div>
          </nav>
    );
}