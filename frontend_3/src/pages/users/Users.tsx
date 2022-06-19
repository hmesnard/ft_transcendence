import axios from "axios";
import React, { useEffect, useState } from "react";
import { Socket } from "socket.io-client";
import Wrapper from "../../components/Wrapper";
import { User } from "../../models/user";

type Props = {
  socket: Socket | null,
};

const Users = ({socket}: Props) =>
{
  const [users, setUsers] = useState([]);
  const [page, setPage] = useState(1);
  const [lastPage, setLastPage] = useState(0);
  const [response, setResponse] = useState<null | string>(null);

  useEffect(() => {
    setTimeout(async() => {
      const {data} = await axios.get(`user/allusers?page=${page}`);
      setUsers(data.data);
      setLastPage(data.meta.last_page);
    }, 40);
    

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
        <table className="table table-striped table-sm">
          <thead>
            <tr>
              <th scope="col">#</th>
              <th scope="col">username</th>
              <th scope="col">status</th>
              <th scope="col">level</th>
              <th scope="col">wins</th>
              <th scope="col">losses</th>
              <th scope="col">rank</th>
            </tr>
          </thead>
          <tbody>
          {users.map((user: User) => {
              
              return (
                <tr key={user.id}>
                  <td>{user.id}</td>
                  <td>{user.username}</td>
                  <td>{user.status}</td>
                  <td>{user.level}</td>
                  <td>{user.wins}</td>
                  <td>{user.losses}</td>
                  <td>{user.rank}</td>
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

export default Users;