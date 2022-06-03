import React from "react";
import './SignUpButton.css';

interface Props {
	onClick?: () => void;
	text: string;
}

class SignUpButton extends React.Component<Props, {}> {
  render() {
	 return (
		<div>
		<button className="sign-up-button" onClick={this.props.onClick}>
		  {this.props.text}
		</button>
		</div>
	 );
  }
}

export default SignUpButton