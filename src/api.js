import * as utils from './utils';
import { baseUrl } from './constants';

export function apiAdminAction(action, params) {
  /*
   * Calls a so-called admin action, see:
   * All functions names of `class AdminActions` can be called as an `action`
   * e.g.: apiAdminAction('send_test_message', {"user" : "benjamin.tim@gmx.de"})
   *       > sends an empty test message to a websocket connected user with the command to reload the page
   */
  return fetch(
    `${baseUrl}/anAdminPathTh3yS4y/user_management/matchingtab/action/`,
    {
      method: 'POST',
      headers: {
        /*
         * X-CSRFToken is required for every post request,
         * This request doesn't need additional authentication, this is handled by the `sessionid` cookie
         */
        'X-CSRFToken': utils.getCookiesAsObject().csrftoken,
      },
      body: utils.recursiveObjectToFormData({
        action,
        ...(params ? { payload: params } : {}),
      }),
    },
  );
}

export function genericTwoUserApiCall(path, u1, u2) {
  return fetch(path, {
    method: 'POST',
    headers: {
      'X-CSRFToken': utils.getCookiesAsObject().csrftoken,
    },
    body: JSON.stringify([u1, u2]),
  });
}
