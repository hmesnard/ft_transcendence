import React from 'react'
import { Link, Routes, Route } from 'react-router-dom';
import {LiveButton} from '../../common'
import './UserProfile.css'
import DefaultProfilePic from './default_profile_pic.png'
import Stats from '../stats/Stats'

interface Props {
	  name: string;
	  gamesWon?: number;
	  gamesLost?: number;
	  image?: string;
	  showHistory?: boolean;
	  showStats?: boolean;
}

type State = {
	  name: string;
	  gamesWon: number;
	  gamesLost: number;
	  image?: string;
	  showHistory: boolean;
	  showStats: boolean;
}

class UserProfile extends React.Component<Props, State> {
	constructor(props: Props) {
		super(props);
		let state: State = {
			name: props.name,
			gamesWon: props.gamesWon || 0,
			gamesLost: props.gamesLost || 0,
			image: DefaultProfilePic,
			showHistory: props.showHistory || false,
			showStats: props.showStats || false
		};
		this.state = state;
		this.onGameWon = this.onGameWon.bind(this);
	}

	onGameWon(gameWon : number) {
		this.setState({
			gamesWon: gameWon + this.state.gamesWon
		});
	}

	render() {
		return (
			<div className='user-profile'>
				<div className='user-name'>
				<img className='profile-picture' src={this.state.image} alt="user" >
				</img>
				<h1>{this.state.name}'s profile</h1>
				</div>
				<LiveButton text="watch live game" onClick={() => this.onGameWon(1)}/>
				{/* eslint-disable-next-line*/}
				<Link className='button' to={'/2fa_activated'}> Activate 2FA </Link>
				<div className='stats-and-history'>
					<Link className='button' to={'/profile/stats'}>Stats</Link>
					<Link className='button'to={'/profile/match-history'}>Match History</Link>
				</div>
				<h2>{this.state.name} has won {this.state.gamesWon} games</h2>
				{/* <Routes> */}
						{/* <Route path='/profile/stats' element={<Stats gamesWon={this.state.gamesWon} gamesLost={this.state.gamesLost}/>}/> */}
				{/* </Routes> */}
			</div>
		)
	}
}


export default UserProfile