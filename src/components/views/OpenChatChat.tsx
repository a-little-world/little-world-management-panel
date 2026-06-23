import {
  Button,
  ButtonAppearance,
  ButtonSizes,
  Loading,
  LoadingSizes,
  StatusMessage,
  StatusTypes,
  Text,
  TextTypes,
  TrashIcon,
} from '@a-little-world/little-world-design-system';
import React, { useEffect, useMemo, useState } from 'react';
import { ExternalLink } from 'lucide-react';
import { Link, useNavigate, useParams, useSearchParams } from 'react-router-dom';
import styled from 'styled-components';
import useSWR from 'swr';

import type { MatchingPanelUser } from '../../api';
import {
  OPEN_CHAT_ACCESS_USERS_ENDPOINT,
  OPEN_CHAT_CONFIGURATION_ENDPOINT,
  deleteOpenChatChat,
  createOpenChatChat,
  fetchOpenChatAccessUsers,
  fetchOpenChatConfiguration,
  fetchOpenChatInteractionDetail,
  fetchOpenChatInteractions,
  fetchOpenChatMessages,
  fetchOpenChatsForUser,
  normalizeOpenChatBrowserHost,
  normalizeOpenChatBrowserUrl,
  sendOpenChatMessage,
  type OpenChatInteractionDetail,
  type OpenChatInteraction,
} from '../../api/openChat';
import {
  MANAGEMENT_PERMISSION_EDIT_OPEN_CHAT_CONFIGURATION,
  MANAGEMENT_PERMISSION_MANAGE_OPEN_CHAT_ACCESS,
  MANAGEMENT_PERMISSION_OPEN_CHAT_ACCESS,
} from '../../constants/managementPermissions';
import { hasManagementPermission } from '../../helpers/managementPermissions';
import { useGlobalState } from '../../store';
import {
  OPEN_CHAT_CONFIGURATION_ROUTE,
  OPEN_CHAT_ROUTE,
  getOpenChatChatRoute,
} from '../../router/routes';
import {
  Description,
  PageContainer,
} from '../atoms/PageLayout';
import { OpenChatConfigurationPanel } from './OpenChatAccess';

const Workspace = styled.div`
  display: grid;
  grid-template-columns: minmax(18rem, 24rem) 1fr;
  gap: ${({ theme }) => theme.spacing.medium};
  min-height: 0;
  flex: 1;
`;

const Panel = styled.div`
  border: 1px solid ${({ theme }) => theme.color.border.subtle};
  border-radius: ${({ theme }) => theme.radius.small};
  background: ${({ theme }) => theme.color.surface.primary};
  display: flex;
  flex-direction: column;
  min-height: 0;
`;

const PanelHeader = styled.div`
  padding: ${({ theme }) => theme.spacing.small};
  border-bottom: 1px solid ${({ theme }) => theme.color.border.subtle};
  display: flex;
  flex-direction: column;
  gap: ${({ theme }) => theme.spacing.xsmall};
`;

const PanelContent = styled.div`
  padding: ${({ theme }) => theme.spacing.small};
  overflow: auto;
  display: flex;
  flex-direction: column;
  gap: ${({ theme }) => theme.spacing.xsmall};
  min-height: 0;
`;

const InteractionPanelContent = styled(PanelContent)`
  padding: 0;
  overflow: hidden;
`;

const ListTabs = styled.div`
  display: flex;
  gap: ${({ theme }) => theme.spacing.xxxsmall};
`;

const ListTabButton = styled.button<{ $active: boolean }>`
  border: 1px solid
    ${({ theme, $active }) =>
      $active ? theme.color.border.selected : theme.color.border.subtle};
  border-radius: ${({ theme }) => theme.radius.xxsmall};
  background: ${({ theme, $active }) =>
    $active ? theme.color.surface.secondary : theme.color.surface.primary};
  color: ${({ theme }) => theme.color.text.primary};
  padding: ${({ theme }) => theme.spacing.xxxsmall}
    ${({ theme }) => theme.spacing.xsmall};
  cursor: pointer;
  text-transform: capitalize;
`;

const ChatListButton = styled.button<{ $active: boolean }>`
  border: 1px solid
    ${({ theme, $active }) =>
      $active ? theme.color.border.selected : theme.color.border.subtle};
  border-radius: ${({ theme }) => theme.radius.xxsmall};
  background: ${({ theme, $active }) =>
    $active ? theme.color.surface.secondary : theme.color.surface.primary};
  cursor: pointer;
  text-align: left;
  padding: ${({ theme }) => theme.spacing.xsmall};
  display: flex;
  flex-direction: column;
  gap: ${({ theme }) => theme.spacing.xxxsmall};
  min-height: 5.5rem;
  max-height: 5.5rem;
  overflow: hidden;
`;

