import { apiFetch } from './helpers';

export const OPEN_CHAT_CONFIGURATION_ENDPOINT =
  '/api/matching/open-chat-configuration/';

export const OPEN_CHAT_TEST_CONNECTION_ENDPOINT =
  '/api/matching/open-chat/test-connection/';

export const OPEN_CHAT_ACCESS_USERS_ENDPOINT =
  '/api/matching/open-chat-access-users/';

export const DEFAULT_OPEN_CHAT_HOST = 'http://host.docker.internal:1984';

export type OpenChatConfiguration = {
  open_chat_api_key: string;
  open_chat_user: string;
  open_chat_host: string;
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
