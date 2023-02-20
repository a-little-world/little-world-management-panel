import { useEffect, useState } from 'react';
import { ThemeProvider } from 'styled-components';
import { GraphDashboard } from './GraphDashboard';
import theme from './theme';
import './withTailwind.css';

function GraphApp({ inputGraph }) {
  const [graph, setGraph] = useState({});

  console.log('Input graph: ', inputGraph);

  useEffect(() => {
    const newGraph = inputGraph || {};
    setGraph(newGraph);
  }, [inputGraph]);

  return <GraphDashboard inGraph={graph} />;
}

export default GraphApp;
