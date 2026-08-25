export const ALGORITHM_ROUTE = '/documentation/algorithm/';
export const BASE_ROUTE = '/matching/';
export const CREATE_NEW_EMAIL_ROUTE = '/email/new';
export const DEVKIT_ROUTE = '/devkit/';
export const DOCUMENTATION_ROUTE = '/documentation/';
export const JOURNEY_OVERVIEW_DOCUMENTATION_ROUTE =
  '/documentation/journey-overview-alpha/';
export const MATCH_JOURNEY_DOCUMENTATION_ROUTE =
  '/documentation/match-journey/';
export const MATCH_SUCCESS_DOCUMENTATION_ROUTE =
  '/documentation/match-success/';
export const MULTI_USER_MANAGEMENT_DOCUMENTATION_ROUTE =
  '/documentation/multi-user-management-and-management-onboarding/';
export const PRE_MATCHING_CHECKOFFS_DOCUMENTATION_ROUTE =
  '/documentation/pre-matching-check-offs/';
export const REPORTING_BUGS_DOCUMENTATION_ROUTE =
  '/documentation/reporting-bugs-and-issues/';
export const USER_JOURNEY_DOCUMENTATION_ROUTE = '/documentation/user-journey/';
export const DYNAMIC_USER_LISTS_ROUTE = '/dynamicuserlists/';
export const EDIT_EMAIL_ROUTE = '/email/:templateId/edit';
export const EMAIL_HTML_ROUTE = '/emails/:emailTemplateName/rendered';
export const EMAIL_ROUTE = '/emails/:emailTemplateName';
export const EMAILS_ROUTE = '/emails/';
export const MATCH_ROUTE = '/match/:matchId';
export const MATCHES_LIST_ROUTE = '/matches/';
export const MATCHING_ROUTE = '/match-info/';
export const PREMATCH_APPOINTMENTS_ROUTE = '/prematch-appointments/';
export const SCORES_ROUTE = '/scores/';
export const SEND_DYNAMIC_EMAIL_ROUTE =
  '/send-dynamic-email/:emailTemplateName/';
export const STATS_ROUTE = '/stats/';
export const USER_DETAILS_ROUTE = '/user/:userId';
export const USERS_ROUTE = '/users/';
export const MATCHING_USERS_ROUTE = '/matching-users/';
export const VIDEO_CALLS_ROUTE = '/video-calls/';
export const RANDOM_CALLS_ROUTE = '/random-calls/';
export const OPEN_CHAT_ROUTE = '/open-chat/';
export const OPEN_CHAT_CHAT_ROUTE = '/open-chat/:chatUuid/';
export const OPEN_CHAT_CONFIGURATION_ROUTE = '/open-chat/configuration/';
export const EVENTS_ROUTE = '/events/';
export const SHORT_LINKS_ROUTE = '/short-links/';
export const BANNERS_ROUTE = '/banners/';
export const BANNER_EDIT_ROUTE = '/banners/:bannerId/';
export const COMMUNICATIONS_ROUTE = '/communications/';
export const QUESTION_CARDS_ROUTE = '/question-cards/';
export const SURVEYS_ROUTE = '/surveys/';
export const SURVEY_EDIT_ROUTE = '/surveys/:campaignId/';

export const getSurveyEditRoute = (id: number | 'new') => `/surveys/${id}/`;

export const getSurveyResponsesRoute = (campaignId?: number) => {
  const params = new URLSearchParams({ tab: 'responses', page_size: '50' });
  if (campaignId != null) {
    params.set('campaign', String(campaignId));
  }
  return `${SURVEYS_ROUTE}?${params.toString()}`;
};
export const MATCHING_HUB_ROUTE = '/matchmaking/';
export const JOURNEY_OVERVIEW_ROUTE = '/journey-overview/';
export const COURSES_ROUTE = '/courses/';
export const COURSE_EDIT_ROUTE = '/courses/:courseSlug/';

export const getCourseEditRoute = (slug: string | 'new') => `/courses/${slug}/`;

export const getEditEmailRoute = (templateId: number) =>
  `/email/${templateId}/edit`;

export const SUPPORT_TASKS_ROUTE = '/support-tasks/';
export const SUPPORT_TASK_DETAIL_ROUTE = '/support-tasks/:taskId/';
export const getSupportTaskDetailRoute = (taskId: number) =>
  `/support-tasks/${taskId}/`;

export const getOpenChatChatRoute = (chatUuid: string) =>
  `/open-chat/${chatUuid}/`;
