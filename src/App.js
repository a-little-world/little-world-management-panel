import { useEffect, useState } from 'react';
import { Dashboard } from './views/dashboard';


function App({ extraInfo, filteredUsers }) {
  const [users, setUsers] = useState([]);
  const [stateInfo, setStateInfo] = useState({});

  useEffect(() => {
    const users = filteredUsers || [];
    setUsers(users);
  }, [filteredUsers]);

  useEffect(() => {
    const stateI = extraInfo || [];
    setStateInfo(stateI);
  }, [extraInfo]);

  return (
      <Dashboard users={users} stateInfo={stateInfo} />
  );
}

export default App;
