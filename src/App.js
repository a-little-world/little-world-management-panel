import { useEffect, useState } from 'react';
import { ThemeProvider } from 'styled-components';
import { Dashboard } from './views/dashboard';
import theme from './theme';

function App({ initData }) {
  const [users, setUsers] = useState([]);

  useEffect(() => {
    const getUsers = async () => {
      const users = await Promise.resolve(initData).then(async response => {
        const data = await response.json();
        return data?.initData;
      });
      setUsers(users);
    };

    getUsers();
  }, [initData]);

  return (
    <ThemeProvider theme={theme}>
      <Dashboard users={users} />
    </ThemeProvider>
  );
}

export default App;
