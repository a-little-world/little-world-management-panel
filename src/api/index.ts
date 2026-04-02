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
}: {
  searchParams: string;
  onError: (error: any) => void;
  onSuccess: (result: any) => void;
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

export const sendFileAttachmentMessage = async ({
  file,
  text,
  chatId,
  onSuccess,
  onError,
}: {
  file: File;
  text: string;
  chatId: string;
  onSuccess: (result: any) => void;
  onError: (error: any) => void;
}) => {
  const data = new FormData();
  data.append('file', file);
  data.append('text', text);
  try {
    const result = await apiFetch(`/api/messages/${chatId}/send_attachment/`, {
      method: 'POST',
      useTagsOnly: true,
      body: data,
    });
    onSuccess(result);
  } catch (error) {
    onError(error);
  }
};

export const sendChatMessage = async ({
  chatId,
  text,
  onSuccess,
  onError,
}: {
  chatId: string;
  text: string;
  onSuccess: (result: any) => void;
  onError: (error: any) => void;
}) => {
  try {
    const result = await apiFetch(`/api/messages/${chatId}/send/`, {
      method: 'POST',
      useTagsOnly: true,
      body: { text },
    });
    onSuccess(result);
  } catch (error) {
    onError(error);
  }
};

export const markMessageAsRead = ({
  messageId,
  userId,
  onError,
  onSuccess,
}: {
  messageId: string;
  userId: string;
  onError: (error: any) => void;
  onSuccess: () => void;
}) =>
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
        onError('Request failed');
      }
    })
    .catch(onError);

export const deleteMessage = ({
  messageId,
  userId,
  onError,
  onSuccess,
}: {
  messageId: string;
  userId: string;
  onError: (error: any) => void;
  onSuccess: () => void;
}) =>
  fetch(
    `/api/matching/users/${userId}/delete_message/?message_id=${messageId}`,
    {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        'X-CSRFToken': getCookiesAsObject().csrftoken,
      },
    },
  )
    .then(res => {
      if (res.ok) {
        onSuccess();
      } else {
        onError('Request failed');
      }
    })
    .catch(onError);

export const sendSms = ({
  userId,
  message,
  onError,
  onSuccess,
}: {
  userId: string;
  message: { smsMessage: string };
  onError: (error: any) => void;
  onSuccess: (data: any) => void;
}) =>
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

export const sendPushNotification = ({
  userId,
  message,
  onError,
  onSuccess,
}: {
  userId: string;
  message: {
    pushNotificationTitle: string;
    pushNotificationDescription: string;
  };
  onError: (error: any) => void;
  onSuccess: () => void;
}) =>
  fetch(`/api/push_notifications/send`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'X-CSRFToken': getCookiesAsObject().csrftoken,
    },
    body: JSON.stringify({
      user: userId,
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
}: {
  userId: string;
  unresponsive: boolean;
  onError: (error: any) => void;
  onSuccess: (data: any) => void;
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
}: {
  emailTemplate: string;
  userList: string;
  onError: (error: any) => void;
  onSuccess: (result: any) => void;
}) => {
  try {
    const result = await apiFetch(
      `/api/matching/emails/dynamic_templates/${emailTemplate}/send/`,
      {
        method: 'POST',
        body: {
          user_list: userList,
        },
      },
    );

    onSuccess(result);
  } catch (error) {
    onError(error);
  }
};

