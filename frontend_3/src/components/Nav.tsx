import axios from "axios";
import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { User, UserLevel, UserStatus } from "../models/user";

const Nav = () =>
{
    const [user, setUser] = useState(new User(0, '', '', 'default.png', UserStatus.offline, UserLevel.beginner, 0, 0, 0));

    useEffect(() => {
        (
            async () => {
                const {data} = await axios.get('user');

                setUser(new User(
                    data.id,
                    data.username,
                    data.socketId,
                    data.picture,
                    data.status,
                    data.level,
                    data.wins,
                    data.losses,
                    data.rank,
                ));
            }
        )();
    }, []);

    const logout = async () => {
        await axios.post('user/logout', {});
        window.location.reload();
    }

    return (
        <header className="navbar navbar-dark sticky-top bg-dark flex-md-nowrap p-0 shadow">
            <a className="navbar-brand col-md-3 col-lg-2 me-0 px-3 fs-6" href="#">Ft_transcendence</a>
            <button className="navbar-toggler position-absolute d-md-none collapsed" type="button" data-bs-toggle="collapse" data-bs-target="#sidebarMenu" aria-controls="sidebarMenu" aria-expanded="false" aria-label="Toggle navigation">
                <span className="navbar-toggler-icon"></span>
            </button>
            {/* <input className="form-control form-control-dark w-100 rounded-0 border-0" type="text" placeholder="Search" aria-label="Search"/> */}
            <div className="navbar-nav">
                <div className="nav-item text-nowrap">
                <Link to={'/profile'} className="nav-link px-3">{user?.username}</Link>
                <Link to={'/signin'} className="nav-link px-3" onClick={logout}>Sign out</Link>
                </div>
            </div>
        </header>
    )
}

export default Nav