import { getCookiesAsObject } from '../utils.js';

export const addUserByHash = async (
  userHash: string,
  onError: (error: string) => void,
  onSuccess: (user: string[]) => void,
) => {
  fetch(`/api/matching/users/${userHash}/`, {
    method: 'GET',
    headers: {
      'Content-Type': 'application/json',
      'X-CSRFToken': getCookiesAsObject().csrftoken,
    },
  })
    .then(res => {
      console.log({ res });

      if (res.ok) {
        return res
          .json()
          .then(onSuccess)
          .catch(error => {
            console.error('Error parsing JSON:', error);
            onError('Failed to parse response as JSON');
          });
      } else {
        return res.text().then(text => {
          console.error('Server returned an error:', text);
          onError(text);
        });
      }
    })
    .catch(error => {
      console.error('Fetch error:', error);
      onError('Network error or server is not reachable');
    });
};

export const sendChatMessage = ({ userId, message, onError, onSuccess }) =>
  fetch(`/api/matching/users/${userId}/message_reply/`, {
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
  fetch(`/api/matching/users/${userId}/message_mark_read/`, {
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
      `/api/matching/users/${userId}/mark_unresponsive/`,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-CSRFToken': getCookiesAsObject().csrftoken,
        },
        body: JSON.stringify({
          unresponsive,
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
      `/api/matching/users/${userId}/mark_pre_matching_call_completed/`,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-CSRFToken': getCookiesAsObject().csrftoken,
        },
        body: JSON.stringify({
          had_prematching_call: completed,
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

export const burstUpdateMatchingScores = async ({ parallel_tasks }) => {
  const res = await fetch(`/api/matching/burst_update_scores/`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'X-CSRFToken': getCookiesAsObject().csrftoken,
    },
    body: JSON.stringify({
      parallel_tasks,
    }),
  });

  if (!res.ok) {
    throw new Error(await res.text());
  }
  const result = await res.json();
  return result;
};

export const matchUsers = ({ data, onError, onSuccess }) =>
  fetch(`/api/matching/make_match`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'X-CSRFToken': getCookiesAsObject().csrftoken,
    },
    body: JSON.stringify(data),
  })
    .then(res => {
      if (res.ok) {
        res.text().then(text => {
          onSuccess(text);
        });
      } else {
        res.text().then(text => {
          onError(new Error(text));
        });
      }
    })
    .catch(onError);

export const calculateScoreBetweenUsers = ({
  user1Id,
  user2Id,
  onSuccess,
  onError,
}) => {
  fetch(`/api/matching/users/${user1Id}/score_between/`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'X-CSRFToken': getCookiesAsObject().csrftoken,
    },
    body: JSON.stringify({ to_user: user2Id }),
  })
    .then(res => {
      if (res.ok) {
        res.text().then(text => {
          onSuccess(text);
        });
      } else {
        res.text().then(text => {
          onError(new Error(text));
        });
      }
    })
    .catch(onError);
};
