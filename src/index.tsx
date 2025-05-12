import React from 'react';
import ReactDOM from 'react-dom/client';

import { MatchingPannel } from './App.tsx';
import { LOCAL_DEV } from './ENVIRONMENT.js';
import './index.css';
import { simulatedAutoLogin } from './loginSimulator.js';
import { EmailHtmlRenderer } from './views/emails/EmailHtml';

function renderApp({ apiOptions, apiTranslations }) {
  console.log('[RenderApp Called]', {
    timestamp: new Date().toISOString(),
    stack: new Error().stack,
    apiOptions: apiOptions ? 'present' : 'missing',
    apiTranslations: apiTranslations ? 'present' : 'missing',
  });

  const root = ReactDOM.createRoot(document.getElementById('root'));
  console.log('[RENDERING APP]');
  root.render(
    <React.StrictMode>
      <MatchingPannel
        apiOptions={apiOptions}
        apiTranslations={apiTranslations}
      />
    </React.StrictMode>,
  );
}

function renderEmail({ template, params }) {
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
      apiTranslations,
    });
  });
} else {
  console.log('[Setting up window.renderApp]', {
    timestamp: new Date().toISOString(),
    stack: new Error().stack,
  });

  const originalRenderApp = renderApp;
  window.renderApp = function (...args) {
    console.log('[window.renderApp called]', {
      timestamp: new Date().toISOString(),
      stack: new Error().stack,
      args: args.map(arg => (arg ? 'present' : 'missing')),
    });
    return originalRenderApp.apply(this, args);
  };
}

if (typeof document !== 'undefined') {
  document.addEventListener('visibilitychange', () => {
    console.log('[Page Visibility Changed]', {
      timestamp: new Date().toISOString(),
      state: document.visibilityState,
    });
  });
}

if (typeof window !== 'undefined') {
  window.addEventListener('load', () => {
    console.log('[Page Loaded]', {
      timestamp: new Date().toISOString(),
      url: window.location.href,
    });
  });

  window.addEventListener('unload', () => {
    console.log('[Page Unloading]', {
      timestamp: new Date().toISOString(),
      url: window.location.href,
    });
  });
}

//reportWebVitals();
