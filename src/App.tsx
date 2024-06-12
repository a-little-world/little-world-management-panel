import {
  CustomThemeProvider,
  GlobalStyles,
} from '@a-little-world/little-world-design-system';
import React, { PropsWithChildren, useMemo } from 'react';
import { RouterProvider, ScrollRestoration } from 'react-router-dom';
import { Outlet, createBrowserRouter } from 'react-router-dom';

import Layout from './blocks/Layout.tsx';
import UserPanel from './blocks/UserPanel.tsx';
import { AdminPanelV2_DevKit } from './panel_v2/AdminPanelDevkit.jsx';
import {
  AdminPanelV2_EmailDetails,
  AdminPanelV2_Emails,
} from './panel_v2/AdminPanelEmails.jsx';
import { AdminPanelV2_Matches } from './panel_v2/AdminPanelMatches.jsx';
import {
  BASE_ROUTE,
  DEVKIT_ROUTE,
  EMAILS_ROUTE,
  EMAIL_ROUTE,
  MATCHES_LIST_ROUTE,
  MATCHING_ROUTE,
  SCORES_ROUTE,
  USERS_ROUTE,
  USER_DETAILS_ROUTE,
} from './routes';
import { GlobalStateProvider } from './store.tsx';
import Home from './views/Home';
import Matches from './views/Matches';
import Matching from './views/Matching';
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
          path: USERS_ROUTE,
          element: <Users />,
        },
        {
          path: USER_DETAILS_ROUTE,
          element: <UserPanel />,
        },
        {
          path: MATCHING_ROUTE,
          element: <Matching />,
        },
        {
          path: MATCHES_LIST_ROUTE,
          element: <Matches />,
        },
        {
          path: SCORES_ROUTE,
          element: <AdminPanelV2_Matches />,
        },
        {
          path: EMAILS_ROUTE,
          element: <AdminPanelV2_Emails />,
        },
        {
          path: DEVKIT_ROUTE,
          element: <AdminPanelV2_DevKit />,
        },
        {
          path: EMAIL_ROUTE,
          element: <AdminPanelV2_EmailDetails />,
        },
      ],
    },
  ],
  { basename: BASE_ROUTE },
);

export function MatchingPannel({ apiOptions, apiTranslations }) {
  return (
    <GlobalStateProvider
      apiOptions={apiOptions}
      apiTranslations={apiTranslations}
    >
      <RouterProvider router={router} />
    </GlobalStateProvider>
  );
}
