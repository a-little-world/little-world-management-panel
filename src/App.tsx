import {
  CustomThemeProvider,
  GlobalStyles,
} from '@a-little-world/little-world-design-system';
import React, { PropsWithChildren, useEffect } from 'react';
import {
  Outlet,
  RouterProvider,
  ScrollRestoration,
  createBrowserRouter,
  useLocation,
  useNavigationType,
} from 'react-router-dom';

import Layout from './blocks/Layout';
import UserPanel from './blocks/user/UserPanel';
import { EmailThemeProvider } from './emails/shared/theme';
import {
  AdminPanelV2_EmailDetails,
  AdminPanelV2_Emails,
} from './panel_v2/AdminPanelEmails.jsx';
import {
  ALGORITHM_ROUTE,
  BASE_ROUTE,
  CREATE_NEW_EMAIL_ROUTE,
  DYNAMIC_USER_LISTS_ROUTE,
  EDIT_EMAIL_ROUTE,
  EMAILS_ROUTE,
  EMAIL_HTML_ROUTE,
  EMAIL_ROUTE,
  MATCHES_LIST_ROUTE,
  MATCHING_ROUTE,
  MATCH_ROUTE,
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
import { DynamicUserListView } from './views/DynamicUserListView';
import Home from './views/Home';
import MatchPanel from './views/MatchPanel';
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

const NavigationLogger = () => {
  const location = useLocation();
  const navigationType = useNavigationType();

  useEffect(() => {
    console.log('[Navigation Event]', {
      path: location.pathname,
      search: location.search,
      hash: location.hash,
      type: navigationType,
      timestamp: new Date().toISOString(),
    });
  }, [location, navigationType]);

  return null;
};

export const Root = ({
  children,
  restoreScroll = true,
  withLayout = false,
}: PropsWithChildren<{ restoreScroll?: boolean; withLayout?: boolean }>) => (
  <CustomThemeProvider>
    <EmailThemeProvider>
      {restoreScroll && <ScrollRestoration />}
      <GlobalStyles />
      <NavigationLogger />
      {withLayout ? (
        <Layout>{children || <Outlet />}</Layout>
      ) : (
        children || <Outlet />
      )}
    </EmailThemeProvider>
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
  {
    basename: BASE_ROUTE,
    future: {
      v7_startTransition: true,
    },
  },
);

if (typeof window !== 'undefined') {
  window.addEventListener('beforeunload', event => {
    console.log('[Before Unload]', {
      timestamp: new Date().toISOString(),
      event: event.type,
    });
  });

  window.addEventListener('popstate', event => {
    console.log('[Pop State]', {
      timestamp: new Date().toISOString(),
      state: event.state,
    });
  });

  const originalPushState = window.history.pushState;
  window.history.pushState = function (...args) {
    console.log('[History Push]', {
      timestamp: new Date().toISOString(),
      args,
    });
    return originalPushState.apply(this, args);
  };

  const originalReplaceState = window.history.replaceState;
  window.history.replaceState = function (...args) {
    console.log('[History Replace]', {
      timestamp: new Date().toISOString(),
      args,
    });
    return originalReplaceState.apply(this, args);
  };
}

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
