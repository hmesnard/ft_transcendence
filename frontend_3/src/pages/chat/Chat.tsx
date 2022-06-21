import React, { SyntheticEvent, useEffect, useState } from "react";
import { Socket } from "socket.io-client";
import Wrapper from "../../components/Wrapper";
import { MessageI } from "../../models/message";

type Props = {
    socket: Socket | null,
    joinMsg: string,
    channelName: string,
    message: MessageI | null,
    messages: MessageI[],
};

const Chat = ({socket, joinMsg, channelName, message, messages}: Props) =>
{
    const [allMessages, setAllMessages] = useState<MessageI[]>(messages);
    const [newMessage, setNewMessage] = useState('');
    const [infoMsg, setInfoMsg] = useState(joinMsg);

    const newMsg = async (e: SyntheticEvent) =>
    {
        e.preventDefault();
        socket?.emit('msgToServer', { name: channelName, message: newMessage });
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