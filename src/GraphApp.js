import { useEffect, useState } from 'react';
import { ThemeProvider } from 'styled-components';
import { GraphDashboard } from './GraphDashboard';
import theme from './theme';

function GraphApp({ inputGraph }) {
  const [graph, setGraph] = useState({});

  useEffect(() => {
    const newGraph = inputGraph || {};
    setGraph(newGraph);
  }, [inputGraph]);

  return (
    <ThemeProvider theme={theme}>
      <GraphDashboard graph={graph} />
    </ThemeProvider>
  );
}

export default GraphApp;
