import axios from "axios";
import { config } from "process";
import React, { SyntheticEvent, useState } from "react";
import { Navigate } from "react-router-dom";

const LogIn = () => {

	const submit = async (e: SyntheticEvent) => {
		e.preventDefault();

		//window.open('http://localhost:3000/auth/42');
		// axios({
		// 	method: 'post',
		// 	url: 'http://localhost:3000/user/logout',
		// 	withCredentials: true
		// });
		const response = await axios.get('http://localhost:3000/chat/all', {withCredentials: true});

		console.log(response.data);
	}
	
	return (
		<main>
			<form onSubmit={submit}>
				<h1>Please login</h1>
				<button type="submit">Submit</button>
			</form>
		</main>
	)
};

export default LogIn;

// class LogIn extends React.Component {

// 	constructor(props: {}) {
// 	  super(props)
// 	  this.state = {
// 		username: "",
// 		email: "",
// 		firstName: "",
// 		lastName: "",
// 	  }
// 	}

// 	const submit = async (e: SyntheticEvent) => {
// 		e.preventDefault();
	
		// const response = await axios.get('http://localhost:3000/auth/42', {withCredentials: true});
		// console.log(response.data);
	
// 	}

	
// 	onUsernameChange = (e: React.FormEvent<HTMLInputElement>): void => {
// 	  this.setState({username: e.currentTarget.value})
// 	}
// 	onEmailChange = (e: React.FormEvent<HTMLInputElement>): void => {
// 	  this.setState({email: e.currentTarget.value})
// 	}
// 	onFirstNameChange = (e: React.FormEvent<HTMLInputElement>): void => {
// 	  this.setState({firstName: e.currentTarget.value})
// 	}
// 	onLastNameChange = (e: React.FormEvent<HTMLInputElement>): void => {
// 	  this.setState({lastName: e.currentTarget.value})
// 	}
// 	onProfilePictureChange = (e: React.FormEvent<HTMLInputElement>): void => {
// 	  if (e.currentTarget.files && e.currentTarget.files[0])
// 		this.setState({profilePicture: e.currentTarget.files[0]})
// 	}
  
// 	onSubmitClick(e: React.MouseEvent<HTMLButtonElement>) {
// 	  e.preventDefault()
// 	}
  
// 	render() {
// 	  return (
// 		<div className="new-user">
// 			<form onSubmit={this.submit} />
// 		  <h1>Sign Up Page</h1>
// 		</div>
// 	  );
// 	}
//   }
  
//   export default LogIn;

// export const logIn = async (setIsOpen: boolean) => {
// 	// const [username, setUsername] = useState('');
// 	// const [password, setPassword] = useState('');

// 	const response = await axios.get('http://localhost:3000/auth/42', {withCredentials: true});
// 	console.log(response.data);


// 	return (
// 		<div className="login-form">
// 		<h1>HAAAAAA</h1>
// 			<button>
// 				<a href="/login">Log In</a>
// 			</button>
// 		</div>
// 		);
// }