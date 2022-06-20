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

    const newMsg = async (e: SyntheticEvent) =>
    {
      e.preventDefault();
      // emit new message to chat
      // socket.emit('msgToServer', { name: <room_name>, message: newMessage });
    }

    useEffect(() => {
        return () => {
            // leave channel emit here
          }
    }, []);

    return (
        <Wrapper>
            <form onSubmit={newMsg}>
                <input placeholder="message" size={19} required onChange={e => setNewMessage(e.target.value)}/>
                <button type="submit">Send</button>
            </form>
            <div>{newMessage}</div>
            <p>This is the chat area</p>
        </Wrapper>
    );
}

export default Chat;