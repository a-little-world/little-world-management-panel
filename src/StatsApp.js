import { useEffect, useState } from 'react';
import { ThemeProvider } from 'styled-components';
import { StatsDashboard } from './StatsDashboard';
import theme from './theme';

function StatsApp({ inputCombinedGraphs, inputSeries, inputStaticStats }) {
  const [series, setSeries] = useState({});
  const [staticStats, setStaticStats] = useState({});
  const [combinedGraphs, setCombinedGraphs] = useState([]);

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

  useEffect(() => {
    console.log('IN Graph', inputCombinedGraphs);
    const newGraphs = inputCombinedGraphs || [];
    setCombinedGraphs(newGraphs);
  }, [inputCombinedGraphs]);

  return (
    <ThemeProvider theme={theme}>
      <StatsDashboard
        series={series}
        staticStats={staticStats}
        combinedGraphs={combinedGraphs}
      />
    </ThemeProvider>
  );
}

export default StatsApp;
