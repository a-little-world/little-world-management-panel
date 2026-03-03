export const ALGORITHM_ROUTE = '/documentation/algorithm/';
export const BASE_ROUTE = '/matching/';
export const CREATE_NEW_EMAIL_ROUTE = '/email/new';
export const DEVKIT_ROUTE = '/devkit/';
export const DOCUMENTATION_ROUTE = '/documentation/';
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
export const VIDEO_CALLS_ROUTE = '/video-calls/';
export const RANDOM_CALLS_ROUTE = '/random-calls/';

export const getEditEmailRoute = (templateId: number) =>
  `/email/${templateId}/edit`;
