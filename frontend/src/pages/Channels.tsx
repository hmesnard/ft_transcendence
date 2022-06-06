import axios from "axios";
import React, { Component, useEffect, useState } from "react";
import Wrapper from "../components/wrapper";
import { Channel } from "../models/channel";

const Channels = () =>
{
  const [channels, setChannels] = useState([]);
//   const [page, setPage] = useState(1);
//   const [lastPage, setLastPage] = useState(0);

  useEffect(() => {
    (
      async () => {
        const {data} = await axios.get(`chat/all`);
        // ?page=${page}`);
        console.log(data);

        setChannels(data);
        // setLastPage(data.meta.last_page);
      }
    )();
  }, []);

//   const next = () =>
//   {
//     if (page < lastPage)
//       setPage(page + 1);
//   }

//   const prev = () =>
//   {
//     if (page >= 2)
//       setPage(page - 1);
//   }

  return (
    <Wrapper>
        <div className="table-responsive">
        <table className="table table-striped table-sm">
          <thead>
            <tr>
              <th scope="col">#</th>
              <th scope="col">name</th>
              <th scope="col">status</th>
              {/* <th scope="col">join</th> */}
            </tr>
          </thead>
          <tbody>
          {/* {channels.map((channel: Channel) => {
              return (
                <tr key={channel.id}>
                  <td>{channel.id}</td>
                  <td>{channel.name}</td>
                  <td>{channel.status}</td>
                  <td>{user.level}</td>
                </tr>  
              )
            })} */}
          </tbody>
        </table>
      </div>
      {/* <nav>
        <ul className="pagination">
            <li className="page-item">
              <a href="#" className="page-link" onClick={prev}>Previous</a>
            </li>
            <li className="page-item">
              <a href="#" className="page-link" onClick={next}>Next</a>
            </li>
        </ul>
      </nav> */}
    </Wrapper>
  );
}

export default Channels;