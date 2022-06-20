import React, { SyntheticEvent, useEffect, useState } from "react";
import { Socket } from "socket.io-client";
import Wrapper from "../../components/Wrapper";

type Props = {
    socket: Socket | null,
    joinMsg: string,
};

const Chat = ({socket, joinMsg}: Props) =>
{
    const [newMessage, setNewMessage] = useState('');
    const [infoMsg, setInfoMsg] = useState(joinMsg);

    

    const newMsg = async (e: SyntheticEvent) =>
    {
      e.preventDefault();
      // emit new message to chat
      // socket.emit('msgToServer', { name: <room_name>, message: newMessage });
    }

    useEffect(() => {
        setInfoMsg(joinMsg);
        return () => {
            // leave channel emit here
          }
    }, [joinMsg]);

    return (
        <Wrapper>
            <div>{infoMsg}</div>
            <div>{newMessage}</div>
            <form onSubmit={newMsg}>
                <input placeholder="message" size={19} required onChange={e => setNewMessage(e.target.value)}/>
                <button type="submit">Send</button>
            </form>
        </Wrapper>
    );
}

export default Chat;