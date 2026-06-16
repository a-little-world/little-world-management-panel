export const ALGORITHM_ROUTE = '/documentation/algorithm/';
export const BASE_ROUTE = '/matching/';
export const CREATE_NEW_EMAIL_ROUTE = '/email/new';
export const DEVKIT_ROUTE = '/devkit/';
export const DOCUMENTATION_ROUTE = '/documentation/';
export const MATCH_JOURNEY_DOCUMENTATION_ROUTE =
  '/documentation/match-journey/';
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
export const OPEN_CHAT_ACCESS_ROUTE = '/open-chat/';
export const EVENTS_ROUTE = '/events/';
export const SHORT_LINKS_ROUTE = '/short-links/';
export const BANNERS_ROUTE = '/banners/';
export const BANNER_EDIT_ROUTE = '/banners/:bannerId/';
export const COMMUNICATIONS_ROUTE = '/communications/';
export const QUESTION_CARDS_ROUTE = '/question-cards/';
export const MATCHING_HUB_ROUTE = '/matchmaking/';
export const COURSES_ROUTE = '/courses/';
export const COURSE_EDIT_ROUTE = '/courses/:courseSlug/';

export const getCourseEditRoute = (slug: string | 'new') =>
  `/courses/${slug}/`;

export const getEditEmailRoute = (templateId: number) =>
  `/email/${templateId}/edit`;

export const SUPPORT_TASKS_ROUTE = '/support-tasks/';
export const SUPPORT_TASK_DETAIL_ROUTE = '/support-tasks/:taskId/';
export const getSupportTaskDetailRoute = (taskId: number) =>
  `/support-tasks/${taskId}/`;
