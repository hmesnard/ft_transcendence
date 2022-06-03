import React from "react";

interface Props {
	name : string;
	gamesWon : number;
	gamesLost : number;
	image : string;
}

interface State {
	name : string;
	gamesWon : number;
	gamesLost : number;
	image : string;
}

class Users extends React.Component<Props, State> {
  render() {
	 return (
		<div>
		  <h1>{this.props.name}</h1>
		  <p>{this.props.gamesWon}</p>
		  <img src={this.props.image} alt="user's profile picture" />
		</div>
	 );
  }
}

export default Users