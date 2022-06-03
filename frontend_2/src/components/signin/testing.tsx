import React from 'react';
import axios from 'axios';

export default class PersonAdd extends React.Component {
  state = {
    name: ''
  }

  handleChange = (event: { target: { value: any; }; }) => {
    this.setState({ name: event.target.value });
  }

  handleSubmit = (event: { preventDefault: () => void; }) => {
    event.preventDefault();

    const user = {
      name: this.state.name
    };

    axios.post(`http://localhost:3000/chat/public`, { name: 'lollll' }, {withCredentials: true})
      .then(res => {
        console.log(res);
        console.log(res.data);
      })
  }

  render() {
    return (
      <div>
        <form onSubmit={this.handleSubmit}>
          <label>
            Person Name:
            <input type="text" name="name" onChange={this.handleChange} />
          </label>
          <button type="submit">Add</button>
        </form>
      </div>
    )
  }
}