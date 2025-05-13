import { Theme } from '../emails/shared/theme';
import { getCookiesAsObject } from '../lib/utils';
import { apiFetch, formatApiError } from './helpers';

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

export const getUserListExport = async ({
  searchParams,
  onError,
  onSuccess,
}) => {
  try {
    const result = await apiFetch(
      `/api/matching/users_export/?${searchParams}`,
      {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'X-CSRFToken': getCookiesAsObject().csrftoken,
        },
      },
    );
    onSuccess(result);
  } catch (error) {
    onError(error);
  }
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
  fetch(`/api/matching/users/${userId}/sms/`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'X-CSRFToken': getCookiesAsObject().csrftoken,
    },
    body: JSON.stringify({
      message: message.smsMessage,
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

export const sendPushNotification = ({ userId, message, onError, onSuccess }) =>
  fetch(`/api/push_notifications/send`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'X-CSRFToken': getCookiesAsObject().csrftoken,
    },
    body: JSON.stringify({
      user: userId,
      headline: message.pushNotificationHeadline,
      title: message.pushNotificationTitle,
      description: message.pushNotificationDescription,
    }),
  })
    .then(res => {
      if (res.ok) {
        onSuccess();
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
      const responseBody = await response?.json();
      onSuccess(responseBody);
    } else {
      const responseBody = await response?.json();
      const error = formatApiError(responseBody, response);
      throw error;
    }
  } catch (error) {
    onError(error);
  }
};

export const setNewsletterSubscribed = async ({
  userId,
  onSuccess,
  onError,
  newsletter,
}) => {
  try {
    const result = await apiFetch(
      `/api/matching/users/${userId}/change_newsletter_subscribed/`,
      {
        method: 'POST',
        body: {
          newsletter_subscribed: newsletter,
        },
      },
    );
    onSuccess(result);
  } catch (error) {
    onError(error);
  }
};

export const sendEmail = async ({
  body,
  emailTemplateName,
  onSuccess,
  onError,
}) => {
  try {
    const result = await apiFetch(
      `/api/matching/emails/templates/${emailTemplateName}/send/`,
      {
        method: 'POST',
        body,
      },
    );
    onSuccess(result);
  } catch (error) {
    onError(error);
  }
};

export const sendBulkEmail = async ({
  emailTemplate,
  userList,
  onError,
  onSuccess,
}) => {
  try {
    const response = await fetch(
      `/api/matching/emails/dynamic_templates/${emailTemplate}/send/`,
      {
        method: 'POST',
        headers: {
          'X-CSRFToken': getCookiesAsObject().csrftoken,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          user_list: userList,
        }),
      },
    );

    if (response.ok) {
      const result = await response.json();
      onSuccess(result);
    } else {
      const errorText = await response.text();
      throw new Error(errorText);
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
      `/api/matching/users/${userId}/mark_prematching_call_completed/`,
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
      const responseBody = await response?.json();
      onSuccess(responseBody);
    } else {
      const responseBody = await response?.json();
      const error = formatApiError(responseBody, response);
      throw error;
    }
  } catch (error) {
    onError(error);
  }
};

export const updateUserNotes = async ({ id, notes, onSuccess, onError }) => {
  try {
    const result = await apiFetch(`/api/matching/users/${id}/notes/`, {
      method: 'POST',
      body: {
        notes,
      },
    });
    onSuccess(result);
  } catch (error) {
    onError(error);
  }
};

export const updateMatchNotes = async ({ id, notes, onSuccess, onError }) => {
  try {
    const result = await apiFetch(`/api/matching/matches/${id}/notes/`, {
      method: 'POST',
      body: {
        notes,
      },
    });
    onSuccess(result);
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

export const removeMatch = async ({ id, onError, onSuccess }) => {
  try {
    const result = await apiFetch(`/api/matching/matches/${id}/resolve/`, {
      method: 'POST',
    });
    onSuccess(result);
  } catch (error) {
    onError(error);
  }
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

export const getTaskStatus = async ({ taskId, onSuccess, onError }) => {
  try {
    const response = await fetch(`/api/matching/tasks/${taskId}/status/`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        'X-CSRFToken': getCookiesAsObject().csrftoken,
      },
    });

    if (response.ok) {
      const responseBody = await response?.json();
      onSuccess(responseBody);
    } else {
      const responseBody = await response?.json();
      const error = formatApiError(responseBody, response);
      throw error;
    }
  } catch (error) {
    onError(error);
  }
};

export const calculateAllScoresForUser = ({ user1Id, onSuccess, onError }) => {
  fetch(`/api/matching/users/${user1Id}/scores/`, {
    method: 'GET',
    headers: {
      'Content-Type': 'application/json',
      'X-CSRFToken': getCookiesAsObject().csrftoken,
    },
  })
    .then(async res => {
      if (res.ok) {
        const result = await res.json();
        onSuccess(result);
      } else {
        res.text().then(text => {
          onError(new Error(text));
        });
      }
    })
    .catch(onError);
};

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
    .then(async res => {
      if (res.ok) {
        const result = await res.json();
        onSuccess(result);
      } else {
        res.text().then(text => {
          onError(new Error(text));
        });
      }
    })
    .catch(onError);
};

export const updateDynamicTemplate = async ({
  category,
  existingTemplate,
  subject,
  templateName,
  template,
  templateContent,
  theme,
  onSuccess,
  onError,
  senderId = 'noreply',
}: {
  category: string;
  existingTemplate: boolean;
  subject: string;
  templateName: string;
  template: any;
  templateContent: any;
  onSuccess: (response: any) => void;
  onError: (error: any) => void;
  theme: Theme;
  senderId?: string;
}) => {
  try {
    const result = await apiFetch(
      `/api/matching/emails/dynamic_templates/${
        existingTemplate ? `${templateName}/` : ''
      }`,
      {
        method: existingTemplate ? 'PATCH' : 'POST',
        body: {
          template_name: templateName,
          template,
          subject,
          category_id: category,
          sender_id: senderId,
          theme,
          content: templateContent,
        },
      },
    );
    onSuccess(result);
  } catch (error) {
    onError(error);
  }
};

export const setMatchCompletedOffplattform = async ({
  matchId,
  completed_off_plattform,
  onError,
  onSuccess,
}) => {
  try {
    const response = await fetch(
      `/api/matching/matches/${matchId}/completed_off_plattform/`,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-CSRFToken': getCookiesAsObject().csrftoken,
        },
        body: JSON.stringify({
          completed_off_plattform,
        }),
      },
    );

    if (response.ok) {
      const responseBody = await response.json();
      onSuccess(responseBody);
    } else {
      const responseBody = await response.json();
      const error = formatApiError(responseBody, response);
      throw error;
    }
  } catch (error) {
    onError(error);
  }
};

export const setUserSearching = async ({
  userId,
  onError,
  onSuccess,
  searching,
}) => {
  try {
    const result = await apiFetch(
      `/api/matching/users/${userId}/change_searching_state/`,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-CSRFToken': getCookiesAsObject().csrftoken,
        },
        body: {
          searching_state: searching ? 'searching' : 'idle',
        },
      },
    );
    onSuccess(result);
  } catch (error) {
    onError(error);
  }
};
