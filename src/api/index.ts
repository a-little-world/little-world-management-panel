import { Theme } from '../emails/shared/theme';
import { getCookiesAsObject } from '../lib/utils';
import { apiFetch, formatApiError } from './helpers';

export const addUserByUuid = async (
  userUuid: string,
  onError: (error: string) => void,
  onSuccess: (user: string[]) => void,
) => {
  fetch(`/api/matching/users/${userUuid}/`, {
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

export const getUserDetails = async (userIdentifier: string) =>
  apiFetch<Record<string, any>>(`/api/matching/users/${userIdentifier}/`, {
    method: 'GET',
    headers: {
      'Content-Type': 'application/json',
      'X-CSRFToken': getCookiesAsObject().csrftoken,
    },
  });

export const getUserListExport = async ({
  searchParams,
  exportColumnsOnly = false,
  exportAll = false,
  onError,
  onSuccess,
}: {
  searchParams: string;
  exportColumnsOnly?: boolean;
  exportAll?: boolean;
  onError: (error: any) => void;
  onSuccess: (result: any) => void;
}) => {
  try {
    const params = new URLSearchParams(searchParams);
    if (exportColumnsOnly) {
      params.set('export_columns_only', 'true');
    }
    if (exportAll) {
      params.delete('page');
      params.delete('page_size');
    }

    const result = await apiFetch(
      `/api/matching/users_export/?${params.toString()}`,
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

export interface PaginatedListMeta {
  page_size?: number;
  pages_total?: number;
  last_page?: number;
  count?: number;
  items_total?: number;
}

export const getUsersListPaginationMeta = async ({
  searchParams,
  pageSize,
}: {
  searchParams: string;
  pageSize: number;
}) => {
  const params = new URLSearchParams(searchParams);
  params.set('page', '1');
  params.set('page_size', String(pageSize));

  const result = await apiFetch<PaginatedListMeta>(
    `/api/matching/users/?${params.toString()}`,
    {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        'X-CSRFToken': getCookiesAsObject().csrftoken,
      },
    },
  );

  return {
    pageSize,
    totalPages: Number(result.pages_total ?? result.last_page ?? 1),
    totalItems: Number(result.count ?? result.items_total ?? 0),
  };
};

export const getUsersExportPage = async ({
  searchParams,
  page,
  pageSize,
  selectedHeaders = [],
}: {
  searchParams: string;
  page: number;
  pageSize: number;
  selectedHeaders?: string[];
}) => {
  const params = new URLSearchParams(searchParams);
  params.set('page', String(page));
  params.set('page_size', String(pageSize));
  if (selectedHeaders.length > 0) {
    params.set('fields', selectedHeaders.join(','));
  }

  return apiFetch<Record<string, any>[]>(
    `/api/matching/users_export/?${params.toString()}`,
    {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        'X-CSRFToken': getCookiesAsObject().csrftoken,
      },
    },
  );
};

export const getUsersExportColumns = async ({
  searchParams,
}: {
  searchParams: string;
}) => {
  const params = new URLSearchParams(searchParams);
  params.set('export_columns_only', 'true');

  return apiFetch<Record<string, any>[]>(
    `/api/matching/users_export/?${params.toString()}`,
    {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        'X-CSRFToken': getCookiesAsObject().csrftoken,
      },
    },
  );
};

export const getMatchListExport = async ({
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
      `/api/matching/matches_export/?${searchParams}`,
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

export const getMatchesListPaginationMeta = async ({
  searchParams,
  pageSize,
}: {
  searchParams: string;
  pageSize: number;
}) => {
  const params = new URLSearchParams(searchParams);
  params.set('page', '1');
  params.set('page_size', String(pageSize));

  const result = await apiFetch<PaginatedListMeta>(
    `/api/matching/matches/?${params.toString()}`,
    {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        'X-CSRFToken': getCookiesAsObject().csrftoken,
      },
    },
  );

  return {
    pageSize,
    totalPages: Number(result.pages_total ?? result.last_page ?? 1),
    totalItems: Number(result.count ?? result.items_total ?? 0),
  };
};

export const getMatchesExportPage = async ({
  searchParams,
  page,
  pageSize,
  selectedHeaders = [],
}: {
  searchParams: string;
  page: number;
  pageSize: number;
  selectedHeaders?: string[];
}) => {
  const params = new URLSearchParams(searchParams);
  params.set('page', String(page));
  params.set('page_size', String(pageSize));
  if (selectedHeaders.length > 0) {
    params.set('fields', selectedHeaders.join(','));
  }

  return apiFetch<Record<string, any>[]>(
    `/api/matching/matches_export/?${params.toString()}`,
    {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        'X-CSRFToken': getCookiesAsObject().csrftoken,
      },
    },
  );
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

export const sendSupportMessageReply = async ({
  userId,
  text,
  file,
  onSuccess,
  onError,
}: {
  userId: string | number;
  text: string;
  file?: File | null;
  onSuccess: (result: any) => void;
  onError: (error: any) => void;
}) => {
  try {
    const body = file
      ? (() => {
          const data = new FormData();
          data.append('file', file);
          data.append('message', text);
          return data;
        })()
      : { message: text };

    const result = await apiFetch(`/api/matching/users/${userId}/message_reply/`, {
      method: 'POST',
      ...(file ? { useTagsOnly: true } : {}),
      body,
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
  fetch(`/api/matching/users/${userId}/delete_message/`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'X-CSRFToken': getCookiesAsObject().csrftoken,
    },
    body: JSON.stringify({
      message_id: messageId,
    }),
  })
    .then(async res => {
      if (res.ok) {
        onSuccess();
        return;
      }

      let errorMessage = 'Request failed';
      try {
        const body = await res.json();
        if (body?.msg) {
          errorMessage = body.msg;
        }
      } catch {
        // keep default error message
      }
      onError({ status: res.status, message: errorMessage });
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
          had_prematching_call: completed,
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

export const deleteUser = async ({
  id,
  onError,
  onSuccess,
}: {
  id: string | number;
  onError: (error: any) => void;
  onSuccess: (result: any) => void;
}) => {
  try {
    const result = await apiFetch(`/api/matching/users/${id}/delete_user/`, {
      method: 'POST',
      body: {
        send_deletion_email: true,
      },
    });
    onSuccess(result);
  } catch (error) {
    onError(error);
  }
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
    await apiFetch(
      `/api/matching/clear_active_burst_calculation/${forceParam}`,
      {
        method: 'POST',
      },
    );
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

export const setRandomCallsAccess = async ({
  userId,
  onError,
  onSuccess,
  randomCallsAccess,
}: {
  userId: string;
  onError: (error: any) => void;
  onSuccess: (result: any) => void;
  randomCallsAccess: boolean;
}) => {
  try {
    const result = await apiFetch(
      `/api/matching/users/${userId}/set_random_call_access/`,
      {
        method: 'POST',
        body: {
          random_call_access: randomCallsAccess,
        },
      },
    );
    onSuccess(result);
  } catch (error) {
    onError(error);
  }
};

export const updateUserProfileFields = async ({
  userId,
  user_type,
  country_of_residence,
  onError,
  onSuccess,
}: {
  userId: string | number;
  user_type?: 'learner' | 'volunteer';
  country_of_residence?: string;
  onError: (error: any) => void;
  onSuccess: (result: any) => void;
}) => {
  try {
    const body = {
      ...(user_type ? { user_type } : {}),
      ...(country_of_residence ? { country_of_residence } : {}),
    };
    const result = await apiFetch(
      `/api/matching/users/${userId}/update_profile_fields/`,
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

export type ManagementPermissionRow = {
  permission: string;
  codename: string;
  label?: string;
  enabled: boolean;
};

export type MatchingPanelUser = {
  id: number;
  uuid: string;
  email: string;
  first_name: string;
  last_name: string;
  is_staff: boolean;
  is_superuser: boolean;
  is_matching_user: boolean;
  can_edit_management_permissions: boolean;
  can_grant_apply_management_permissions: boolean;
  permissions: ManagementPermissionRow[];
};

export const fetchMatchingPanelUser = () =>
  apiFetch<MatchingPanelUser>('/api/matching/me/', { method: 'GET' });

export const fetchUserManagementPermissions = (userId: string) =>
  apiFetch<{ permissions: ManagementPermissionRow[] }>(
    `/api/matching/users/${userId}/permissions/`,
    { method: 'GET' },
  );

export const setUserManagementPermission = async ({
  userId,
  action,
  permission,
  onError,
  onSuccess,
}: {
  userId: string;
  action: 'add' | 'remove';
  permission: string;
  onError: (error: any) => void;
  onSuccess: (result: any) => void;
}) => {
  try {
    const result = await apiFetch(
      `/api/matching/users/${userId}/permissions/${action}/`,
      {
        method: 'POST',
        body: { permission },
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
  sendEmailsNow,
  onSuccess,
  onError,
}) => {
  try {
    const result = await apiFetch(
      '/api/matching/prematchingappointments/complete_prematching_call/',
      {
        method: 'POST',
        body: {
          appointment_date: appointmentDate,
          selected_users: selectedUsers,
          send_emails_now: sendEmailsNow,
        },
      },
    );
    onSuccess(result);
  } catch (error) {
    onError(error);
  }
};
