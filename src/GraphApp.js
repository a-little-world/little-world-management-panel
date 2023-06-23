import { useEffect, useState } from 'react';
import { ThemeProvider } from 'styled-components';
import { GraphDashboard } from './GraphDashboard';
import theme from './theme';
import './withTailwind.css';

const THEMES = [
  'light',
  'dark',
  'cupcake',
  'bumblebee',
  'emerald',
  'corporate',
  'synthwave',
  'retro',
  'cyberpunk',
  'valentine',
  'halloween',
  'garden',
  'forest',
  'aqua',
  'lofi',
  'pastel',
  'fantasy',
  'wireframe',
  'black',
  'luxury',
  'dracula',
  'cmyk',
  'autumn',
  'business',
  'acid',
  'lemonade',
  'night',
  'coffee',
  'winter',
];

function GraphApp({ inputGraph }) {
  const [graph, setGraph] = useState([]);
  const [theme, setTheme] = useState('emerald');

  console.log('Input graph: ', inputGraph);

  useEffect(() => {
    const newGraph = inputGraph || [];
    setGraph(newGraph);
  }, [inputGraph]);

  if (graph.length === 0) {
    return <div>Loading...</div>;
  }

  return (
    <div data-theme={theme}>
      <GraphDashboard
        inGraph={graph[0]}
        inFetched={graph}
        themeControl={{
          setTheme: setTheme,
          availableThemes: THEMES,
        }}
      />
    </div>
  );
}

export default GraphApp;
