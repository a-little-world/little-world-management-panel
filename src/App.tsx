import {
  CustomThemeProvider,
  GlobalStyles,
} from '@a-little-world/little-world-design-system';
import React, { PropsWithChildren } from 'react';
import { RouterProvider, ScrollRestoration } from 'react-router-dom';
import { Outlet, createBrowserRouter } from 'react-router-dom';

import Layout from './blocks/Layout.tsx';
import UserPanel from './blocks/UserPanel.tsx';
import {
  AdminPanelV2_EmailDetails,
  AdminPanelV2_Emails,
} from './panel_v2/AdminPanelEmails.jsx';
import { AdminPanelV2_Matches } from './panel_v2/AdminPanelMatches.jsx';
import {
  BASE_ROUTE,
  EMAILS_ROUTE,
  EMAIL_HTML_ROUTE,
  EMAIL_ROUTE,
  MATCHES_LIST_ROUTE,
  MATCHING_ROUTE,
  PREMATCH_APPOINTMENTS_ROUTE,
  SCORES_ROUTE,
  STATS_ROUTE,
  USERS_ROUTE,
  USER_DETAILS_ROUTE,
  VIDEO_CALLS_ROUTE,
} from './routes';
import { GlobalStateProvider } from './store.tsx';
import Email from './views/Email';
import EmailHtml from './views/EmailHtml';
import Emails from './views/Emails';
import Home from './views/Home';
import Matches from './views/Matches';
import Matching from './views/Matching';
import Scores from './views/Scores';
import Stats from './views/Stats';
import Users from './views/Users';
import VideoCalls from './views/VideoCalls';
import PrematchingAppointments from './views/PrematchingAppointments';

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
          path: STATS_ROUTE,
          element: <Stats />,
        },
        {
          path: MATCHES_LIST_ROUTE,
          element: <Matches />,
        },
        {
          path: PREMATCH_APPOINTMENTS_ROUTE,
          element: <PrematchingAppointments />,
        },
        {
          path: VIDEO_CALLS_ROUTE,
          element: <VideoCalls />,
        },
        {
          path: SCORES_ROUTE,
          element: <Scores />,
        },
        {
          path: EMAILS_ROUTE,
          element: <Emails />,
        },
        // {
        //   path: EMAILS_ROUTE,
        //   element: <AdminPanelV2_Emails />,
        // },
        {
          path: EMAIL_ROUTE,
          element: <Email />,
        },
      ],
    },
    {
      path: EMAIL_HTML_ROUTE,
      element: <EmailHtml />,
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
