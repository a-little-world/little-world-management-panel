import { getOpenChatChatRoute, OPEN_CHAT_ROUTE } from '../../../router/routes';

export const OPEN_CHAT_MESSAGES_REFRESH_INTERVAL_MS = 1500;
export const OPEN_CHAT_QUERY_PARAM_TAB = 'tab';
export const OPEN_CHAT_TAB_CHAT = 'chat';
export const OPEN_CHAT_TAB_INTERACTIONS = 'interactions';
export const OPEN_CHAT_TAB_HOME = 'home';
export const LEGACY_OPEN_CHAT_TAB_CONFIGURATION = 'configuration';

export type OpenChatTab =
  | typeof OPEN_CHAT_TAB_CHAT
  | typeof OPEN_CHAT_TAB_INTERACTIONS
  | typeof OPEN_CHAT_TAB_HOME;

export const OPEN_CHAT_TAB_LABELS: Record<OpenChatTab, string> = {
  [OPEN_CHAT_TAB_CHAT]: 'Chats',
  [OPEN_CHAT_TAB_INTERACTIONS]: 'Interactions',
  [OPEN_CHAT_TAB_HOME]: 'Home',
};

export function resolveOpenChatTab(requestedTab: string | null): OpenChatTab {
  if (requestedTab === OPEN_CHAT_TAB_CHAT) {
    return OPEN_CHAT_TAB_CHAT;
  }
  if (requestedTab === OPEN_CHAT_TAB_INTERACTIONS) {
    return OPEN_CHAT_TAB_INTERACTIONS;
  }
  if (
    requestedTab === OPEN_CHAT_TAB_HOME ||
    requestedTab === LEGACY_OPEN_CHAT_TAB_CONFIGURATION
  ) {
    return OPEN_CHAT_TAB_HOME;
  }
  return OPEN_CHAT_TAB_HOME;
}

export function looksLikeUuid(value: string): boolean {
  return /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(
    value,
  );
}

export function buildOpenChatTabUrl(
  tab: OpenChatTab,
  options?: {
    userUuid?: string;
    resourceUuid?: string;
  },
): string {
  const search = new URLSearchParams();
  search.set(OPEN_CHAT_QUERY_PARAM_TAB, tab);
  if (options?.userUuid) {
    search.set('user_uuid', options.userUuid);
  }

  const base = options?.resourceUuid
    ? getOpenChatChatRoute(options.resourceUuid)
    : OPEN_CHAT_ROUTE;
  const query = search.toString();
  return query ? `${base}?${query}` : base;
}
