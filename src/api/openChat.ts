import { apiFetch } from './helpers';

export const OPEN_CHAT_CONFIGURATION_ENDPOINT =
  '/api/matching/open-chat-configuration/';

export const OPEN_CHAT_TEST_CONNECTION_ENDPOINT =
  '/api/matching/open-chat/test-connection/';

export const OPEN_CHAT_ACCESS_USERS_ENDPOINT =
  '/api/matching/open-chat-access-users/';
export const OPEN_CHAT_CHATS_ENDPOINT = '/api/chats/';
export const OPEN_CHAT_INTERACTIONS_ENDPOINT =
  '/api/matching/open-chat/interactions/';

export const DEFAULT_OPEN_CHAT_HOST = 'http://host.docker.internal:1984';

export type OpenChatConfiguration = {
  open_chat_api_key: string;
  open_chat_user: string;
  open_chat_host: string;
  matching_exists?: boolean;
  matching_user_uuid?: string | null;
  matching_user_id?: number | null;
};

const DOCKER_DEV_HOSTS = new Set([
  'host.docker.internal',
  'frontend',
  'backend',
]);

export function normalizeOpenChatBrowserHost(host: string): string {
  const trimmed = host.trim();
  const normalized = trimmed.includes('://') ? trimmed : `http://${trimmed}`;
  const url = new URL(normalized);

  if (DOCKER_DEV_HOSTS.has(url.hostname)) {
    url.hostname = 'localhost';
  }

  // In local dev the API is served by the backend on 1984; port 3000 is frontend-only.
  if (url.port === '3000') {
    url.port = '1984';
  }

  return url.origin;
}

export function normalizeOpenChatBrowserUrl(rawUrl: string): string {
  const parsed = new URL(rawUrl);
  const normalizedOrigin = normalizeOpenChatBrowserHost(parsed.origin);
  const normalized = new URL(rawUrl);
  const normalizedOriginUrl = new URL(normalizedOrigin);
  normalized.protocol = normalizedOriginUrl.protocol;
  normalized.hostname = normalizedOriginUrl.hostname;
  normalized.port = normalizedOriginUrl.port;
  return normalized.toString();
}

export function buildOpenChatLoginUrl(configuration: OpenChatConfiguration): string {
  const origin = normalizeOpenChatBrowserHost(configuration.open_chat_host);
  const params = new URLSearchParams({
    email: configuration.open_chat_user,
    password: configuration.open_chat_api_key,
    auto_login: 'true',
  });

  return `${origin}/login?${params.toString()}`;
}

export type OpenChatConfigurationPayload = OpenChatConfiguration;

export type OpenChatTestConnectionResult = {
  success: boolean;
  user_name?: string;
  detail?: string;
};

export type OpenChatAccessUser = {
  uuid: string;
  id: number;
  email: string;
  profile: {
    first_name: string;
    second_name: string;
    image?: string | null;
  };
  configuration: OpenChatConfiguration | null;
  matching_exists: boolean | null;
};

export type OpenChatPartner = {
  id: string;
  first_name?: string;
  second_name?: string;
  image?: string | null;
  censored?: boolean;
};

export type OpenChatListItem = {
  uuid: string;
  created: string;
  unread_count: number;
  newest_message: {
    uuid: string;
    sender: string;
    created: string;
    text: string;
    read: boolean;
  } | null;
  partner: OpenChatPartner;
};

type OpenChatListResponse = {
  results: OpenChatListItem[];
};

export type OpenChatMessage = {
  uuid: string;
  sender: string;
  created: string;
  text: string;
  read: boolean;
};

type OpenChatMessagesResponse = {
  results: OpenChatMessage[];
};

export type OpenChatInteraction = {
  interaction_id: string;
  title?: string | null;
  created?: string | null;
  updated?: string | null;
  status?: string | null;
  shared_interaction_url?: string | null;
  raw?: unknown;
};

type OpenChatInteractionsResponse = {
  results: OpenChatInteraction[];
};

export async function fetchOpenChatConfiguration(): Promise<OpenChatConfiguration | null> {
  try {
    return await apiFetch<OpenChatConfiguration>(
      OPEN_CHAT_CONFIGURATION_ENDPOINT,
    );
  } catch (error) {
    if ((error as { status?: number }).status === 404) {
      return null;
    }
    throw error;
  }
}

