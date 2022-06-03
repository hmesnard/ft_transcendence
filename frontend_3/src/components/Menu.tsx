import React from "react";

export const Menu = () => {
    return (
        <nav id="sidebarMenu" className="col-md-3 col-lg-2 d-md-block bg-light sidebar collapse">
            <div className="position-sticky pt-3">
              <ul className="nav flex-column">
                <li className="nav-item">
                  <a className="nav-link active">
                    Front Page
                  </a>
                </li>
                <li className="nav-item">
                  <a className="nav-link active">
                    Users
                  </a>
                </li>
                <li className="nav-item">
                  <a className="nav-link active">
                    Chat
                  </a>
                </li> 
                <li className="nav-item">
                  <a className="nav-link active">
                    Game
                  </a>
                </li> 
              </ul>
            </div>
          </nav>
    );
}