const ChatListItemRow = styled.div`
  display: flex;
  gap: ${({ theme }) => theme.spacing.xxxsmall};
`;

const DeleteChatButton = styled.button`
  border: 1px solid ${({ theme }) => theme.color.border.subtle};
  border-radius: ${({ theme }) => theme.radius.xxsmall};
  background: ${({ theme }) => theme.color.surface.primary};
  color: ${({ theme }) => theme.color.text.secondary};
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  width: 2rem;
  min-width: 2rem;
  padding: 0;
`;

const MessageList = styled.div`
  flex: 1;
  min-height: 0;
  overflow: auto;
  display: flex;
  flex-direction: column;
  gap: ${({ theme }) => theme.spacing.xsmall};
`;

const InteractionHeaderRow = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: ${({ theme }) => theme.spacing.xsmall};
`;

const InteractionHeaderMeta = styled.div`
  display: flex;
  flex-direction: column;
  gap: ${({ theme }) => theme.spacing.xxxsmall};
`;

const InteractionFrame = styled.iframe`
  border: 0;
  border-radius: 0;
  width: 100%;
  height: 100%;
  min-height: 70vh;
  background: ${({ theme }) => theme.color.surface.primary};
`;

const InteractionExternalLink = styled.a`
  color: ${({ theme }) => theme.color.text.link};
  display: inline-flex;
  align-items: center;
  justify-content: center;
`;

const TargetUserBadge = styled.div`
  border: 1px solid ${({ theme }) => theme.color.border.subtle};
  border-radius: ${({ theme }) => theme.radius.xxsmall};
  padding: ${({ theme }) => theme.spacing.xxsmall};
  display: flex;
  flex-direction: column;
  gap: ${({ theme }) => theme.spacing.xxxsmall};
`;

const TargetUserLabel = styled(Text).attrs({
  type: TextTypes.Body7,
  tag: 'span' as const,
})`
  color: ${({ theme }) => theme.color.text.secondary};
`;

const TargetUserValue = styled(Text).attrs({
  type: TextTypes.Body7,
  tag: 'span' as const,
})`
  color: ${({ theme }) => theme.color.text.primary};
  word-break: break-all;
`;

const ListPrimaryText = styled(Text).attrs({
  type: TextTypes.Body6,
  tag: 'span' as const,
})`
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
`;

const ListSecondaryText = styled(Text).attrs({
  type: TextTypes.Body7,
  tag: 'span' as const,
})`
  overflow: hidden;
  text-overflow: ellipsis;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  line-clamp: 2;
  -webkit-box-orient: vertical;
`;

const MessageBubble = styled.div<{ $self: boolean; $interaction?: boolean }>`
  width: ${({ $interaction }) => ($interaction ? 'calc(100% - 0.5rem)' : 'auto')};
  max-width: ${({ $interaction }) =>
    $interaction ? 'calc(100% - 0.5rem)' : '80%'};
  align-self: ${({ $self }) => ($self ? 'flex-end' : 'flex-start')};
  border: 1px solid ${({ theme }) => theme.color.border.subtle};
  border-radius: ${({ theme }) => theme.radius.xxsmall};
  background: ${({ theme, $self }) =>
    $self ? theme.color.surface.secondary : theme.color.surface.primary};
  padding: ${({ theme }) => theme.spacing.xsmall};
  display: flex;
  flex-direction: column;
  gap: ${({ theme }) => theme.spacing.xxxsmall};
`;

const InteractionWidget = styled.div`
  border: 1px solid ${({ theme }) => theme.color.border.selected};
  border-radius: ${({ theme }) => theme.radius.xxsmall};
  padding: ${({ theme }) => theme.spacing.xxxsmall};
  display: flex;
  flex-direction: column;
  gap: ${({ theme }) => theme.spacing.xxxsmall};
  background: ${({ theme }) => theme.color.surface.primary};
`;

const InteractionWidgetHeader = styled.div`
  display: flex;
  justify-content: flex-end;
`;

const InteractionWidgetNavButton = styled.button`
  border: 0;
  background: transparent;
  color: ${({ theme }) => theme.color.text.link};
  display: inline-flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  padding: 0;
`;

const InteractionWidgetFrame = styled.iframe`
  border: 0;
  border-radius: ${({ theme }) => theme.radius.xxxsmall};
  width: 100%;
  height: 9rem;
  background: ${({ theme }) => theme.color.surface.primary};
`;

const Composer = styled.form`
  border-top: 1px solid ${({ theme }) => theme.color.border.subtle};
  padding: ${({ theme }) => theme.spacing.small};
  display: flex;
  gap: ${({ theme }) => theme.spacing.xsmall};
