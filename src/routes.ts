export const BASE_ROUTE = '/matching/';
export const ALGORITHM_ROUTE = '/algorithm/';
export const USERS_ROUTE = '/users/';
export const USER_DETAILS_ROUTE = '/user/:userId';
export const MATCHES_LIST_ROUTE = '/matches/';
export const MATCHING_ROUTE = '/match-info/';
export const SCORES_ROUTE = '/scores/';
export const STATS_ROUTE = '/stats/';
export const PREMATCH_APPOINTMENTS_ROUTE = '/prematch-appointments/';
export const EMAILS_ROUTE = '/emails/';
export const EMAIL_ROUTE = '/emails/:emailTemplateName';
export const CREATE_NEW_EMAIL_ROUTE = '/email/new';
export const EDIT_EMAIL_ROUTE = '/email/:templateId/edit';
export const SEND_DYNAMIC_EMAIL_ROUTE =
  '/send-dynamic-email/:emailTemplateName/';
export const EMAIL_HTML_ROUTE = '/emails/:emailTemplateName/rendered';
export const DEVKIT_ROUTE = '/devkit/';
export const VIDEO_CALLS_ROUTE = '/video-calls/';
export const MESSAGE_LISTS_ROUTE = '/messagelists/';

export const getEditEmailRoute = (templateId: number) =>
  `/email/${templateId}/edit`;
