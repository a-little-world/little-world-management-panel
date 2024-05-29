import React, { useMemo } from 'react';

import { RouterProvider, ScrollRestoration } from 'react-router-dom';
import { createBrowserRouter, Outlet } from 'react-router-dom';
import { AdminPanelV2_Matches } from './panel_v2/AdminPanelMatches.jsx';
import {
  AdminPanelV2_Emails,
  AdminPanelV2_EmailDetails,
} from './panel_v2/AdminPanelEmails.jsx';
import { AdminPanelV2_DevKit } from './panel_v2/AdminPanelDevkit.jsx';
import Home from './views/Home';
import Users from './views/Users';
import { CustomThemeProvider, GlobalStyles } from '@a-little-world/little-world-design-system';
import { GlobalStateProvider } from './store.tsx';
import UserPanel from './blocks/UserPanel.tsx';
import Layout from './blocks/Layout.tsx';

export const Root = ({ children, restoreScroll = true, withLayout = false }) => (
  <CustomThemeProvider>
    {restoreScroll && <ScrollRestoration />}
    <GlobalStyles />
    {withLayout ? (
      <Layout>{children || <Outlet />}</Layout>
    ) : (children || <Outlet />)}

  </CustomThemeProvider>
);

const router = createBrowserRouter(
  [
    {
      path: '/',
      element: <Root withLayout />,
      children: [
        {
          path: '',
          element: <Home />,
        },
        {
          path: 'users',
          element: <Users />,
        },
        {
          path: 'user/:userId',
          element: <UserPanel />,
        },
        {
          path: 'matches',
          element: <AdminPanelV2_Matches />,
        },
        {
          path: 'emails',
          element: <AdminPanelV2_Emails />,
        },
        {
          path: 'devkit',
          element: <AdminPanelV2_DevKit />,
        },
        {
          path: 'emails/:emailTemplateName',
          element: <AdminPanelV2_EmailDetails />,
        },
      ],
    },
  ],
  { basename: `/matching/` },
);


export function MatchingPannel({
  apiOptions,
  apiTranslations
}) {
  return <GlobalStateProvider apiOptions={apiOptions} apiTranslations={apiTranslations}>
    <RouterProvider router={router} />;
  </GlobalStateProvider>
}