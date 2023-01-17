import { useEffect, useState } from 'react';
import { ThemeProvider } from 'styled-components';
import { StatsDashboard } from './StatsDashboard';
import theme from './theme';

function StatsApp({ inputSeries, inputStaticStats }) {
  const [series, setSeries] = useState({});
  const [staticStats, setStaticStats] = useState({});

  useEffect(() => {
    console.log('IN', inputSeries);
    const newStats = inputSeries || {};
    setSeries(newStats);
  }, [inputSeries]);

  useEffect(() => {
    console.log('IN Static', inputStaticStats);
    const newStats = inputStaticStats || {};
    setStaticStats(newStats);
  }, [inputStaticStats]);

  return (
    <ThemeProvider theme={theme}>
      <StatsDashboard series={series} staticStats={staticStats} />
    </ThemeProvider>
  );
}

export default StatsApp;
