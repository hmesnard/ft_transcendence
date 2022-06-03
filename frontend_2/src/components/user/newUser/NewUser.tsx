import React from "react";
import './NewUser.css';


interface State {
  username?: string,
  email?: string,
  firstName?: string,
  lastName?: string,
  profilePicture?: File,
}

class NewUser extends React.Component<{}, State> {

  constructor(props: {}) {
    super(props)
    this.state = {
      username: "",
      email: "",
      firstName: "",
      lastName: "",
    }
  }
  
  onUsernameChange = (e: React.FormEvent<HTMLInputElement>): void => {
    this.setState({username: e.currentTarget.value})
  }
  onEmailChange = (e: React.FormEvent<HTMLInputElement>): void => {
    this.setState({email: e.currentTarget.value})
  }
  onFirstNameChange = (e: React.FormEvent<HTMLInputElement>): void => {
    this.setState({firstName: e.currentTarget.value})
  }
  onLastNameChange = (e: React.FormEvent<HTMLInputElement>): void => {
    this.setState({lastName: e.currentTarget.value})
  }
  onProfilePictureChange = (e: React.FormEvent<HTMLInputElement>): void => {
    if (e.currentTarget.files && e.currentTarget.files[0])
      this.setState({profilePicture: e.currentTarget.files[0]})
  }

  onSubmitClick(e: React.MouseEvent<HTMLButtonElement>) {
    e.preventDefault()
  }

  render() {
    return (
      <div className="new-user">
        <h1>Sign Up Page</h1>
        <div className="signup-form">
          <form className="user-form">
          <label>
            <p>Username:</p>
            <input type="text" className="username" placeholder="jsmith" onChange={this.onUsernameChange}/>
          </label>
          <label>
            <p>Email:</p>
            <input type="email" className="email" placeholder="jsmith@student.s19.be" value={this.state.email} onChange={this.onEmailChange}/>
          </label>
          <label>
            <p>First Name:</p>
            <input type="text" className="firstName" placeholder="john" value={this.state.firstName} onChange={this.onFirstNameChange}/>
          </label>
          <label>
            <p>Last Name:</p>
            <input type="text" className="lastName" placeholder="smith" value={this.state.lastName} onChange={this.onLastNameChange}/>
          </label>
          <label>
            <p>Profile picture</p>
            <input type="file" accept="image/*" className="profilePicture" onChange={this.onProfilePictureChange}/>
          </label>
          <div>
            <button className="submit" onClick={this.onSubmitClick}>Submit</button>
          </div>
          </form>
        </div>
      </div>
    );
  }
}

export default NewUser;