export function createOpenChatConfiguration(
  payload: OpenChatConfigurationPayload,
) {
  return apiFetch<OpenChatConfiguration>(OPEN_CHAT_CONFIGURATION_ENDPOINT, {
    method: 'POST',
    body: payload,
  });
}

export function updateOpenChatConfiguration(
  payload: OpenChatConfigurationPayload,
) {
  return apiFetch<OpenChatConfiguration>(OPEN_CHAT_CONFIGURATION_ENDPOINT, {
    method: 'PUT',
    body: payload,
  });
}

export function testOpenChatConnection() {
  return apiFetch<OpenChatTestConnectionResult>(
    OPEN_CHAT_TEST_CONNECTION_ENDPOINT,
    { method: 'POST', body: {} },
  );
}

export function fetchOpenChatAccessUsers() {
  return apiFetch<OpenChatAccessUser[]>(OPEN_CHAT_ACCESS_USERS_ENDPOINT);
}

export function fetchOpenChatsForUser(userUuid: string) {
  const query = new URLSearchParams({
    user_uuid: userUuid,
    page: '1',
    page_size: '20',
  });
  return apiFetch<OpenChatListResponse>(
    `${OPEN_CHAT_CHATS_ENDPOINT}?${query.toString()}`,
  );
}

export function fetchOpenChatMessages(chatUuid: string) {
  const query = new URLSearchParams({
    page: '1',
    page_size: '100',
  });
  return apiFetch<OpenChatMessagesResponse>(
    `/api/messages/${chatUuid}/?${query.toString()}`,
  );
}

export function fetchOpenChatInteractions(userUuid: string) {
  const query = new URLSearchParams({
    user_uuid: userUuid,
  });
  return apiFetch<OpenChatInteractionsResponse>(
    `${OPEN_CHAT_INTERACTIONS_ENDPOINT}?${query.toString()}`,
  );
}

export function sendOpenChatMessage(chatUuid: string, text: string) {
  return apiFetch<OpenChatMessage>(`/api/messages/${chatUuid}/send/`, {
    method: 'POST',
    body: { text },
  });
}

export function openChatDeleteChatEndpoint(chatUuid: string) {
  return `/api/matching/open-chat/chats/${chatUuid}/`;
}

export type OpenChatDeleteChatResult = {
  chat_uuid: string;
  detail: string;
};

export function deleteOpenChatChat(chatUuid: string) {
  return apiFetch<OpenChatDeleteChatResult>(openChatDeleteChatEndpoint(chatUuid), {
    method: 'DELETE',
  });
}

export function openChatUserConfigurationEndpoint(userId: number) {
  return `/api/matching/open-chat-access-users/${userId}/configuration/`;
}

export function createOpenChatUserConfiguration(
  userId: number,
  payload: OpenChatConfigurationPayload,
) {
  return apiFetch<OpenChatConfiguration>(
    openChatUserConfigurationEndpoint(userId),
    {
      method: 'POST',
      body: payload,
    },
  );
}

export function updateOpenChatUserConfiguration(
  userId: number,
  payload: OpenChatConfigurationPayload,
) {
  return apiFetch<OpenChatConfiguration>(
    openChatUserConfigurationEndpoint(userId),
    {
      method: 'PUT',
      body: payload,
    },
  );
}

export type OpenChatCreateMatchingResult = {
  matching_exists: boolean;
  match_uuid?: string;
  detail: string;
};

export function openChatCreateMatchingEndpoint(userId: number) {
  return `/api/matching/open-chat-access-users/${userId}/create-matching/`;
}

export function createOpenChatMatching(userId: number) {
  return apiFetch<OpenChatCreateMatchingResult>(
    openChatCreateMatchingEndpoint(userId),
    { method: 'POST', body: {} },
  );
}

export type OpenChatCreateChatResult = {
  chat_uuid: string;
  chat_created: boolean;
  detail: string;
};

export function openChatCreateChatEndpoint(userId: number) {
  return `/api/matching/open-chat-access-users/${userId}/create-chat/`;
}

export function createOpenChatChat(userId: number) {
  return apiFetch<OpenChatCreateChatResult>(openChatCreateChatEndpoint(userId), {
    method: 'POST',
    body: {},
  });
}
