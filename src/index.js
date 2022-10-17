import React from 'react';
import ReactDOM from 'react-dom/client';
import './index.css';
import App from './App';
import reportWebVitals from './reportWebVitals';
import { simulatedAutoLogin } from './loginSimulator';

const LOCAL_DEV = true; // TODO should also be moved to some central env file
const renderApp = initData => {
  const root = ReactDOM.createRoot(document.getElementById('root'));
  root.render(
    <React.StrictMode>
      <App initData={initData} />
    </React.StrictMode>,
  );
};

if (LOCAL_DEV) {
  simulatedAutoLogin().then(initData => {
    renderApp(initData);
  });
} else {
  // Window function registered to be called from inside a django view
  window.renderApp = renderApp;
}

// If you want to start measuring performance in your app, pass a function
// to log results (for example: reportWebVitals(console.log))
// or send to an analytics endpoint. Learn more: https://bit.ly/CRA-vitals
reportWebVitals();
