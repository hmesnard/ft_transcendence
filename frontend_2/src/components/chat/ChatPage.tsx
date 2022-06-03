import React, { Fragment } from "react";
import ChatArea from "./ChatArea";
import MessageSender from "./MessageSender";
import Sidebar from "./Sidebar/index";
import StyledPageContainer from "./StyledPageContainer";

const ChatPage = () =>(
	<Fragment>
		<Sidebar />
		<StyledPageContainer>
			<ChatArea />
			<MessageSender/>
		</StyledPageContainer>
	</Fragment>
);

export default ChatPage