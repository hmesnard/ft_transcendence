import React from "react";
import './LiveButton.css';

interface Props {
	onClick?: () => void;
	text: string;
}

export default class LiveButton extends React.Component<Props> {
  render() {
	 return (
		<button className="button" onClick={this.props.onClick}>
		  {this.props.text}
		</button>
	 );
  }
}

