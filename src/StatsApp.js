import { useEffect, useState } from 'react';
import { StatsDashboard } from './StatsDashboard';


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
      <StatsDashboard
        series={series}
        staticStats={staticStats}
        combinedGraphs={combinedGraphs}
      />

  );
}

export default StatsApp;
