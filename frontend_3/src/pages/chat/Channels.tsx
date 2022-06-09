import axios from "axios";
import React, { SyntheticEvent, useEffect, useState } from "react";
import Wrapper from "../../components/Wrapper";
import { Channel, ChannelStatus } from "../../models/channel";
import io, { Socket } from 'socket.io-client';

const Channels = () =>
{
  const [channels, setChannels] = useState([]);
  const [page, setPage] = useState(1);
  const [lastPage, setLastPage] = useState(0);
  const [name, setName] = useState('');
  const [password, setPassword] = useState('');
  const [status, setStatus] = useState(ChannelStatus.public);

  const submit = async (e: SyntheticEvent) =>
  {
    e.preventDefault();

    if (status === ChannelStatus.public)
      await axios.post('chat/public', { name });
    else if (status === ChannelStatus.protected)
      await axios.post('chat/protected', { name, password });
    else if (status === ChannelStatus.private)
      await axios.post('chat/private', { name });
    window.location.reload();
  }

  useEffect(() => {
    (
      async () => {
        const {data} = await axios.get(`chat/all?page=${page}`);

        setChannels(data.data);
        setLastPage(data.meta.last_page);
      }
    )();
  }, [page]);

  const next = () =>
  {
    if (page < lastPage)
      setPage(page + 1);
  }

  const prev = () =>
  {
    if (page >= 2)
      setPage(page - 1);
  }

  return (
    <Wrapper>
        <div className="table-responsive">
          <form onSubmit={submit}>
            <h4>Create a channel</h4>
            <input placeholder="name" size={19} required onChange={e => setName(e.target.value)}/>
            <br />
            <input placeholder="password" size={19} onChange={e => setPassword(e.target.value)}/>
            <br />
            <input type={"radio"} name="radio" onChange={e => setStatus(ChannelStatus.public)}/> public <br/>
            <input type={"radio"} name="radio" onChange={e => setStatus(ChannelStatus.protected)}/> protected <br/>
            <input type={"radio"} name="radio" onChange={e => setStatus(ChannelStatus.private)}/> private <br/>
            <button type="submit">Create</button>
          </form>
          <br/>
          <br/>
          <table className="table table-striped table-sm">
            
            <thead>
              <tr>
                <th scope="col">#</th>
                <th scope="col">name</th>
                <th scope="col">status</th>
                <th scope="col">join</th>
                <th scope="col">delete</th>
              </tr>
            </thead>
            <tbody>
            {channels.map((channel: Channel) => {
                return (
                  <tr key={channel.id}>
                    <td>{channel.id}</td>
                    <td>{channel.name}</td>
                    <td>{channel.status}</td>
                    <td>
                      {/* <form onSubmit={join}> */}
                        <button type="submit">Join</button>
                      {/* </form> */}
                    </td>
                    <td>
                      {/* <form onSubmit={join}> */}
                        <button type="submit">Delete</button>
                      {/* </form> */}
                    </td>
                  </tr>  
                )
              })}
            </tbody>
          </table>
        </div>
      <nav>
        <ul className="pagination">
            <li className="page-item">
              <a href="#" className="page-link" onClick={prev}>Previous</a>
            </li>
            <li className="page-item">
              <a href="#" className="page-link" onClick={next}>Next</a>
            </li>
        </ul>
      </nav>
    </Wrapper>
  );
}

export default Channels;