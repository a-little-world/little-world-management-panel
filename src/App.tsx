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

import { RequireCapability } from './components/blocks/CapabilityGate';
import Layout from './components/blocks/Layout';
import {
  OPEN_CHAT_QUERY_PARAM_TAB,
  OPEN_CHAT_TAB_HOME,
} from './components/blocks/openChat/openChatConstants';
import UserPanel from './components/blocks/user/UserPanel';
import Algorithm from './components/views/Algorithm';
import Documentation, {
  AIUsagePolicyDocumentation,
  DevelopmentProcessDocumentation,
  JourneyOverviewDocumentation,
  MatchJourneyDocumentation,
  MatchSuccessDocumentation,
  MultiUserManagementDocumentation,
  PreMatchingCheckoffsDocumentation,
  ReportingBugsAndIssuesDocumentation,
  UserJourneyDocumentation,
} from './components/views/Documentation';
import { DynamicUserListView } from './components/views/DynamicUserListView';
import Home from './components/views/Home';
import JourneyOverview from './components/views/JourneyOverview';
import MatchPanel from './components/views/MatchPanel';
import Matches from './components/views/Matches';
import Matching from './components/views/Matching';
import OpenChatChat from './components/views/OpenChatChat';
import PrematchingAppointments from './components/views/PrematchingAppointments';
import Scores from './components/views/Scores';
import Stats from './components/views/Stats';
import SupportTaskDetail from './components/views/SupportTaskDetail';
import SupportTasksOverview from './components/views/SupportTasksOverview';
import TeamMembers from './components/views/TeamMembers';
import Users from './components/views/Users';
import VideoCalls from './components/views/VideoCalls';
import Communications from './components/views/comms/Communications';
import Banners from './components/views/comms/banners/Banners';
import EditBanner from './components/views/comms/banners/EditBanner';
import Events from './components/views/comms/events/Events';
import QuestionCards from './components/views/comms/questionCards/QuestionCards';
import ShortLinks from './components/views/comms/shortLinks/ShortLinks';
import EditSurvey from './components/views/comms/surveys/EditSurvey';
import Surveys from './components/views/comms/surveys/Surveys';
import Companies from './components/views/companies/Companies';
import EditCompany from './components/views/companies/EditCompany';
import Courses from './components/views/courses/Courses';
import EditCourse from './components/views/courses/EditCourse';
import CreateNewEmail from './components/views/emails/CreateNewEmail';
import Email from './components/views/emails/Email';
import EmailHtml from './components/views/emails/EmailHtml';
import Emails from './components/views/emails/Emails';
import { SendDynamicTemplateView } from './components/views/emails/SendDynamicTemplate';
import MatchingHub from './components/views/matching/MatchingHub';
import RandomCalls from './components/views/randomCalls/RandomCalls';
import UsersHub from './components/views/users/UsersHub';
import { EmailThemeProvider } from './emails/shared/theme';
import { EMAILS_CAPABILITIES } from './helpers/panelCapabilities';
import {
  COMMUNICATIONS_HUB_CAPABILITIES,
  MATCHING_HUB_CAPABILITIES,
  USERS_HUB_CAPABILITIES,
} from './router/panelNavigation';
import { routeTitle } from './router/routeHandle';
import {
  AI_USAGE_POLICY_DOCUMENTATION_ROUTE,
  ALGORITHM_ROUTE,
  BANNERS_ROUTE,
  BANNER_EDIT_ROUTE,
  BASE_ROUTE,
  COMMUNICATIONS_ROUTE,
  COMPANIES_ROUTE,
  COMPANY_EDIT_ROUTE,
  COURSES_ROUTE,
  COURSE_EDIT_ROUTE,
  CREATE_NEW_EMAIL_ROUTE,
  DEVELOPMENT_PROCESS_DOCUMENTATION_ROUTE,
  DOCUMENTATION_ROUTE,
  DYNAMIC_USER_LISTS_ROUTE,
  EDIT_EMAIL_ROUTE,
  EMAILS_ROUTE,
  EMAIL_HTML_ROUTE,
  EMAIL_ROUTE,
  EVENTS_ROUTE,
  JOURNEY_OVERVIEW_DOCUMENTATION_ROUTE,
  JOURNEY_OVERVIEW_ROUTE,
  MATCHES_LIST_ROUTE,
  MATCHING_HUB_ROUTE,
  MATCHING_ROUTE,
  MATCHING_USERS_ROUTE,
  MATCH_JOURNEY_DOCUMENTATION_ROUTE,
  MATCH_ROUTE,
  MATCH_SUCCESS_DOCUMENTATION_ROUTE,
  MULTI_USER_MANAGEMENT_DOCUMENTATION_ROUTE,
  OPEN_CHAT_CHAT_ROUTE,
  OPEN_CHAT_CONFIGURATION_ROUTE,
  OPEN_CHAT_ROUTE,
  PREMATCH_APPOINTMENTS_ROUTE,
  PRE_MATCHING_CHECKOFFS_DOCUMENTATION_ROUTE,
  QUESTION_CARDS_ROUTE,
  RANDOM_CALLS_ROUTE,
  REPORTING_BUGS_DOCUMENTATION_ROUTE,
  SCORES_ROUTE,
  SEND_DYNAMIC_EMAIL_ROUTE,
  SHORT_LINKS_ROUTE,
  STATS_ROUTE,
  SUPPORT_TASKS_ROUTE,
  SUPPORT_TASK_DETAIL_ROUTE,
  SURVEYS_ROUTE,
  SURVEY_EDIT_ROUTE,
  USERS_HUB_ROUTE,
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
          element: (
            <RequireCapability capability={COMMUNICATIONS_HUB_CAPABILITIES}>
              <Communications />
            </RequireCapability>
          ),
          ...routeTitle('Communications'),
        },
        {
          path: MATCHING_HUB_ROUTE,
          element: (
            <RequireCapability capability={MATCHING_HUB_CAPABILITIES}>
              <MatchingHub />
            </RequireCapability>
          ),
          ...routeTitle('Matching'),
        },
        {
          path: USERS_HUB_ROUTE,
          element: (
            <RequireCapability capability={USERS_HUB_CAPABILITIES}>
              <UsersHub />
            </RequireCapability>
          ),
          ...routeTitle('Users'),
        },
        {
          path: USERS_ROUTE,
          element: (
            <RequireCapability capability={'users'}>
              <Users />
            </RequireCapability>
          ),
          ...routeTitle('Users'),
        },
        {
          path: MATCHING_USERS_ROUTE,
          element: (
            <RequireCapability capability={'team_members'}>
              <TeamMembers />
            </RequireCapability>
          ),
          ...routeTitle('Team members'),
        },
        {
          path: USER_DETAILS_ROUTE,
          element: (
            <RequireCapability capability={'users'}>
              <UserPanel />
            </RequireCapability>
          ),
          ...routeTitle('User details'),
        },
        {
          path: MATCHING_ROUTE,
          element: (
            <RequireCapability capability={'scores'}>
              <Matching />
            </RequireCapability>
          ),
          ...routeTitle('Match info'),
        },
        {
          path: STATS_ROUTE,
          element: (
            <RequireCapability capability={'statistics'}>
              <Stats />
            </RequireCapability>
          ),
          ...routeTitle('Stats'),
        },
        {
          path: DYNAMIC_USER_LISTS_ROUTE,
          element: (
            <RequireCapability capability={'dynamic_user_lists'}>
              <DynamicUserListView />
            </RequireCapability>
          ),
          ...routeTitle('Dynamic User Lists'),
        },
        {
          path: MATCHES_LIST_ROUTE,
          element: (
            <RequireCapability capability={'matches'}>
              <Matches />
            </RequireCapability>
          ),
          ...routeTitle('Matches'),
        },
        {
          path: MATCH_ROUTE,
          element: (
            <RequireCapability capability={'matches'}>
              <MatchPanel />
            </RequireCapability>
          ),
          ...routeTitle('Match details'),
        },
        {
          path: PREMATCH_APPOINTMENTS_ROUTE,
          element: (
            <RequireCapability capability={'appointments'}>
              <PrematchingAppointments />
            </RequireCapability>
          ),
          ...routeTitle('Onboarding Appointments'),
        },
        {
          path: VIDEO_CALLS_ROUTE,
          element: (
            <RequireCapability capability={'video_calls'}>
              <VideoCalls />
            </RequireCapability>
          ),
          ...routeTitle('Video Calls'),
        },
        {
          path: SCORES_ROUTE,
          element: (
            <RequireCapability capability={'scores'}>
              <Scores />
            </RequireCapability>
          ),
          ...routeTitle('Scores'),
        },
        {
          path: EMAILS_ROUTE,
          element: (
            <RequireCapability capability={EMAILS_CAPABILITIES}>
              <Emails />
            </RequireCapability>
          ),
          ...routeTitle('Emails'),
        },
        {
          path: CREATE_NEW_EMAIL_ROUTE,
          element: (
            <RequireCapability capability={'dynamic_emails'}>
              <CreateNewEmail />
            </RequireCapability>
          ),
          ...routeTitle('New email'),
        },
        {
          path: EDIT_EMAIL_ROUTE,
          element: (
            <RequireCapability capability={'dynamic_emails'}>
              <CreateNewEmail />
            </RequireCapability>
          ),
          ...routeTitle('Edit email'),
        },
        {
          path: SEND_DYNAMIC_EMAIL_ROUTE,
          element: (
            <RequireCapability capability={'dynamic_emails'}>
              <SendDynamicTemplateView />
            </RequireCapability>
          ),
          ...routeTitle('Send dynamic email'),
        },
        {
          path: EMAIL_ROUTE,
          element: (
            <RequireCapability capability={'automated_emails'}>
              <Email />
            </RequireCapability>
          ),
          ...routeTitle('Email'),
        },
        {
          path: ALGORITHM_ROUTE,
          element: (
            <RequireCapability capability={'documentation'}>
              <Algorithm />
            </RequireCapability>
          ),
          ...routeTitle('Algorithm'),
        },
        {
          path: DOCUMENTATION_ROUTE,
          element: (
            <RequireCapability capability={'documentation'}>
              <Documentation />
            </RequireCapability>
          ),
          ...routeTitle('Documentation'),
        },
        {
          path: JOURNEY_OVERVIEW_ROUTE,
          element: (
            <RequireCapability capability={'documentation'}>
              <JourneyOverview />
            </RequireCapability>
          ),
          ...routeTitle('Journey Overview'),
        },
        {
          path: USER_JOURNEY_DOCUMENTATION_ROUTE,
          element: (
            <RequireCapability capability={'documentation'}>
              <UserJourneyDocumentation />
            </RequireCapability>
          ),
        },
        {
          path: JOURNEY_OVERVIEW_DOCUMENTATION_ROUTE,
          element: (
            <RequireCapability capability={'documentation'}>
              <JourneyOverviewDocumentation />
            </RequireCapability>
          ),
        },
        {
          path: MATCH_JOURNEY_DOCUMENTATION_ROUTE,
          element: (
            <RequireCapability capability={'documentation'}>
              <MatchJourneyDocumentation />
            </RequireCapability>
          ),
        },
        {
          path: MATCH_SUCCESS_DOCUMENTATION_ROUTE,
          element: (
            <RequireCapability capability={'documentation'}>
              <MatchSuccessDocumentation />
            </RequireCapability>
          ),
          ...routeTitle('Match Success'),
        },
        {
          path: REPORTING_BUGS_DOCUMENTATION_ROUTE,
          element: (
            <RequireCapability capability={'documentation'}>
              <ReportingBugsAndIssuesDocumentation />
            </RequireCapability>
          ),
          ...routeTitle('Reporting Bugs and Issues'),
        },
        {
          path: DEVELOPMENT_PROCESS_DOCUMENTATION_ROUTE,
          element: (
            <RequireCapability capability={'documentation'}>
              <DevelopmentProcessDocumentation />
            </RequireCapability>
          ),
          ...routeTitle('Development Process'),
        },
        {
          path: AI_USAGE_POLICY_DOCUMENTATION_ROUTE,
          element: (
            <RequireCapability capability={'documentation'}>
              <AIUsagePolicyDocumentation />
            </RequireCapability>
          ),
          ...routeTitle('AI Usage Policy'),
        },
        {
          path: MULTI_USER_MANAGEMENT_DOCUMENTATION_ROUTE,
          element: (
            <RequireCapability capability={'documentation'}>
              <MultiUserManagementDocumentation />
            </RequireCapability>
          ),
          ...routeTitle('Multi User Management and Management Onboarding'),
        },
        {
          path: PRE_MATCHING_CHECKOFFS_DOCUMENTATION_ROUTE,
          element: (
            <RequireCapability capability={'documentation'}>
              <PreMatchingCheckoffsDocumentation />
            </RequireCapability>
          ),
          ...routeTitle('How Pre-Matching Check-offs Work'),
        },
        {
          path: RANDOM_CALLS_ROUTE,
          element: (
            <RequireCapability capability={'random_calls'}>
              <RandomCalls />
            </RequireCapability>
          ),
          ...routeTitle('Random Calls'),
        },
        {
          path: OPEN_CHAT_ROUTE,
          element: (
            <RequireCapability capability={'open_chat'}>
              <OpenChatChat />
            </RequireCapability>
          ),
          ...routeTitle('Open Chat'),
        },
        {
          path: OPEN_CHAT_CONFIGURATION_ROUTE,
          element: (
            <RequireCapability capability={'open_chat'}>
              <Navigate
                to={`${OPEN_CHAT_ROUTE}?${OPEN_CHAT_QUERY_PARAM_TAB}=${OPEN_CHAT_TAB_HOME}`}
                replace
              />
            </RequireCapability>
          ),
        },
        {
          path: OPEN_CHAT_CHAT_ROUTE,
          element: (
            <RequireCapability capability={'open_chat'}>
              <OpenChatChat />
            </RequireCapability>
          ),
          ...routeTitle('Open Chat'),
        },
        {
          path: EVENTS_ROUTE,
          element: (
            <RequireCapability capability={'events'}>
              <Events />
            </RequireCapability>
          ),
          ...routeTitle('Events'),
        },
        {
          path: SHORT_LINKS_ROUTE,
          element: (
            <RequireCapability capability={'short_links'}>
              <ShortLinks />
            </RequireCapability>
          ),
          ...routeTitle('Short Links'),
        },
        {
          path: QUESTION_CARDS_ROUTE,
          element: (
            <RequireCapability capability={'question_cards'}>
              <QuestionCards />
            </RequireCapability>
          ),
          ...routeTitle('Question Cards'),
        },
        {
          path: BANNERS_ROUTE,
          element: (
            <RequireCapability capability={'banners'}>
              <Banners />
            </RequireCapability>
          ),
          ...routeTitle('Banners'),
        },
        {
          path: BANNER_EDIT_ROUTE,
          element: (
            <RequireCapability capability={'banners'}>
              <EditBanner />
            </RequireCapability>
          ),
          ...routeTitle(({ bannerId }) =>
            bannerId === 'new' ? 'Create Banner' : 'Edit Banner',
          ),
        },
        {
          path: SURVEYS_ROUTE,
          element: (
            <RequireCapability capability={'surveys'}>
              <Surveys />
            </RequireCapability>
          ),
          ...routeTitle('Surveys'),
        },
        {
          path: SURVEY_EDIT_ROUTE,
          element: (
            <RequireCapability capability={'surveys'}>
              <EditSurvey />
            </RequireCapability>
          ),
          ...routeTitle(({ campaignId }) =>
            campaignId === 'new' ? 'New survey' : 'Edit survey',
          ),
        },
        {
          path: SUPPORT_TASKS_ROUTE,
          element: (
            <RequireCapability capability={'support_tasks'}>
              <SupportTasksOverview />
            </RequireCapability>
          ),
          ...routeTitle('Support Tasks'),
        },
        {
          path: SUPPORT_TASK_DETAIL_ROUTE,
          element: (
            <RequireCapability capability={'support_tasks'}>
              <SupportTaskDetail />
            </RequireCapability>
          ),
          ...routeTitle('Support Task'),
        },
        {
          path: COURSES_ROUTE,
          element: (
            <RequireCapability capability={'courses'}>
              <Courses />
            </RequireCapability>
          ),
          ...routeTitle('Courses'),
        },
        {
          path: COURSE_EDIT_ROUTE,
          element: (
            <RequireCapability capability={'courses'}>
              <EditCourse />
            </RequireCapability>
          ),
          ...routeTitle(({ courseSlug }) =>
            courseSlug === 'new' ? 'New course' : 'Edit course',
          ),
        },
        {
          path: COMPANIES_ROUTE,
          element: (
            <RequireCapability capability={'companies'}>
              <Companies />
            </RequireCapability>
          ),
          ...routeTitle('Companies'),
        },
        {
          path: COMPANY_EDIT_ROUTE,
          element: (
            <RequireCapability capability={'companies'}>
              <EditCompany />
            </RequireCapability>
          ),
          ...routeTitle(({ companyId }) =>
            companyId === 'new' ? 'New company' : 'Edit company',
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
