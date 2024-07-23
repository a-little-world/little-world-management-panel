import React from 'react';
import ReactDOM from 'react-dom/client';
import './index.css';

import reportWebVitals from './reportWebVitals.js';
import { simulatedAutoLogin } from './loginSimulator.js';
import { LOCAL_DEV } from './ENVIRONMENT.js';
import { MatchingPannel } from './App.tsx';
import { EmailHtmlRenderer } from './views/EmailHtml';

function renderApp(
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

function renderEmail({
  template,
  params
}) {
  const root = ReactDOM.createRoot(document.getElementById('root'));
  root.render(
    <React.StrictMode>
      <EmailHtmlRenderer template={template} params={params} />
    </React.StrictMode>,
  );
}

window.renderEmail = renderEmail;

if (LOCAL_DEV) {
  simulatedAutoLogin().then(data => {
    const apiOptions = data?.data?.apiOptions;
    const apiTranslations = data?.api_translations;

    renderApp({
      apiOptions,
      apiTranslations
    });
  });
} else {
  window.renderApp = renderApp;
}

reportWebVitals();
