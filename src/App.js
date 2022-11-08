import { useEffect, useState } from 'react';
import { ThemeProvider } from 'styled-components';
import { Dashboard } from './views/dashboard';
import theme from './theme';

function App({ filteredUsers }) {
  const [users, setUsers] = useState([]);

  useEffect(() => {
    const users = filteredUsers || [];
    setUsers(users);
  }, [filteredUsers]);

  return (
    <ThemeProvider theme={theme}>
      <Dashboard users={users} />
    </ThemeProvider>
  );
}

export default App;
