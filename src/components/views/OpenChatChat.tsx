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
} from '@a-little-world/little-world-design-system';
import React, { useEffect, useMemo, useState } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import styled from 'styled-components';
import useSWR from 'swr';

import type { MatchingPanelUser } from '../../api';
import {
  OPEN_CHAT_ACCESS_USERS_ENDPOINT,
  OPEN_CHAT_CONFIGURATION_ENDPOINT,
  createOpenChatChat,
  fetchOpenChatAccessUsers,
  fetchOpenChatConfiguration,
  fetchOpenChatMessages,
  fetchOpenChatsForUser,
  normalizeOpenChatBrowserUrl,
  sendOpenChatMessage,
  type OpenChatAccessUser,
} from '../../api/openChat';
import {
  MANAGEMENT_PERMISSION_MANAGE_OPEN_CHAT_ACCESS,
  MANAGEMENT_PERMISSION_OPEN_CHAT_ACCESS,
} from '../../constants/managementPermissions';
import { hasManagementPermission } from '../../helpers/managementPermissions';
import { useGlobalState } from '../../store';
import { OPEN_CHAT_ACCESS_ROUTE } from '../../router/routes';
import {
  Description,
  PageContainer,
  PageHeader,
  Title,
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

const MessageList = styled.div`
  flex: 1;
  min-height: 0;
  overflow: auto;
  display: flex;
  flex-direction: column;
  gap: ${({ theme }) => theme.spacing.xsmall};
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
  interaction_id: string;
  shared_interaction_url?: string | null;
};

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
  const [searchParams] = useSearchParams();
  const requestedOpenChatUserUuid = searchParams.get('user_uuid')?.trim() ?? '';

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
  const [selectedChatUuid, setSelectedChatUuid] = useState<string | null>(null);
  const [createChatError, setCreateChatError] = useState<string | null>(null);
  const [isCreatingChat, setIsCreatingChat] = useState(false);

  const {
    data: messagesData,
    error: messagesError,
    isLoading: isMessagesLoading,
    mutate: refreshMessages,
  } = useSWR(
    selectedChatUuid ? `/open-chat/messages/${selectedChatUuid}` : null,
    () => fetchOpenChatMessages(selectedChatUuid as string),
    { revalidateOnFocus: true },
  );

  const [draftMessage, setDraftMessage] = useState('');
  const [sendError, setSendError] = useState<string | null>(null);
  const [isSending, setIsSending] = useState(false);

  useEffect(() => {
    if (!chats.length) {
      setSelectedChatUuid(null);
      return;
    }

    if (!selectedChatUuid || !chats.some(chat => chat.uuid === selectedChatUuid)) {
      setSelectedChatUuid(chats[0].uuid);
    }
  }, [chats, selectedChatUuid]);

  const handleCreateChat = async () => {
    if (!targetUserId) {
      return;
    }

    setCreateChatError(null);
    setIsCreatingChat(true);

    try {
      const result = await createOpenChatChat(targetUserId);
      await refreshChats();
      setSelectedChatUuid(result.chat_uuid);
    } catch (error) {
      setCreateChatError(
        error instanceof Error ? error.message : 'Could not create chat.',
      );
    } finally {
      setIsCreatingChat(false);
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
        <PageHeader>
          <Title>Open Chat</Title>
          <Description type={TextTypes.Body4} tag="p">
            No matching partner was found for your user. Create or verify a matching
            first on <Link to={OPEN_CHAT_ACCESS_ROUTE}>Open Chat Access</Link>.
          </Description>
        </PageHeader>
        <Text type={TextTypes.Body4} tag="p">
          Missing chat target user UUID.
        </Text>
      </PageContainer>
    );
  }

  const orderedMessages = [...(messagesData?.results ?? [])].reverse();

  return (
    <PageContainer>
      <PageHeader>
        <Title>Open Chat</Title>
        <Description type={TextTypes.Body4} tag="p">
          Basic chat view for open-chat users. Manage users on{' '}
          <Link to={OPEN_CHAT_ACCESS_ROUTE}>Open Chat Access</Link>.
        </Description>
      </PageHeader>

      {((canManageOpenChatAccess && usersError) || chatsError) && (
        <StatusMessage type={StatusTypes.Error} visible>
          {usersError
            ? 'Could not load open chat users.'
            : 'Could not load chats for this user.'}
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
            {(canManageOpenChatAccess && isUsersLoading) || isChatsLoading ? (
              <Loading size={LoadingSizes.Small} />
            ) : chats.length ? (
              chats.map(chat => (
                <ChatListButton
                  key={chat.uuid}
                  type="button"
                  $active={selectedChatUuid === chat.uuid}
                  onClick={() => setSelectedChatUuid(chat.uuid)}
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
              ))
            ) : (
              <Text type={TextTypes.Body6} tag="p">
                No chats yet. Create one first.
              </Text>
            )}
          </PanelContent>
        </Panel>

        <Panel>
          <PanelHeader>
            <Text type={TextTypes.Body5} tag="h2">
              Messages
            </Text>
            {selectedChatUuid ? (
              <Text type={TextTypes.Body7} tag="p">
                Chat: {selectedChatUuid}
              </Text>
            ) : (
              <Text type={TextTypes.Body7} tag="p">
                Select or create a chat
              </Text>
            )}
          </PanelHeader>
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
                  return (
                    <MessageBubble key={message.uuid} $self={isSelf}>
                      {interactionPayload ? (
                        <InteractionWidget>
                          <Text type={TextTypes.Body6} tag="span">
                            Open Chat interaction
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
          </PanelContent>
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
        </Panel>
      </Workspace>
    </PageContainer>
  );
};

export default OpenChatChat;
