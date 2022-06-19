import React from "react";
import { Socket } from "socket.io-client";
import Wrapper from "../components/Wrapper";

type Props = {
    socket: Socket | null,
};

const Profile = ({socket}: Props) =>
{
    if (socket?.connected === false)
        socket?.connect();
    return(
        <Wrapper>
            Your data here
        </Wrapper>
    );
}

export default Profile;