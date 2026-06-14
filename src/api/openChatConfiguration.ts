import { apiFetch } from './helpers';

export const OPEN_CHAT_CONFIGURATION_ENDPOINT =
  '/api/matching/open-chat-configuration/';

export type OpenChatConfiguration = {
  open_chat_api_key: string;
  open_chat_user: string;
};

export type OpenChatConfigurationPayload = OpenChatConfiguration;

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
