import * as React from 'react';
import Linkify from 'linkify-react';
import Timestamp from '../Timestamp';
import Nickname from '../Nickname';
import StyledMessage from './StyledMessage';


export interface IMessage {
	from: string;
	content: string;
	time: string;
	type: string;
  }
  
  class Message extends React.Component<{ message: IMessage }> {
	public render() {
	  const { message } = this.props;
  
	  return (
		<React.Fragment>
		  <div id='nickname-container'>
			{message.type === 'received' && <Nickname value={message.from}/>}
			<Timestamp value={message.time} floatToRight={message.type === 'sent'}/>
		  </div>
		  <StyledMessage type={message.type}>
			<Linkify>{message.content}</Linkify>
		  </StyledMessage>
		</React.Fragment>
  
	  );
	}
  }
  
  export default Message;