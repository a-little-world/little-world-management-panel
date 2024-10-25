import {
  CustomThemeProvider,
  GlobalStyles,
} from '@a-little-world/little-world-design-system';
import React, { PropsWithChildren } from 'react';
import { RouterProvider, ScrollRestoration } from 'react-router-dom';
import { Outlet, createBrowserRouter } from 'react-router-dom';

import Layout from './blocks/Layout';
import UserPanel from './blocks/UserPanel';
import {
  AdminPanelV2_EmailDetails,
  AdminPanelV2_Emails,
} from './panel_v2/AdminPanelEmails.jsx';
import {
  ALGORITHM_ROUTE,
  BASE_ROUTE,
  CREATE_NEW_EMAIL_ROUTE,
  EDIT_EMAIL_ROUTE,
  EMAILS_ROUTE,
  EMAIL_HTML_ROUTE,
  EMAIL_ROUTE,
  MATCHES_LIST_ROUTE,
  MATCHING_ROUTE,
  PREMATCH_APPOINTMENTS_ROUTE,
  SCORES_ROUTE,
  SEND_DYNAMIC_EMAIL_ROUTE,
  STATS_ROUTE,
  USERS_ROUTE,
  USER_DETAILS_ROUTE,
  VIDEO_CALLS_ROUTE,
} from './routes';
import { GlobalStateProvider } from './store';
import Algorithm from './views/Algorithm';
import Home from './views/Home';
import Matches from './views/Matches';
import Matching from './views/Matching';
import PrematchingAppointments from './views/PrematchingAppointments';
import Scores from './views/Scores';
import Stats from './views/Stats';
import Users from './views/Users';
import VideoCalls from './views/VideoCalls';
import CreateNewEmail from './views/emails/CreateNewEmail';
import Email from './views/emails/Email';
import EmailHtml from './views/emails/EmailHtml';
import Emails from './views/emails/Emails';
import { SendDynamicTemplateView } from './views/emails/SendDynamicTemplate';

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
        {
          path: CREATE_NEW_EMAIL_ROUTE,
          element: <CreateNewEmail />,
        },
        {
          path: EDIT_EMAIL_ROUTE,
          element: <CreateNewEmail />,
        },
        {
          path: SEND_DYNAMIC_EMAIL_ROUTE,
          element: <SendDynamicTemplateView />,
        },
        {
          path: EMAIL_ROUTE,
          element: <Email />,
        },
        {
          path: ALGORITHM_ROUTE,
          element: <Algorithm />,
        },
      ],
    },
    {
      path: EMAIL_HTML_ROUTE,
      element: <EmailHtml />,
    },
    {
      path: 'old-emails',
      element: <AdminPanelV2_Emails />,
    },
    {
      path: 'old-emails/:emailTemplateName',
      element: <AdminPanelV2_EmailDetails />,
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
