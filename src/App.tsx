import {
  CustomThemeProvider,
  GlobalStyles,
  ToastProvider,
} from '@a-little-world/little-world-design-system';
import React, { PropsWithChildren } from 'react';
import {
  Navigate,
  Outlet,
  RouterProvider,
  ScrollRestoration,
  createBrowserRouter,
} from 'react-router-dom';

import Layout from './components/blocks/Layout';
import UserPanel from './components/blocks/user/UserPanel';
import Algorithm from './components/views/Algorithm';
import Documentation, {
  MatchJourneyDocumentation,
  PreMatchingCheckoffsDocumentation,
  ReportingBugsAndIssuesDocumentation,
  UserJourneyDocumentation,
} from './components/views/Documentation';
import { DynamicUserListView } from './components/views/DynamicUserListView';
import Home from './components/views/Home';
import MatchPanel from './components/views/MatchPanel';
import Matches from './components/views/Matches';
import Matching from './components/views/Matching';
import MatchingUsers from './components/views/MatchingUsers';
import PrematchingAppointments from './components/views/PrematchingAppointments';
import JourneyOverview from './components/views/JourneyOverview';
import Scores from './components/views/Scores';
import Stats from './components/views/Stats';
import SupportTaskDetail from './components/views/SupportTaskDetail';
import SupportTasksOverview from './components/views/SupportTasksOverview';
import Users from './components/views/Users';
import VideoCalls from './components/views/VideoCalls';
import Communications from './components/views/comms/Communications';
import Banners from './components/views/comms/banners/Banners';
import EditBanner from './components/views/comms/banners/EditBanner';
import Events from './components/views/comms/events/Events';
import QuestionCards from './components/views/comms/questionCards/QuestionCards';
import ShortLinks from './components/views/comms/shortLinks/ShortLinks';
import Courses from './components/views/courses/Courses';
import EditCourse from './components/views/courses/EditCourse';
import CreateNewEmail from './components/views/emails/CreateNewEmail';
import Email from './components/views/emails/Email';
import EmailHtml from './components/views/emails/EmailHtml';
import Emails from './components/views/emails/Emails';
import { SendDynamicTemplateView } from './components/views/emails/SendDynamicTemplate';
import MatchingHub from './components/views/matching/MatchingHub';
import OpenChatChat from './components/views/OpenChatChat';
import {
  OPEN_CHAT_QUERY_PARAM_TAB,
  OPEN_CHAT_TAB_HOME,
} from './components/blocks/openChat/openChatConstants';
import RandomCalls from './components/views/randomCalls/RandomCalls';
import { EmailThemeProvider } from './emails/shared/theme';
import { routeTitle } from './router/routeHandle';
import {
  ALGORITHM_ROUTE,
  BANNERS_ROUTE,
  BANNER_EDIT_ROUTE,
  BASE_ROUTE,
  COMMUNICATIONS_ROUTE,
  COURSES_ROUTE,
  COURSE_EDIT_ROUTE,
  CREATE_NEW_EMAIL_ROUTE,
  DOCUMENTATION_ROUTE,
  DYNAMIC_USER_LISTS_ROUTE,
  EDIT_EMAIL_ROUTE,
  EMAILS_ROUTE,
  EMAIL_HTML_ROUTE,
  EMAIL_ROUTE,
  EVENTS_ROUTE,
  JOURNEY_OVERVIEW_ROUTE,
  MATCHES_LIST_ROUTE,
  MATCHING_HUB_ROUTE,
  MATCHING_ROUTE,
  MATCHING_USERS_ROUTE,
  MATCH_JOURNEY_DOCUMENTATION_ROUTE,
  MATCH_ROUTE,
  OPEN_CHAT_CONFIGURATION_ROUTE,
  OPEN_CHAT_ROUTE,
  OPEN_CHAT_CHAT_ROUTE,
  PRE_MATCHING_CHECKOFFS_DOCUMENTATION_ROUTE,
  PREMATCH_APPOINTMENTS_ROUTE,
  QUESTION_CARDS_ROUTE,
  RANDOM_CALLS_ROUTE,
  REPORTING_BUGS_DOCUMENTATION_ROUTE,
  SCORES_ROUTE,
  SEND_DYNAMIC_EMAIL_ROUTE,
  SHORT_LINKS_ROUTE,
  STATS_ROUTE,
  SUPPORT_TASKS_ROUTE,
  SUPPORT_TASK_DETAIL_ROUTE,
  USERS_ROUTE,
  USER_DETAILS_ROUTE,
  USER_JOURNEY_DOCUMENTATION_ROUTE,
  VIDEO_CALLS_ROUTE,
} from './router/routes';
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
          ...routeTitle('Management Portal'),
        },
        {
          path: COMMUNICATIONS_ROUTE,
          element: <Communications />,
          ...routeTitle('Communications'),
        },
        {
          path: MATCHING_HUB_ROUTE,
          element: <MatchingHub />,
          ...routeTitle('Matching'),
        },
        {
          path: USERS_ROUTE,
          element: <Users />,
          ...routeTitle('Users'),
        },
        {
          path: MATCHING_USERS_ROUTE,
          element: <MatchingUsers />,
          ...routeTitle('Matching users'),
        },
        {
          path: USER_DETAILS_ROUTE,
          element: <UserPanel />,
          ...routeTitle('User details'),
        },
        {
          path: MATCHING_ROUTE,
          element: <Matching />,
          ...routeTitle('Match info'),
        },
        {
          path: STATS_ROUTE,
          element: <Stats />,
          ...routeTitle('Stats'),
        },
        {
          path: DYNAMIC_USER_LISTS_ROUTE,
          element: <DynamicUserListView />,
          ...routeTitle('Dynamic User Lists'),
        },
        {
          path: MATCHES_LIST_ROUTE,
          element: <Matches />,
          ...routeTitle('Matches'),
        },
        {
          path: MATCH_ROUTE,
          element: <MatchPanel />,
          ...routeTitle('Match details'),
        },
        {
          path: PREMATCH_APPOINTMENTS_ROUTE,
          element: <PrematchingAppointments />,
          ...routeTitle('Onboarding Appointments'),
        },
        {
          path: VIDEO_CALLS_ROUTE,
          element: <VideoCalls />,
          ...routeTitle('Video Calls'),
        },
        {
          path: SCORES_ROUTE,
          element: <Scores />,
          ...routeTitle('Scores'),
        },
        {
          path: EMAILS_ROUTE,
          element: <Emails />,
          ...routeTitle('Emails'),
        },
        {
          path: CREATE_NEW_EMAIL_ROUTE,
          element: <CreateNewEmail />,
          ...routeTitle('New email'),
        },
        {
          path: EDIT_EMAIL_ROUTE,
          element: <CreateNewEmail />,
          ...routeTitle('Edit email'),
        },
        {
          path: SEND_DYNAMIC_EMAIL_ROUTE,
          element: <SendDynamicTemplateView />,
          ...routeTitle('Send dynamic email'),
        },
        {
          path: EMAIL_ROUTE,
          element: <Email />,
          ...routeTitle('Email'),
        },
        {
          path: ALGORITHM_ROUTE,
          element: <Algorithm />,
          ...routeTitle('Algorithm'),
        },
        {
          path: DOCUMENTATION_ROUTE,
          element: <Documentation />,
          ...routeTitle('Documentation'),
        },
        {
          path: JOURNEY_OVERVIEW_ROUTE,
          element: <JourneyOverview />,
          ...routeTitle('Journey Overview'),
        },
        {
          path: USER_JOURNEY_DOCUMENTATION_ROUTE,
          element: <UserJourneyDocumentation />,
        },
        {
          path: MATCH_JOURNEY_DOCUMENTATION_ROUTE,
          element: <MatchJourneyDocumentation />,
        },
        {
          path: REPORTING_BUGS_DOCUMENTATION_ROUTE,
          element: <ReportingBugsAndIssuesDocumentation />,
          ...routeTitle('Reporting Bugs and Issues'),
        },
        {
          path: PRE_MATCHING_CHECKOFFS_DOCUMENTATION_ROUTE,
          element: <PreMatchingCheckoffsDocumentation />,
          ...routeTitle('How Pre-Matching Check-offs Work'),
        },
        {
          path: RANDOM_CALLS_ROUTE,
          element: <RandomCalls />,
          ...routeTitle('Random Calls'),
        },
        {
          path: OPEN_CHAT_ROUTE,
          element: <OpenChatChat />,
          ...routeTitle('Open Chat'),
        },
        {
          path: OPEN_CHAT_CONFIGURATION_ROUTE,
          element: (
            <Navigate
              to={`${OPEN_CHAT_ROUTE}?${OPEN_CHAT_QUERY_PARAM_TAB}=${OPEN_CHAT_TAB_HOME}`}
              replace
            />
          ),
        },
        {
          path: OPEN_CHAT_CHAT_ROUTE,
          element: <OpenChatChat />,
          ...routeTitle('Open Chat'),
        },
        {
          path: EVENTS_ROUTE,
          element: <Events />,
          ...routeTitle('Events'),
        },
        {
          path: SHORT_LINKS_ROUTE,
          element: <ShortLinks />,
          ...routeTitle('Short Links'),
        },
        {
          path: QUESTION_CARDS_ROUTE,
          element: <QuestionCards />,
          ...routeTitle('Question Cards'),
        },
        {
          path: BANNERS_ROUTE,
          element: <Banners />,
          ...routeTitle('Banners'),
        },
        {
          path: BANNER_EDIT_ROUTE,
          element: <EditBanner />,
          ...routeTitle(({ bannerId }) =>
            bannerId === 'new' ? 'Create Banner' : 'Edit Banner',
          ),
        },
        {
          path: SUPPORT_TASKS_ROUTE,
          element: <SupportTasksOverview />,
          ...routeTitle('Support Tasks'),
        },
        {
          path: SUPPORT_TASK_DETAIL_ROUTE,
          element: <SupportTaskDetail />,
          ...routeTitle('Support Task'),
        },
        {
          path: COURSES_ROUTE,
          element: <Courses />,
          ...routeTitle('Courses'),
        },
        {
          path: COURSE_EDIT_ROUTE,
          element: <EditCourse />,
          ...routeTitle(({ courseSlug }) =>
            courseSlug === 'new' ? 'New course' : 'Edit course',
          ),
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

export function MatchingPannel({
  apiOptions,
  apiTranslations,
  panelUser = {},
}: {
  apiOptions: Record<string, unknown>;
  apiTranslations: Record<string, unknown>;
  panelUser?: Record<string, unknown>;
}) {
  return (
    <GlobalStateProvider
      apiOptions={apiOptions}
      apiTranslations={apiTranslations}
      panelUser={panelUser}
    >
      <RouterProvider router={router} />
    </GlobalStateProvider>
  );
}
