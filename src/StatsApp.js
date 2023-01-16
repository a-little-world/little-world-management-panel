import { useEffect, useState } from 'react';
import { ThemeProvider } from 'styled-components';
import { StatsDashboard } from './StatsDashboard';
import theme from './theme';

function StatsApp({ inputStats }) {
  const [stats, setStats] = useState({});

  useEffect(() => {
    const newStats = inputStats || {};
    setStats(newStats);
  }, [inputStats]);

  return (
    <ThemeProvider theme={theme}>
      <StatsDashboard stats={stats} />
    </ThemeProvider>
  );
}

export default StatsApp;
