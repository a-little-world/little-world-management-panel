import React from 'react';
import ReactDOM from 'react-dom/client';
import './index.css';

import StatsApp from './StatsApp.js';
import GraphApp from './GraphApp.js';
import UserListApp from './UserListApp.jsx';
import reportWebVitals from './reportWebVitals.js';
import { simulatedAutoLogin } from './loginSimulator.js';
import { LOCAL_DEV } from './ENVIRONMENT.js';
import App from './App.tsx';
import LandingPage from './landing/LandingPage.jsx';
import AdminPanelV2Login from './AdminPanelV2Login.js';
import { MatchingPannel } from './App.tsx';

const dispatchRenderApp = initData => {
  const root = ReactDOM.createRoot(document.getElementById('root'));
  const filteredUsers = initData?.initData.user_list;
  const extraInfo = initData?.initData.extra_info;
  console.log('initData', initData);
  root.render(
    <React.StrictMode>
      <App extraInfo={extraInfo} filteredUsers={filteredUsers} />
    </React.StrictMode>,
  );
};

function renderAppV2(
  {
    apiOptions,
    apiTranslations
  }
) {
  const root = ReactDOM.createRoot(document.getElementById('root'));
  root.render(
    <React.StrictMode>
      <MatchingPannel apiOptions={apiOptions} apiTranslations={apiTranslations} />
    </React.StrictMode>,
  );
}

const dispatchRenderStatsApp = initData => {
  const root = ReactDOM.createRoot(document.getElementById('root'));
  console.log('INIT', initData);
  root.render(
    <React.StrictMode>
      <StatsApp
        inputSeries={initData?.initData?.time_series}
        inputCombinedGraphs={initData?.initData?.combined}
        inputStaticStats={initData?.initData?.static_stats}
      />
    </React.StrictMode>,
  );
};

const dispatchRenderAdminPanelV2LoginScreen = initData => {
  const root = ReactDOM.createRoot(document.getElementById('root'));
  console.log('INIT', initData);
  root.render(
    <React.StrictMode>
      <AdminPanelV2Login data={initData} />
    </React.StrictMode>,
  );
};

const dispatchRenderAdminPanelV2 = initData => {
  const root = ReactDOM.createRoot(document.getElementById('root'));
  console.log('INIT', initData);
  root.render(
    <React.StrictMode>
      <App data={initData} />
    </React.StrictMode>,
  );
};

const dispatchRenderLandingPage = initData => {
  const root = ReactDOM.createRoot(document.getElementById('root'));
  console.log('INIT', initData);
  root.render(
    <React.StrictMode>
      <LandingPage data={initData} />
    </React.StrictMode>,
  );
};

const dispatchRenderGraphApp = initData => {
  const root = ReactDOM.createRoot(document.getElementById('root'));
  console.log('INIT', initData);
  root.render(
    <React.StrictMode>
      <GraphApp inputGraph={initData?.initData} />
    </React.StrictMode>,
  );
};

const dispatchRenderUserListApp = initData => {
  const root = ReactDOM.createRoot(document.getElementById('root'));
  console.log('INIT', initData);
  root.render(
    <React.StrictMode>
      <UserListApp inputData={initData?.initData} />
    </React.StrictMode>,
  );
};

if (LOCAL_DEV) {
  simulatedAutoLogin().then(initData => {
    dispatchRenderApp(initData);
  });
} else {
  // Window function registered to be called from inside a django view
  console.log('Registered render function and cheese!');
  window.renderApp = dispatchRenderApp;
  window.renderAppV2 = renderAppV2; // TODO: Only relevant one, all others should be depricated once the new matching pannel is deployed!
  window.renderStatsApp = dispatchRenderStatsApp;
  window.renderGraphApp = dispatchRenderGraphApp;
  window.renderUserListApp = dispatchRenderUserListApp;
  window.renderAdminPanelV2 = dispatchRenderAdminPanelV2;
  window.renderAdminPanelV2LoginScreen = dispatchRenderAdminPanelV2LoginScreen;
  window.renderLandingPage = dispatchRenderLandingPage;
}

// If you want to start measuring performance in your app, pass a function
// to log results (for example: reportWebVitals(console.log))
// or send to an analytics endpoint. Learn more: https://bit.ly/CRA-vitals
reportWebVitals();

// Hello
