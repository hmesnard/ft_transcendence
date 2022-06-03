import React from "react";
import './ProfileButton.css';

interface Props {
	onClick?: () => void;
	text: string;
}

class ProfileButton extends React.Component<Props, {}> {
  render() {
	 return (
		<div>
		<button className="profile-button" onClick={this.props.onClick}>
		  {this.props.text}
		</button>
		</div>
	 );
  }
}

export default ProfileButton