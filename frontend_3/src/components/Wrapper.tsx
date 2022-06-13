import axios from "axios";
import React, { useEffect, useState } from "react";
import { Navigate } from "react-router";
import io, { Socket } from "socket.io-client";
import { User, UserLevel, UserStatus } from "../models/user";
import { Menu } from "./Menu";
import Nav from "./Nav";

type Props = {
    children: JSX.Element | JSX.Element[] | string,
};

export var sockets: Socket[] = [];

const Wrapper = ({children}: Props) =>
{
    const [redirect, setRedirect] = useState(false);

    
    useEffect(() => {
        (
            async () => {
                try {
                    const {data} = await axios.get('user');
                    if (data.socketId === null)
                    {
                        const newSocket = io(`http://localhost:3000`, {withCredentials: true, transports: ['websocket']});
                        sockets.push(newSocket);
                    }
                } catch (e) {
                    setRedirect(true);
                }
            }
        )();
    }, []);

    if (redirect)
    {
        return <Navigate to={'/signin'} />;
    }

    return (
        <>
            <Nav/>

            <div className="container-fluid">
            <div className="row">
                <Menu/>

                <main className="col-md-9 ms-sm-auto col-lg-10 px-md-4">
                    {children}
                </main>
            </div>
            </div>

        </>
    )
}

export default Wrapper;