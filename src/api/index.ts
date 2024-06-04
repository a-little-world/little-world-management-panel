import { getCookiesAsObject } from '../utils.js';

export const addUserByHash = async (
  userHash: string,
  onError: (error) => void,
  onSuccess: (user: string[]) => void,
) => {
  console.log('ADDING');
  fetch(`/api/admin/user_info/${userHash}/`)
    .then(res => {
      if (res.ok) {
        res.json().then(onSuccess);
      } else {
        res.text().then(onError);
      }
    })
    .catch(onError);
};

export const sendChatMessage = ({ userId, message, onError, onSuccess }) =>
  fetch(`/api/admin/user_advanced/${userId}/message_reply/`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'X-CSRFToken': getCookiesAsObject().csrftoken,
    },
    body: JSON.stringify({
      message,
    }),
  })
    .then(res => {
      if (res.ok) {
        res.json().then(onSuccess);
      } else {
        res.text().then(onError);
      }
    })
    .catch(onError);

export const markMessageAsRead = ({ messageId, userId, onError, onSuccess }) =>
  fetch(`/api/admin/user_advanced/${userId}/message_read/`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'X-CSRFToken': getCookiesAsObject().csrftoken,
    },
    body: JSON.stringify({
      message_id: messageId,
    }),
  })
    .then(res => {
      if (res.ok) {
        onSuccess();
      } else {
        onError();
      }
    })
    .catch(onError);

export const deleteMessage = ({}) => null;

export const sendSms = ({ userId, message, onError, onSuccess }) =>
  fetch(`/api/admin/quick_actions/send_sms_to_user/`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'X-CSRFToken': getCookiesAsObject().csrftoken,
    },
    body: JSON.stringify({
      message,
      user_id: userId,
    }),
  })
    .then(res => {
      if (res.ok) {
        res.json().then(onSuccess);
      } else {
        res.text().then(onError);
      }
    })
    .catch(onError);

export const setUserUnresponsive = async ({
  userId,
  unresponsive,
  onError,
  onSuccess,
}) => {
  try {
    const response = await fetch(
      `/api/admin/quick_actions/mark_user_as_unresponsive/`,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-CSRFToken': getCookiesAsObject().csrftoken,
        },
        body: JSON.stringify({
          unresponsive,
          user_id: userId,
        }),
      },
    );

    if (response.ok) {
      const result = await response.json();
      onSuccess(result);
    } else {
      const errorText = await response.text();
      onError(new Error(errorText));
    }
  } catch (error) {
    onError(error);
  }
};

export const setHadPrematchingCall = async ({
  userId,
  completed,
  onError,
  onSuccess,
}) => {
  try {
    const response = await fetch(
      `/api/admin/quick_actions/mark_pre_matching_call_completed/`,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-CSRFToken': getCookiesAsObject().csrftoken,
        },
        body: JSON.stringify({
          completed,
          user_id: userId,
        }),
      },
    );

    if (response.ok) {
      const result = await response.json();
      onSuccess(result);
    } else {
      const errorText = await response.text();
      onError(new Error(errorText));
    }
  } catch (error) {
    onError(error);
  }
};
