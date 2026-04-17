import React from 'react';
import { RouterProvider } from 'react-router-dom';

import router from './router/router';
import { GlobalStateProvider } from './store';

export function App({ apiOptions, apiTranslations }) {
  return (
    <GlobalStateProvider
      apiOptions={apiOptions}
      apiTranslations={apiTranslations}
    >
      <RouterProvider router={router} />
    </GlobalStateProvider>
  );
}
