import {
  CustomThemeProvider,
  GlobalStyles,
  ToastProvider,
  ToastViewport,
} from '@a-little-world/little-world-design-system';
import React, { PropsWithChildren } from 'react';
import {
  Outlet,
  RouterProvider,
  ScrollRestoration,
  createBrowserRouter,
} from 'react-router-dom';

import Layout from './components/blocks/Layout';
import UserPanel from './components/blocks/user/UserPanel';
import Algorithm from './components/views/Algorithm';
import Documentation from './components/views/Documentation';
import { DynamicUserListView } from './components/views/DynamicUserListView';
import Home from './components/views/Home';
import MatchPanel from './components/views/MatchPanel';
import Matches from './components/views/Matches';
import Matching from './components/views/Matching';
import PrematchingAppointments from './components/views/PrematchingAppointments';
import Scores from './components/views/Scores';
import Stats from './components/views/Stats';
import Users from './components/views/Users';
import VideoCalls from './components/views/VideoCalls';
import Events from './components/views/comms/events/Events';
import BannerFormPage from './components/views/comms/banners/BannerFormPage';
import Banners from './components/views/comms/banners/Banners';
import CreateNewEmail from './components/views/emails/CreateNewEmail';
import Email from './components/views/emails/Email';
import EmailHtml from './components/views/emails/EmailHtml';
import Emails from './components/views/emails/Emails';
import { SendDynamicTemplateView } from './components/views/emails/SendDynamicTemplate';
import RandomCalls from './components/views/randomCalls/RandomCalls';
import { EmailThemeProvider } from './emails/shared/theme';
import {
  ALGORITHM_ROUTE,
  BANNERS_ROUTE,
  BANNER_EDIT_ROUTE,
  BASE_ROUTE,
  CREATE_NEW_EMAIL_ROUTE,
  DOCUMENTATION_ROUTE,
  DYNAMIC_USER_LISTS_ROUTE,
  EDIT_EMAIL_ROUTE,
  EMAILS_ROUTE,
  EMAIL_HTML_ROUTE,
  EMAIL_ROUTE,
  EVENTS_ROUTE,
  MATCHES_LIST_ROUTE,
  MATCHING_ROUTE,
  MATCH_ROUTE,
  PREMATCH_APPOINTMENTS_ROUTE,
  RANDOM_CALLS_ROUTE,
  SCORES_ROUTE,
  SEND_DYNAMIC_EMAIL_ROUTE,
  STATS_ROUTE,
  USERS_ROUTE,
  USER_DETAILS_ROUTE,
  VIDEO_CALLS_ROUTE,
} from './routes';
import { GlobalStateProvider } from './store';

export const Root = ({
  children,
  restoreScroll = true,
  withLayout = false,
}: PropsWithChildren<{ restoreScroll?: boolean; withLayout?: boolean }>) => (
  <CustomThemeProvider>
    <ToastProvider swipeDirection="right">
      <EmailThemeProvider>
        {restoreScroll && <ScrollRestoration />}
        <GlobalStyles />
        {withLayout ? (
          <Layout>{children || <Outlet />}</Layout>
        ) : (
          children || <Outlet />
        )}
        <ToastViewport />
      </EmailThemeProvider>
    </ToastProvider>
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
          path: DYNAMIC_USER_LISTS_ROUTE,
          element: <DynamicUserListView />,
        },
        {
          path: MATCHES_LIST_ROUTE,
          element: <Matches />,
        },
        {
          path: MATCH_ROUTE,
          element: <MatchPanel />,
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
        {
          path: DOCUMENTATION_ROUTE,
          element: <Documentation />,
        },
        {
          path: RANDOM_CALLS_ROUTE,
          element: <RandomCalls />,
        },
        {
          path: EVENTS_ROUTE,
          element: <Events />,
        },
        {
          path: BANNERS_ROUTE,
          element: <Banners />,
        },
        {
          path: BANNER_EDIT_ROUTE,
          element: <BannerFormPage />,
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