export const setHadPrematchingCall = async ({
  userId,
  completed,
  onError,
  onSuccess,
}: {
  userId: string;
  completed: boolean;
  onError: (error: any) => void;
  onSuccess: (result: any) => void;
}) => {
  try {
    const result = await apiFetch(
      `/api/matching/users/${userId}/mark_prematching_call_completed/`,
      {
        method: 'POST',
        body: {
          is_onboarded: completed,
        },
      },
    );
    onSuccess(result);
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

export const deleteUser = async ({ id, onError, onSuccess }) => {
  // api needs to be added to delete user by id
  // try {
  //   const result = await apiFetch(`/api/matching/users/${id}/delete/`, {
  //     method: 'POST',
  //   });
  //   onSuccess(result);
  // } catch (error) {
  //   onError(error);
  // }
};

export const burstUpdateMatchingScores = async ({
  parallel_tasks,
  scoring_list = 'default',
  onSuccess,
  onError,
}: {
  parallel_tasks: number;
  scoring_list?: string;
  onSuccess: (result: any) => void;
  onError: (error: any) => void;
}) => {
  try {
    const url = `/api/matching/burst_update_scores/?scoring_list=${encodeURIComponent(scoring_list)}`;
    const result = await apiFetch(url, {
      method: 'POST',
      body: {
        parallel_tasks,
      },
    });
    onSuccess(result);
  } catch (error) {
    onError(error);
  }
};

export const clearActiveBurstCalculation = async ({
  force = false,
  onSuccess,
  onError,
}: {
  force?: boolean;
  onSuccess?: () => void;
  onError?: (error: any) => void;
}) => {
  try {
    const forceParam = force ? '?force=true' : '';
    await apiFetch(`/api/matching/clear_active_burst_calculation/${forceParam}`, {
      method: 'POST',
    });
    onSuccess?.();
  } catch (error) {
    onError?.(error);
  }
};

export const removeMatch = async ({
  id,
  reason,
  onError,
  onSuccess,
}: {
  id: string;
  reason: string;
  onError: (error: any) => void;
  onSuccess: (result: any) => void;
}) => {
  try {
    const result = await apiFetch(`/api/matching/matches/${id}/resolve/`, {
      method: 'POST',
      body: {
        reason,
      },
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
      `/api/matching/emails/dynamic_templates/${existingTemplate ? `${templateName}/` : ''
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

export const setHasMatchPriority = async ({
  userId,
  onError,
  onSuccess,
  priority,
}: {
  userId: string;
  onError: (error: any) => void;
  onSuccess: (result: any) => void;
  priority: boolean;
}) => {
  try {
    const result = await apiFetch(
      `/api/matching/users/${userId}/set_has_match_priority/`,
      {
        method: 'POST',
        body: {
          has_match_priority: priority,
        },
      },
    );
    onSuccess(result);
  } catch (error) {
    onError(error);
  }
};

export const setRandomCallBetaAccess = async ({
  userId,
  onError,
  onSuccess,
  randomCallsBetaAccess,
}: {
  userId: string;
  onError: (error: any) => void;
  onSuccess: (result: any) => void;
  randomCallsBetaAccess: boolean;
}) => {
  try {
    const result = await apiFetch(
      `/api/matching/users/${userId}/set_random_call_beta_access/`,
      {
        method: 'POST',
        body: {
          random_call_beta_access: randomCallsBetaAccess,
        },
      },
    );
    onSuccess(result);
  } catch (error) {
    onError(error);
  }
};

export const inviteNativeAppTester = async ({
  userId,
  platform,
  betaTesterEmail,
  appInviteUrl,
  nativeAppRepoUrl,
  nativeAppBugReportUrl,
  littleWorldAccountEmail,
  sendToEmail,
  onError,
  onSuccess,
}: {
  userId: string;
  platform: 'ios' | 'android';
  betaTesterEmail: string;
  appInviteUrl: string;
  nativeAppRepoUrl: string;
  nativeAppBugReportUrl: string;
  littleWorldAccountEmail?: string;
  sendToEmail?: string;
  onError: (error: any) => void;
  onSuccess: (result: any) => void;
}) => {
  try {
    const result = await apiFetch(
      `/api/matching/users/${userId}/invite_native_app_tester/`,
      {
        method: 'POST',
        body: {
          platform,
          beta_tester_email: betaTesterEmail,
          app_invite_url: appInviteUrl,
          native_app_repo_url: nativeAppRepoUrl,
          native_app_bug_report_url: nativeAppBugReportUrl,
          little_world_account_email: littleWorldAccountEmail || '',
          send_to_email: sendToEmail || betaTesterEmail,
        },
      },
    );
    onSuccess(result);
  } catch (error) {
    onError(error);
  }
};

export const completePrematchingCall = async ({
  appointmentDate,
  selectedUsers,
  sendMail,
  onSuccess,
  onError,
}) => {
  try {
    const result = await apiFetch(
      '/api/matching/users/complete_prematching_call/',
      {
        method: 'POST',
        body: {
          appointment_date: appointmentDate,
          selected_users: selectedUsers,
          send_mail: sendMail,
        },
      },
    );
    onSuccess(result);
  } catch (error) {
    onError(error);
  }
};
