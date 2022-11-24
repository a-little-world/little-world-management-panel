import React from 'react';
import ReactDOM from 'react-dom/client';
import './index.css';
import App from './App';
import reportWebVitals from './reportWebVitals';
import { simulatedAutoLogin } from './loginSimulator';
import { LOCAL_DEV } from './ENVIRONMENT';

const dispatchRenderApp = initData => {
  const root = ReactDOM.createRoot(document.getElementById('root'));
  const filteredUsers = initData?.initData;
  root.render(
    <React.StrictMode>
      <App filteredUsers={filteredUsers} />
    </React.StrictMode>,
  );
};

if (LOCAL_DEV) {
  simulatedAutoLogin().then(initData => {
    dispatchRenderApp(initData);
  });
} else {
  // Window function registered to be called from inside a django view
  console.log('Registered render function!');
  window.renderApp = dispatchRenderApp;
}

// If you want to start measuring performance in your app, pass a function
// to log results (for example: reportWebVitals(console.log))
// or send to an analytics endpoint. Learn more: https://bit.ly/CRA-vitals
reportWebVitals();
