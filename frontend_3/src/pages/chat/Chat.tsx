import React, { SyntheticEvent, useEffect, useState } from "react";
import { Navigate } from "react-router";
import { Socket } from "socket.io-client";
import Wrapper from "../../components/Wrapper";
import { MessageI } from "../../models/message";

type Props = {
    socket: Socket | null,
    joinMsg: string,
    channelName: string,
    messages: MessageI[],
};

const Chat = ({socket, joinMsg, channelName, messages}: Props) =>
{
    const [newMessage, setNewMessage] = useState('');
    const [infoMsg, setInfoMsg] = useState(joinMsg);
    const [redirect, setRedirect] = useState(false);
    
    const newMsg = async (e: SyntheticEvent) =>
    {
        e.preventDefault();
        socket?.emit('msgToServer', { name: channelName, message: newMessage });
    }

    useEffect(() => {
        if (socket === null)
            setRedirect(true);
        setInfoMsg(joinMsg);
        return () => {
            // leave channel emit here
          }
    }, [joinMsg, socket]);

    if (redirect === true)
    {
        // leave channel emit here
        return <Navigate to={'/channels'} />;
    }

    return (
        <Wrapper>
            <div>{infoMsg}</div>
            <form onSubmit={newMsg}>
                <input placeholder="message" size={19} required onChange={e => setNewMessage(e.target.value)}/>
                <button type="submit">Send</button>
            </form>
            <div>
            {messages.map((message: MessageI) => {
                return (
                    <li key={message.id}>
                       {message.content}
                    </li>
                )
            })}
            </div>
            
        </Wrapper>
    );
}

export default Chat;