`;

const ComposerInput = styled.textarea`
  flex: 1;
  min-height: 4rem;
  max-height: 10rem;
  resize: vertical;
  border: 1px solid ${({ theme }) => theme.color.border.subtle};
  border-radius: ${({ theme }) => theme.radius.xxsmall};
  padding: ${({ theme }) => theme.spacing.xsmall};
  color: ${({ theme }) => theme.color.text.primary};
  background: ${({ theme }) => theme.color.surface.primary};
`;

type OpenChatInteractionPayload = {
  type: 'open_chat_interaction';
  title?: string;
  interaction_id: string;
  shared_interaction_url?: string | null;
};

const OPEN_CHAT_MESSAGES_REFRESH_INTERVAL_MS = 1500;
const OPEN_CHAT_QUERY_PARAM_TAB = 'tab';
const OPEN_CHAT_TAB_CHAT = 'chat';
const OPEN_CHAT_TAB_INTERACTIONS = 'interactions';
const OPEN_CHAT_TAB_HOME = 'home';
const LEGACY_OPEN_CHAT_TAB_CONFIGURATION = 'configuration';

type OpenChatTab =
  | typeof OPEN_CHAT_TAB_CHAT
  | typeof OPEN_CHAT_TAB_INTERACTIONS
  | typeof OPEN_CHAT_TAB_HOME;

function looksLikeUuid(value: string): boolean {
  return /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(
    value,
  );
}

function formatDateTime(value?: string | null): string | null {
  if (!value) {
    return null;
  }
  const parsed = new Date(value);
  if (Number.isNaN(parsed.getTime())) {
    return value;
  }
  return parsed.toLocaleString();
}

function withOpenChatLightTheme(rawUrl: string): string {
  const url = new URL(rawUrl);
  url.searchParams.set('theme', 'light');
  return url.toString();
}

function extractOpenChatInteractionUuid(rawUrl: string): string | null {
  try {
    const url = new URL(rawUrl);
    const match = url.pathname.match(/\/interaction\/([^/]+)/);
    return match?.[1] ?? null;
  } catch {
    return null;
  }
}

function buildNewestResponseUrl(rawUrl: string): string | null {
  try {
    const normalized = normalizeOpenChatBrowserUrl(rawUrl);
    const normalizedUrl = new URL(normalized);
    const interactionUuid = extractOpenChatInteractionUuid(normalized);
    if (!interactionUuid) {
      return null;
    }
    return withOpenChatLightTheme(
      `${normalizedUrl.origin}/interaction/${interactionUuid}/newest_response`,
    );
  } catch {
    return null;
  }
}

function parseOpenChatInteractionPayload(
  value: string,
): OpenChatInteractionPayload | null {
  try {
    const parsed = JSON.parse(value) as Partial<OpenChatInteractionPayload>;
    if (
      parsed?.type !== 'open_chat_interaction' ||
      typeof parsed?.interaction_id !== 'string'
    ) {
      return null;
    }
    return {
      type: 'open_chat_interaction',
      title: typeof parsed.title === 'string' ? parsed.title : undefined,
      interaction_id: parsed.interaction_id,
      shared_interaction_url:
        typeof parsed.shared_interaction_url === 'string'
          ? parsed.shared_interaction_url
          : null,
    };
  } catch {
    return null;
  }
}

const OpenChatChat = () => {
  const { panelUser } = useGlobalState();
  const currentUser = panelUser as MatchingPanelUser;
  const navigate = useNavigate();
  const { chatUuid: routeChatUuid } = useParams<{ chatUuid?: string }>();
  const [searchParams, setSearchParams] = useSearchParams();
  const requestedOpenChatUserUuid = searchParams.get('user_uuid')?.trim() ?? '';
  const requestedTab = searchParams.get(OPEN_CHAT_QUERY_PARAM_TAB);
  const selectedTab: OpenChatTab =
    requestedTab === OPEN_CHAT_TAB_CHAT
      ? OPEN_CHAT_TAB_CHAT
      : requestedTab === OPEN_CHAT_TAB_HOME ||
          requestedTab === LEGACY_OPEN_CHAT_TAB_CONFIGURATION
        ? OPEN_CHAT_TAB_HOME
        : OPEN_CHAT_TAB_INTERACTIONS;

  const canAccess = hasManagementPermission(
    currentUser,
    MANAGEMENT_PERMISSION_OPEN_CHAT_ACCESS,
  );
  const canManageOpenChatAccess = hasManagementPermission(
    currentUser,
    MANAGEMENT_PERMISSION_MANAGE_OPEN_CHAT_ACCESS,
  );
  const canEditOpenChatConfiguration = hasManagementPermission(
    currentUser,
    MANAGEMENT_PERMISSION_EDIT_OPEN_CHAT_CONFIGURATION,
  );

  const {
    data: configuration,
    error: configurationError,
    isLoading: isConfigurationLoading,
  } = useSWR(OPEN_CHAT_CONFIGURATION_ENDPOINT, fetchOpenChatConfiguration, {
    revalidateOnFocus: true,
  });

  const openChatUserUuid =
    requestedOpenChatUserUuid || configuration?.matching_user_uuid?.trim() || '';

  const {
    data: users,
    error: usersError,
    isLoading: isUsersLoading,
  } = useSWR(
    canManageOpenChatAccess ? OPEN_CHAT_ACCESS_USERS_ENDPOINT : null,
    fetchOpenChatAccessUsers,
    {
      revalidateOnFocus: true,
    },
  );

  const selectedUser = useMemo(
    () => users?.find(user => user.uuid === openChatUserUuid),
    [users, openChatUserUuid],
  );
  const targetUserId = selectedUser?.id ?? configuration?.matching_user_id ?? null;

  const {
    data: chatsData,
    error: chatsError,
    isLoading: isChatsLoading,
    mutate: refreshChats,
  } = useSWR(
    openChatUserUuid ? `/open-chat/chats/${openChatUserUuid}` : null,
    () => fetchOpenChatsForUser(openChatUserUuid),
    { revalidateOnFocus: true },
  );

  const chats = chatsData?.results ?? [];
  const selectedChatUuid =
    selectedTab === OPEN_CHAT_TAB_CHAT ? routeChatUuid ?? null : null;
  const [createChatError, setCreateChatError] = useState<string | null>(null);
  const [deleteChatError, setDeleteChatError] = useState<string | null>(null);
  const [isCreatingChat, setIsCreatingChat] = useState(false);
  const [deletingChatUuid, setDeletingChatUuid] = useState<string | null>(null);
  const [pendingCreatedChatUuid, setPendingCreatedChatUuid] = useState<string | null>(null);

  const {
    data: interactionsData,
    error: interactionsError,
    isLoading: isInteractionsLoading,
  } = useSWR(
    openChatUserUuid ? `/open-chat/interactions/${openChatUserUuid}` : null,
    () => fetchOpenChatInteractions(openChatUserUuid),
    { revalidateOnFocus: true },
  );
  const interactions = interactionsData?.results ?? [];
  const selectedInteractionUuid =
    selectedTab === OPEN_CHAT_TAB_INTERACTIONS ? routeChatUuid ?? null : null;
  const {
    data: interactionDetailData,
    error: interactionDetailError,
    isLoading: isInteractionDetailLoading,
  } = useSWR(
    selectedTab === OPEN_CHAT_TAB_INTERACTIONS &&
      selectedInteractionUuid &&
      looksLikeUuid(selectedInteractionUuid) &&
      openChatUserUuid
      ? `/open-chat/interactions/detail/${openChatUserUuid}/${selectedInteractionUuid}`
      : null,
    () =>
      fetchOpenChatInteractionDetail(
        selectedInteractionUuid as string,
        openChatUserUuid,
      ),
    { revalidateOnFocus: true },
  );

  const {
    data: messagesData,
    error: messagesError,
    isLoading: isMessagesLoading,
    mutate: refreshMessages,
  } = useSWR(
    selectedChatUuid ? `/open-chat/messages/${selectedChatUuid}` : null,
    () => fetchOpenChatMessages(selectedChatUuid as string),
    {
      revalidateOnFocus: true,
      refreshInterval: OPEN_CHAT_MESSAGES_REFRESH_INTERVAL_MS,
    },
  );

  const [draftMessage, setDraftMessage] = useState('');
  const [sendError, setSendError] = useState<string | null>(null);
  const [isSending, setIsSending] = useState(false);

  useEffect(() => {
    if (
      requestedTab === OPEN_CHAT_TAB_CHAT ||
      requestedTab === OPEN_CHAT_TAB_INTERACTIONS ||
      requestedTab === OPEN_CHAT_TAB_HOME ||
      requestedTab === LEGACY_OPEN_CHAT_TAB_CONFIGURATION
    ) {
      return;
    }
    const nextSearchParams = new URLSearchParams(searchParams);
    nextSearchParams.set(OPEN_CHAT_QUERY_PARAM_TAB, OPEN_CHAT_TAB_INTERACTIONS);
    setSearchParams(nextSearchParams, { replace: true });
  }, [requestedTab, searchParams, setSearchParams]);

  useEffect(() => {
    if (selectedTab !== OPEN_CHAT_TAB_CHAT) {
      return;
    }

    if (!chats.length) {
      return;
    }

    if (
      pendingCreatedChatUuid &&
      chats.some(chat => chat.uuid === pendingCreatedChatUuid)
    ) {
      setPendingCreatedChatUuid(null);
    }

    const routeChatExists = selectedChatUuid
      ? chats.some(chat => chat.uuid === selectedChatUuid)
      : false;
    if (!selectedChatUuid) {
      navigateToChat(chats[0].uuid, true);
      return;
    }

    if (routeChatExists) {
      return;
    }

    if (
      pendingCreatedChatUuid &&
      selectedChatUuid === pendingCreatedChatUuid
    ) {
      return;
    }

    navigateToChat(chats[0].uuid, true);
  }, [
    chats,
    selectedChatUuid,
    navigate,
    pendingCreatedChatUuid,
    selectedTab,
  ]);

  useEffect(() => {
    if (selectedTab !== OPEN_CHAT_TAB_INTERACTIONS) {
      return;
    }
    if (!interactions.length) {
      return;
    }
    const routeInteractionExists = selectedInteractionUuid
      ? interactions.some(
          interaction => interaction.interaction_id === selectedInteractionUuid,
        )
      : false;
    if (!selectedInteractionUuid || !routeInteractionExists) {
      navigateToInteraction(interactions[0].interaction_id, true);
    }
  }, [interactions, selectedInteractionUuid, selectedTab]);

  const selectedInteraction: OpenChatInteraction | null =
    interactions.find(
      interaction => interaction.interaction_id === selectedInteractionUuid,
    ) ?? null;
  const selectedInteractionDetail: OpenChatInteractionDetail | null =
    interactionDetailData ?? selectedInteraction;

  const interactionBrowserOrigin = useMemo(() => {
    const host =
      selectedUser?.configuration?.open_chat_host ?? configuration?.open_chat_host;
    if (!host) {
      return null;
    }
    try {
      return normalizeOpenChatBrowserHost(host);
    } catch {
      return null;
    }
  }, [selectedUser, configuration]);

  const interactionFrameUrl = useMemo(() => {
    const sharedUrl = selectedInteractionDetail?.shared_interaction_url;
    if (sharedUrl) {
      try {
        return withOpenChatLightTheme(normalizeOpenChatBrowserUrl(sharedUrl));
      } catch {
        // Fallback to interaction page URL below if shared URL parsing fails.
      }
    }
    if (!interactionBrowserOrigin || !selectedInteractionUuid) {
      return null;
    }
    return withOpenChatLightTheme(
      `${interactionBrowserOrigin}/interaction/${selectedInteractionUuid}`,
    );
  }, [selectedInteractionDetail, interactionBrowserOrigin, selectedInteractionUuid]);


  const navigateToChat = (chatUuid: string, replace = false) => {
    const nextSearchParams = new URLSearchParams(searchParams);
    nextSearchParams.set(OPEN_CHAT_QUERY_PARAM_TAB, OPEN_CHAT_TAB_CHAT);
    const serializedSearchParams = nextSearchParams.toString();
    navigate(
      `${getOpenChatChatRoute(chatUuid)}${
        serializedSearchParams ? `?${serializedSearchParams}` : ''
      }`,
      { replace },
    );
  };

  const navigateToInteraction = (
    interactionUuid: string,
    replace = false,
  ) => {
    const nextSearchParams = new URLSearchParams(searchParams);
    nextSearchParams.set(OPEN_CHAT_QUERY_PARAM_TAB, OPEN_CHAT_TAB_INTERACTIONS);
    const serializedSearchParams = nextSearchParams.toString();
    navigate(
      `${getOpenChatChatRoute(interactionUuid)}${
        serializedSearchParams ? `?${serializedSearchParams}` : ''
      }`,
      { replace },
    );
  };

  const handleSelectTab = (tab: OpenChatTab) => {
    const nextSearchParams = new URLSearchParams(searchParams);
    nextSearchParams.set(OPEN_CHAT_QUERY_PARAM_TAB, tab);
    const serializedSearchParams = nextSearchParams.toString();
    if (
      tab === OPEN_CHAT_TAB_INTERACTIONS ||
      tab === OPEN_CHAT_TAB_HOME
    ) {
      navigate(
        `${OPEN_CHAT_ROUTE}${serializedSearchParams ? `?${serializedSearchParams}` : ''}`,
      );
      return;
    }
    setSearchParams(nextSearchParams, { replace: true });
  };

  const handleCreateChat = async () => {
    if (!targetUserId) {
      return;
    }

    setCreateChatError(null);
    setIsCreatingChat(true);

    try {
      const result = await createOpenChatChat(targetUserId);
      setPendingCreatedChatUuid(result.chat_uuid);
      navigateToChat(result.chat_uuid);
      void refreshChats();
    } catch (error) {
      setPendingCreatedChatUuid(null);
      setCreateChatError(
        error instanceof Error ? error.message : 'Could not create chat.',
      );
    } finally {
      setIsCreatingChat(false);
    }
  };

  const handleDeleteChat = async (chatUuid: string) => {
    if (deletingChatUuid) {
      return;
    }

    setDeleteChatError(null);
    setDeletingChatUuid(chatUuid);

    try {
      await deleteOpenChatChat(chatUuid);
      if (selectedChatUuid === chatUuid) {
        const nextSearchParams = new URLSearchParams(searchParams);
        nextSearchParams.set(OPEN_CHAT_QUERY_PARAM_TAB, OPEN_CHAT_TAB_CHAT);
        const serializedSearchParams = nextSearchParams.toString();
        navigate(
          `${OPEN_CHAT_ROUTE}${serializedSearchParams ? `?${serializedSearchParams}` : ''}`,
          { replace: true },
        );
      }
      await refreshChats();
    } catch (error) {
      setDeleteChatError(
        error instanceof Error ? error.message : 'Could not delete chat.',
      );
    } finally {
      setDeletingChatUuid(null);
    }
  };

  const handleSendMessage = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    if (!selectedChatUuid) {
      return;
    }

    const text = draftMessage.trim();
    if (!text) {
      return;
    }

    setIsSending(true);
    setSendError(null);

    try {
      await sendOpenChatMessage(selectedChatUuid, text);
      setDraftMessage('');
      await refreshMessages();
      await refreshChats();
    } catch (error) {
      setSendError(error instanceof Error ? error.message : 'Could not send message.');
    } finally {
      setIsSending(false);
    }
  };

  const handleComposerKeyDown = (
    event: React.KeyboardEvent<HTMLTextAreaElement>,
  ) => {
    if (event.key !== 'Enter' || event.shiftKey) {
      return;
    }
    event.preventDefault();
    if (!selectedChatUuid || isSending || !draftMessage.trim()) {
      return;
    }
    const form = event.currentTarget.form;
    if (form) {
      form.requestSubmit();
    }
  };

  if (!canAccess) {
    return (
      <PageContainer>
        <Text type={TextTypes.Body4} tag="p">
          You need the open chat access permission to view this page.
        </Text>
      </PageContainer>
    );
  }

  if (isConfigurationLoading && !requestedOpenChatUserUuid) {
    return (
      <PageContainer>
        <Loading size={LoadingSizes.Small} />
      </PageContainer>
    );
  }

  if (configurationError) {
    return (
      <PageContainer>
        <StatusMessage type={StatusTypes.Error} visible>
          Could not load Open Chat configuration.
        </StatusMessage>
      </PageContainer>
    );
  }

  if (!openChatUserUuid) {
    return (
      <PageContainer>
        <Description type={TextTypes.Body4} tag="p">
          No matching partner was found for your user. Create or verify a matching
          first on <Link to={OPEN_CHAT_CONFIGURATION_ROUTE}>Open Chat configuration</Link>.
        </Description>
        <Text type={TextTypes.Body4} tag="p">
          Missing chat target user UUID.
        </Text>
      </PageContainer>
    );
  }

  const orderedMessages = [...(messagesData?.results ?? [])].reverse();

  return (
    <PageContainer>
      {((canManageOpenChatAccess && usersError) ||
        chatsError ||
        interactionsError ||
        interactionDetailError) && (
        <StatusMessage type={StatusTypes.Error} visible>
          {usersError
            ? 'Could not load open chat users.'
            : chatsError
              ? 'Could not load chats for this user.'
              : interactionsError
                ? 'Could not load interactions for this user.'
                : 'Could not load interaction details.'}
        </StatusMessage>
      )}

      <Workspace>
        <Panel>
          <PanelHeader>
            <TargetUserBadge>
              <TargetUserLabel>UUID</TargetUserLabel>
              <TargetUserValue>{openChatUserUuid}</TargetUserValue>
            </TargetUserBadge>
            <ListTabs>
              <ListTabButton
                type="button"
                $active={selectedTab === OPEN_CHAT_TAB_INTERACTIONS}
                onClick={() => handleSelectTab(OPEN_CHAT_TAB_INTERACTIONS)}
              >
                interactions
              </ListTabButton>
              <ListTabButton
                type="button"
                $active={selectedTab === OPEN_CHAT_TAB_CHAT}
                onClick={() => handleSelectTab(OPEN_CHAT_TAB_CHAT)}
              >
                chats
              </ListTabButton>
              <ListTabButton
                type="button"
                $active={selectedTab === OPEN_CHAT_TAB_HOME}
                onClick={() => handleSelectTab(OPEN_CHAT_TAB_HOME)}
              >
                home
              </ListTabButton>
            </ListTabs>
            {createChatError && (
              <StatusMessage type={StatusTypes.Error} visible>
                {createChatError}
              </StatusMessage>
            )}
            {deleteChatError && (
              <StatusMessage type={StatusTypes.Error} visible>
                {deleteChatError}
              </StatusMessage>
            )}
            {selectedTab === OPEN_CHAT_TAB_CHAT && (
              <Button
                type="button"
                appearance={ButtonAppearance.Primary}
                size={ButtonSizes.Small}
                disabled={!targetUserId || isCreatingChat}
                onClick={handleCreateChat}
              >
                {isCreatingChat ? 'Creating...' : '+ chat'}
              </Button>
            )}
          </PanelHeader>
          <PanelContent>
            {(canManageOpenChatAccess && isUsersLoading) ||
            (selectedTab === OPEN_CHAT_TAB_CHAT
              ? isChatsLoading
              : selectedTab === OPEN_CHAT_TAB_INTERACTIONS
                ? isInteractionsLoading
                : false) ? (
              <Loading size={LoadingSizes.Small} />
            ) : selectedTab === OPEN_CHAT_TAB_CHAT ? (
              chats.length ? (
              chats.map(chat => (
                <ChatListItemRow key={chat.uuid}>
                  <ChatListButton
                    type="button"
                    $active={selectedChatUuid === chat.uuid}
                    onClick={() => navigateToChat(chat.uuid)}
                  >
                    <ListPrimaryText>
                      {chat.partner?.censored
                        ? 'Censored partner'
                        : `${chat.partner.first_name ?? ''} ${
                            chat.partner.second_name ?? ''
                          }`.trim() || 'Partner'}
                    </ListPrimaryText>
                    <ListSecondaryText>
                      {chat.newest_message
                        ? `Last: ${chat.newest_message.text}`
                        : 'No messages yet'}
                    </ListSecondaryText>
                  </ChatListButton>
                  <DeleteChatButton
                    type="button"
                    aria-label="Delete chat"
                    disabled={deletingChatUuid === chat.uuid}
                    onClick={() => {
                      void handleDeleteChat(chat.uuid);
                    }}
                  >
                    <TrashIcon label="delete chat" width={14} height={14} />
                  </DeleteChatButton>
                </ChatListItemRow>
              ))
              ) : (
                <Text type={TextTypes.Body6} tag="p">
                  No chats yet. Create one first.
                </Text>
              )
            ) : selectedTab === OPEN_CHAT_TAB_INTERACTIONS ? (
              interactions.map(interaction => (
                <ChatListButton
                  key={interaction.interaction_id}
                  type="button"
                  $active={selectedInteractionUuid === interaction.interaction_id}
                  onClick={() => navigateToInteraction(interaction.interaction_id)}
                >
                  <ListPrimaryText>
                    {interaction.title || `Interaction ${interaction.interaction_id}`}
                  </ListPrimaryText>
                  <ListSecondaryText>
                    {interaction.created
                      ? `Created: ${formatDateTime(interaction.created)}`
                      : 'Created date unavailable'}
                  </ListSecondaryText>
                </ChatListButton>
              ))
            ) : selectedTab === OPEN_CHAT_TAB_HOME ? (
              <Text type={TextTypes.Body6} tag="p">
                Home settings are shown on the right.
              </Text>
            ) : null}
            {selectedTab === OPEN_CHAT_TAB_INTERACTIONS && !interactions.length && (
              <Text type={TextTypes.Body6} tag="p">
                No interactions found.
              </Text>
            )}
          </PanelContent>
        </Panel>

        <Panel>
          <PanelHeader>
            {selectedTab === OPEN_CHAT_TAB_CHAT ? (
              <Text type={TextTypes.Body5} tag="h2">
                Messages
              </Text>
            ) : selectedTab === OPEN_CHAT_TAB_INTERACTIONS ? (
              <InteractionHeaderRow>
                <InteractionHeaderMeta>
                  <Text type={TextTypes.Body5} tag="h2">
                    Interaction
                  </Text>
                  {selectedInteractionDetail ? (
                    <Text type={TextTypes.Body7} tag="p">
                      {selectedInteractionDetail.title ||
                        selectedInteractionDetail.interaction_id}
                    </Text>
                  ) : (
                    <Text type={TextTypes.Body7} tag="p">
                      Select an interaction
                    </Text>
                  )}
                </InteractionHeaderMeta>
                {interactionFrameUrl && (
                  <InteractionExternalLink
                    href={interactionFrameUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    aria-label="Open interaction in new page"
                    title="Open interaction in new page"
                  >
                    <ExternalLink size={16} />
                  </InteractionExternalLink>
                )}
              </InteractionHeaderRow>
            ) : (
              <Text type={TextTypes.Body5} tag="h2">
                Home
              </Text>
            )}
            {selectedTab === OPEN_CHAT_TAB_CHAT &&
              (selectedChatUuid ? (
                <Text type={TextTypes.Body7} tag="p">
                  Chat: {selectedChatUuid}
                </Text>
              ) : (
                <Text type={TextTypes.Body7} tag="p">
                  Select or create a chat
                </Text>
              ))}
          </PanelHeader>
          {selectedTab === OPEN_CHAT_TAB_CHAT ? (
            <PanelContent>
              <MessageList>
                {isMessagesLoading ? (
                  <Loading size={LoadingSizes.Small} />
                ) : messagesError ? (
                  <StatusMessage type={StatusTypes.Error} visible>
                    Could not load messages.
                  </StatusMessage>
                ) : !orderedMessages.length ? (
                  <Text type={TextTypes.Body6} tag="p">
                    No messages yet.
                  </Text>
                ) : (
                  orderedMessages.map(message => {
                    const isSelf = message.sender === currentUser.uuid;
                    const interactionPayload = parseOpenChatInteractionPayload(
                      message.text,
                    );
                    const interactionNewestResponseUrl =
                      interactionPayload?.shared_interaction_url
                        ? buildNewestResponseUrl(
                            interactionPayload.shared_interaction_url,
                          )
                        : null;
                    return (
                      <MessageBubble
                        key={message.uuid}
                        $self={isSelf}
                        $interaction={Boolean(interactionPayload)}
                      >
                        {interactionPayload ? (
                          <InteractionWidget>
                            {interactionPayload.interaction_id && (
                              <InteractionWidgetHeader>
                                <InteractionWidgetNavButton
                                  type="button"
                                  onClick={() =>
                                    navigateToInteraction(
                                      interactionPayload.interaction_id,
                                    )
                                  }
                                  aria-label="Open interaction page"
                                  title="Open interaction page"
                                >
                                  <ExternalLink size={14} />
                                </InteractionWidgetNavButton>
                              </InteractionWidgetHeader>
                            )}
                            {interactionNewestResponseUrl ? (
                              <InteractionWidgetFrame
                                src={interactionNewestResponseUrl}
                                title={`open-chat-interaction-widget-${interactionPayload.interaction_id}`}
                              />
                            ) : (
                              <Text type={TextTypes.Body7} tag="span">
                                Interaction preview unavailable.
                              </Text>
                            )}
                          </InteractionWidget>
                        ) : (
                          <Text type={TextTypes.Body6} tag="span">
                            {message.text}
                          </Text>
                        )}
                        <Text type={TextTypes.Body7} tag="span">
                          {new Date(message.created).toLocaleString()}
                        </Text>
                      </MessageBubble>
                    );
                  })
                )}
              </MessageList>
            </PanelContent>
          ) : selectedTab === OPEN_CHAT_TAB_INTERACTIONS ? (
            <InteractionPanelContent>
              {isInteractionDetailLoading ? (
                <Loading size={LoadingSizes.Small} />
              ) : selectedInteractionDetail ? (
                interactionFrameUrl ? (
                  <InteractionFrame
                    src={interactionFrameUrl}
                    title={`open-chat-interaction-${selectedInteractionDetail.interaction_id}`}
                  />
                ) : (
                  <Text type={TextTypes.Body6} tag="p">
                    Interaction page URL unavailable.
                  </Text>
                )
              ) : (
                <Text type={TextTypes.Body6} tag="p">
                  Select an interaction to view details.
                </Text>
              )}
            </InteractionPanelContent>
          ) : (
            <PanelContent>
              <OpenChatConfigurationPanel
                canEdit={canEditOpenChatConfiguration}
                canManage={canManageOpenChatAccess}
                embedded
                automationTargetUserUuid={openChatUserUuid}
              />
            </PanelContent>
          )}
          {selectedTab === OPEN_CHAT_TAB_CHAT && (
            <>
              <Composer onSubmit={handleSendMessage}>
                <ComposerInput
                  value={draftMessage}
                  onChange={event => setDraftMessage(event.target.value)}
                  onKeyDown={handleComposerKeyDown}
                  placeholder="Write a message..."
                  disabled={!selectedChatUuid || isSending}
                />
                <Button
                  type="submit"
                  appearance={ButtonAppearance.Primary}
                  size={ButtonSizes.Small}
                  disabled={!selectedChatUuid || isSending || !draftMessage.trim()}
                >
                  {isSending ? 'Sending...' : 'Send'}
                </Button>
              </Composer>
              {sendError && (
                <div>
                  <StatusMessage type={StatusTypes.Error} visible>
                    {sendError}
                  </StatusMessage>
                </div>
              )}
            </>
          )}
        </Panel>
      </Workspace>
    </PageContainer>
  );
};

export default OpenChatChat;
