import { useEffect, useState } from 'react';
import { ThemeProvider } from 'styled-components';
import { Dashboard } from './views/dashboard';
import theme from './theme';

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
    <ThemeProvider theme={theme}>
      <Dashboard users={users} stateInfo={stateInfo} />
    </ThemeProvider>
  );
}

export default App;
