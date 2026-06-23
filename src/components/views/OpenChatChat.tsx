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
  fetchOpenChatInteractions,
  fetchOpenChatMessages,
  fetchOpenChatsForUser,
  normalizeOpenChatBrowserUrl,
  sendOpenChatMessage,
  type OpenChatAccessUser,
  type OpenChatInteraction,
} from '../../api/openChat';
import {
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

const InteractionDetails = styled.div`
  display: flex;
  flex-direction: column;
  gap: ${({ theme }) => theme.spacing.xsmall};
`;

const InteractionRaw = styled.pre`
  margin: 0;
  white-space: pre-wrap;
  word-break: break-word;
  border: 1px solid ${({ theme }) => theme.color.border.subtle};
  border-radius: ${({ theme }) => theme.radius.xxsmall};
  padding: ${({ theme }) => theme.spacing.xsmall};
  background: ${({ theme }) => theme.color.surface.secondary};
  max-height: 22rem;
  overflow: auto;
`;

const MessageBubble = styled.div<{ $self: boolean }>`
  max-width: 80%;
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
  padding: ${({ theme }) => theme.spacing.xsmall};
  display: flex;
  flex-direction: column;
  gap: ${({ theme }) => theme.spacing.xxxsmall};
  background: ${({ theme }) => theme.color.surface.primary};
`;

const InteractionLink = styled.a`
  color: ${({ theme }) => theme.color.text.link};
  text-decoration: underline;
  word-break: break-all;
`;

const PoweredBy = styled(Text).attrs({ type: TextTypes.Body7, tag: 'p' as const })`
  color: ${({ theme }) => theme.color.text.secondary};
`;

const PoweredByLink = styled.a`
  color: ${({ theme }) => theme.color.text.link};
  text-decoration: underline;
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

function fullName(user?: OpenChatAccessUser): string {
  if (!user) {
    return 'Unknown user';
  }
  const firstName = user.profile?.first_name?.trim() ?? '';
  const secondName = user.profile?.second_name?.trim() ?? '';
  return [firstName, secondName].filter(Boolean).join(' ') || user.email;
}

type OpenChatInteractionPayload = {
  type: 'open_chat_interaction';
  title?: string;
  interaction_id: string;
  shared_interaction_url?: string | null;
};

const DEFAULT_OPEN_CHAT_INTERACTION_TITLE =
  'Open Chat interaction';
const OPEN_CHAT_MESSAGES_REFRESH_INTERVAL_MS = 1500;
const OPEN_CHAT_QUERY_PARAM_TAB = 'tab';
const OPEN_CHAT_TAB_CHAT = 'chat';
const OPEN_CHAT_TAB_INTERACTIONS = 'interactions';

type OpenChatTab = typeof OPEN_CHAT_TAB_CHAT | typeof OPEN_CHAT_TAB_INTERACTIONS;

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
      : OPEN_CHAT_TAB_INTERACTIONS;

  const canAccess = hasManagementPermission(
    currentUser,
    MANAGEMENT_PERMISSION_OPEN_CHAT_ACCESS,
  );
  const canManageOpenChatAccess = hasManagementPermission(
    currentUser,
    MANAGEMENT_PERMISSION_MANAGE_OPEN_CHAT_ACCESS,
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
  const selectedChatUuid = routeChatUuid ?? null;
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
  const [selectedInteractionId, setSelectedInteractionId] = useState<string | null>(
    null,
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
      requestedTab === OPEN_CHAT_TAB_INTERACTIONS
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
    if (!interactions.length) {
      setSelectedInteractionId(null);
      return;
    }

    if (!selectedInteractionId) {
      setSelectedInteractionId(interactions[0].interaction_id);
      return;
    }

    if (
      !interactions.some(
        interaction => interaction.interaction_id === selectedInteractionId,
      )
    ) {
      setSelectedInteractionId(interactions[0].interaction_id);
    }
  }, [interactions, selectedInteractionId]);

  const selectedInteraction: OpenChatInteraction | null =
    interactions.find(
      interaction => interaction.interaction_id === selectedInteractionId,
    ) ?? null;

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

  const handleSelectTab = (tab: OpenChatTab) => {
    const nextSearchParams = new URLSearchParams(searchParams);
    nextSearchParams.set(OPEN_CHAT_QUERY_PARAM_TAB, tab);
    const serializedSearchParams = nextSearchParams.toString();
    if (tab === OPEN_CHAT_TAB_INTERACTIONS) {
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
      <PoweredBy>
        powered by{' '}
        <PoweredByLink
          href="https://github.com/msgmate-io/open-chat-go"
          target="_blank"
          rel="noopener noreferrer"
        >
          open-chat
        </PoweredByLink>
      </PoweredBy>

      {((canManageOpenChatAccess && usersError) ||
        chatsError ||
        interactionsError) && (
        <StatusMessage type={StatusTypes.Error} visible>
          {usersError
            ? 'Could not load open chat users.'
            : chatsError
              ? 'Could not load chats for this user.'
              : 'Could not load interactions for this user.'}
        </StatusMessage>
      )}

      <Workspace>
        <Panel>
          <PanelHeader>
            <Text type={TextTypes.Body5} tag="h2">
              Target user
            </Text>
            <Text type={TextTypes.Body6} tag="p">
              {selectedUser ? fullName(selectedUser) : openChatUserUuid}
            </Text>
            <ListTabs>
              <ListTabButton
                type="button"
                $active={selectedTab === OPEN_CHAT_TAB_CHAT}
                onClick={() => handleSelectTab(OPEN_CHAT_TAB_CHAT)}
              >
                chats
              </ListTabButton>
              <ListTabButton
                type="button"
                $active={selectedTab === OPEN_CHAT_TAB_INTERACTIONS}
                onClick={() => handleSelectTab(OPEN_CHAT_TAB_INTERACTIONS)}
              >
                interactions
              </ListTabButton>
            </ListTabs>
            {selectedUser && (
              <Text type={TextTypes.Body7} tag="p">
                {selectedUser.email}
              </Text>
            )}
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
            <Button
              type="button"
              appearance={ButtonAppearance.Primary}
              size={ButtonSizes.Small}
              disabled={!targetUserId || isCreatingChat}
              onClick={handleCreateChat}
            >
              {isCreatingChat ? 'Creating...' : 'Create chat'}
            </Button>
          </PanelHeader>
          <PanelContent>
            {(canManageOpenChatAccess && isUsersLoading) ||
            (selectedTab === OPEN_CHAT_TAB_CHAT
              ? isChatsLoading
              : isInteractionsLoading) ? (
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
                    <Text type={TextTypes.Body6} tag="span">
                      {chat.partner?.censored
                        ? 'Censored partner'
                        : `${chat.partner.first_name ?? ''} ${
                            chat.partner.second_name ?? ''
                          }`.trim() || 'Partner'}
                    </Text>
                    <Text type={TextTypes.Body7} tag="span">
                      {chat.newest_message
                        ? `Last: ${chat.newest_message.text}`
                        : 'No messages yet'}
                    </Text>
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
            ) : (
              interactions.map(interaction => (
                <ChatListButton
                  key={interaction.interaction_id}
                  type="button"
                  $active={selectedInteractionId === interaction.interaction_id}
                  onClick={() => setSelectedInteractionId(interaction.interaction_id)}
                >
                  <Text type={TextTypes.Body6} tag="span">
                    {interaction.title || `Interaction ${interaction.interaction_id}`}
                  </Text>
                  <Text type={TextTypes.Body7} tag="span">
                    {interaction.created
                      ? `Created: ${formatDateTime(interaction.created)}`
                      : 'Created date unavailable'}
                  </Text>
                </ChatListButton>
              ))
            )}
            {selectedTab === OPEN_CHAT_TAB_INTERACTIONS && !interactions.length && (
              <Text type={TextTypes.Body6} tag="p">
                No interactions found.
              </Text>
            )}
          </PanelContent>
        </Panel>

        <Panel>
          <PanelHeader>
            <Text type={TextTypes.Body5} tag="h2">
              {selectedTab === OPEN_CHAT_TAB_CHAT
                ? 'Messages'
                : 'Interaction details'}
            </Text>
            {selectedTab === OPEN_CHAT_TAB_CHAT ? (
              selectedChatUuid ? (
              <Text type={TextTypes.Body7} tag="p">
                Chat: {selectedChatUuid}
              </Text>
            ) : (
              <Text type={TextTypes.Body7} tag="p">
                Select or create a chat
              </Text>
              )
            ) : selectedInteraction ? (
              <Text type={TextTypes.Body7} tag="p">
                Interaction: {selectedInteraction.interaction_id}
              </Text>
            ) : (
              <Text type={TextTypes.Body7} tag="p">
                Select an interaction
              </Text>
            )}
          </PanelHeader>
          <PanelContent>
            {selectedTab === OPEN_CHAT_TAB_CHAT ? (
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
                    return (
                      <MessageBubble key={message.uuid} $self={isSelf}>
                        {interactionPayload ? (
                          <InteractionWidget>
                            <Text type={TextTypes.Body7} tag="span">
                              {interactionPayload.title ??
                                DEFAULT_OPEN_CHAT_INTERACTION_TITLE}
                            </Text>
                            <Text type={TextTypes.Body7} tag="span">
                              Interaction ID: {interactionPayload.interaction_id}
                            </Text>
                            {interactionPayload.shared_interaction_url ? (
                              <InteractionLink
                                href={normalizeOpenChatBrowserUrl(
                                  interactionPayload.shared_interaction_url,
                                )}
                                target="_blank"
                                rel="noopener noreferrer"
                              >
                                Open interaction
                              </InteractionLink>
                            ) : (
                              <Text type={TextTypes.Body7} tag="span">
                                Shared interaction URL unavailable.
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
            ) : selectedInteraction ? (
              <InteractionDetails>
                <Text type={TextTypes.Body6} tag="p">
                  {selectedInteraction.title ||
                    `Interaction ${selectedInteraction.interaction_id}`}
                </Text>
                <Text type={TextTypes.Body7} tag="p">
                  ID: {selectedInteraction.interaction_id}
                </Text>
                {selectedInteraction.status && (
                  <Text type={TextTypes.Body7} tag="p">
                    Status: {selectedInteraction.status}
                  </Text>
                )}
                {selectedInteraction.created && (
                  <Text type={TextTypes.Body7} tag="p">
                    Created: {formatDateTime(selectedInteraction.created)}
                  </Text>
                )}
                {selectedInteraction.updated && (
                  <Text type={TextTypes.Body7} tag="p">
                    Updated: {formatDateTime(selectedInteraction.updated)}
                  </Text>
                )}
                {selectedInteraction.shared_interaction_url && (
                  <InteractionLink
                    href={normalizeOpenChatBrowserUrl(
                      selectedInteraction.shared_interaction_url,
                    )}
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    Open interaction
                  </InteractionLink>
                )}
                <InteractionRaw>
                  {JSON.stringify(selectedInteraction.raw ?? {}, null, 2)}
                </InteractionRaw>
              </InteractionDetails>
            ) : (
              <Text type={TextTypes.Body6} tag="p">
                Select an interaction to view details.
              </Text>
            )}
          </PanelContent>
          {selectedTab === OPEN_CHAT_TAB_CHAT && (
            <>
              <Composer onSubmit={handleSendMessage}>
                <ComposerInput
                  value={draftMessage}
                  onChange={event => setDraftMessage(event.target.value)}
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
