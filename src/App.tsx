import {
  CustomThemeProvider,
  GlobalStyles,
} from '@a-little-world/little-world-design-system';
import React, { PropsWithChildren, useMemo } from 'react';
import { RouterProvider, ScrollRestoration } from 'react-router-dom';
import { Outlet, createBrowserRouter } from 'react-router-dom';

import Layout from './blocks/Layout.tsx';
import UserPanel from './blocks/UserPanel.tsx';
import {
  AdminPanelV2_EmailDetails,
  AdminPanelV2_Emails,
} from './panel_v2/AdminPanelEmails.jsx';
import { AdminPanelV2_Matches } from './panel_v2/AdminPanelMatches.jsx';
import { GlobalStateProvider } from './store.tsx';
import Home from './views/Home';
import Matches from './views/Matches';
import Users from './views/Users';

export const Root = ({
  children,
  restoreScroll = true,
  withLayout = false,
}: PropsWithChildren<{ restoreScroll?: boolean; withLayout?: boolean }>) => (
  <CustomThemeProvider>
    {restoreScroll && <ScrollRestoration />}
    <GlobalStyles />
    {withLayout ? (
      <Layout>{children || <Outlet />}</Layout>
    ) : (
      children || <Outlet />
    )}
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
          element: <Matches />,
        },
        {
          path: 'scores',
          element: <AdminPanelV2_Matches />,
        },
        {
          path: 'emails',
          element: <AdminPanelV2_Emails />,
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

export function MatchingPannel({ apiOptions, apiTranslations }) {
  return (
    <GlobalStateProvider
      apiOptions={apiOptions}
      apiTranslations={apiTranslations}
    >
      <RouterProvider router={router} />;
    </GlobalStateProvider>
  );
}
