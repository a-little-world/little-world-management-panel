import {
  createOpenChatClient,
  type BrowserToken,
  type InteractionStatus,
  type ListedChat,
  type OpenChatClient,
  type OpenChatScope,
} from '@open-chat-go/client';

import { apiFetch } from './helpers';
import type {
  OpenChatInteraction,
  OpenChatInteractionDetail,
  OpenChatInteractionState,
} from './openChat';

const OPEN_CHAT_BROWSER_TOKEN_ENDPOINT =
  '/api/matching/open-chat/browser-token/';

export function createAuthorizedOpenChatClient({
  baseUrl,
  userUuid,
  scopes,
}: {
  baseUrl: string;
  userUuid: string;
  scopes: OpenChatScope[];
}): OpenChatClient {
  const query = new URLSearchParams({ user_uuid: userUuid });
  return createOpenChatClient({
    baseUrl,
    // The client stores the implementation and invokes it later. Binding keeps
    // browsers that require Window as fetch's receiver from throwing
    // "Illegal invocation" before the request is sent.
    fetchImpl: globalThis.fetch.bind(globalThis),
    auth: {
      tokenProvider: () =>
        apiFetch<BrowserToken>(
          `${OPEN_CHAT_BROWSER_TOKEN_ENDPOINT}?${query.toString()}`,
          {
            method: 'POST',
            body: { scopes },
          },
        ),
    },
  });
}

function optionalString(value: unknown): string | null {
  return typeof value === 'string' && value.trim() ? value : null;
}

function interactionTitle(
  chat: Record<string, unknown>,
  interactionId: string,
) {
  const partner =
    chat.partner && typeof chat.partner === 'object'
      ? (chat.partner as Record<string, unknown>)
      : null;
  return (
    optionalString(partner?.name) ??
    optionalString(partner?.username) ??
    optionalString(partner?.bot_username) ??
    `Interaction ${interactionId}`
  );
}

function adaptInteraction(
  chat: ListedChat | Record<string, unknown>,
): OpenChatInteraction {
  const raw = chat as Record<string, unknown>;
  const interactionId = optionalString(raw.uuid) ?? '';
  return {
    interaction_id: interactionId,
    title: interactionTitle(raw, interactionId),
    created: optionalString(raw.created) ?? optionalString(raw.created_at),
    updated: optionalString(raw.updated) ?? optionalString(raw.updated_at),
    status: optionalString(raw.chat_type) ?? optionalString(raw.status),
    shared_interaction_url:
      optionalString(raw.shared_interaction_url) ??
      optionalString(raw.shared_url),
    raw,
  };
}

export async function fetchOpenChatInteractionsDirect(
  client: OpenChatClient,
): Promise<{ results: OpenChatInteraction[] }> {
  const page = await client.listChats({ page: 1, limit: 100 });
  return { results: page.rows.map(adaptInteraction) };
}

export async function fetchOpenChatInteractionDetailDirect(
  client: OpenChatClient,
  interactionUuid: string,
): Promise<OpenChatInteractionDetail> {
  return adaptInteraction(await client.getChat(interactionUuid));
}

function adaptInteractionState(
  state: InteractionStatus,
): OpenChatInteractionState {
  return {
    chat_uuid: state.chat_uuid || null,
    is_active: state.is_active,
    state: state.state,
    latest_message_uuid: state.latest_message_uuid ?? null,
    latest_message_finished: state.latest_message_finished ?? null,
    source: state.source || null,
  };
}

export async function fetchOpenChatInteractionStateDirect(
  client: OpenChatClient,
  interactionUuid: string,
): Promise<OpenChatInteractionState> {
  return adaptInteractionState(
    await client.getInteractionStatus(interactionUuid),
  );
}
