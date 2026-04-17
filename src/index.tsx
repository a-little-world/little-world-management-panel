import React from 'react';
import ReactDOM from 'react-dom/client';

import { App } from './App';
import { EmailHtmlRenderer } from './components/views/emails/EmailHtml';
import './index.css';

function renderApp({ apiOptions, apiTranslations }) {
  const root = ReactDOM.createRoot(document.getElementById('root'));
  console.log('RENDERING APP');
  root.render(
    <React.StrictMode>
      <App apiOptions={apiOptions} apiTranslations={apiTranslations} />
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
window.renderApp = renderApp;
