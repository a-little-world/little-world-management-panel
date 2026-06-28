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
import React from 'react';
import { Link } from 'react-router-dom';

import type { OpenChatWorkspaceState } from '../../../hooks/useOpenChatWorkspace';
import { OPEN_CHAT_CONFIGURATION_ROUTE } from '../../../router/routes';
import { Description } from '../../atoms/PageLayout';
import UserImage from '../../atoms/UserImage';
import { Tabs, TabsList, TabsTrigger } from '../../atoms/Tabs';
import {
  OPEN_CHAT_TAB_CHAT,
  OPEN_CHAT_TAB_HOME,
  OPEN_CHAT_TAB_INTERACTIONS,
  type OpenChatTab,
} from './openChatConstants';
import { OpenChatConversationRow } from './OpenChatConversationRow';
import { OpenChatInteractionRow } from './OpenChatInteractionRow';
import { accessUserToUserImageProfile } from './openChatHelpers';
import {
  ActorCard,
  ActorMeta,
  EmptySidebarState,
  MetaLabel,
  SidebarHeader,
  SidebarPanel,
  SidebarScroll,
} from './OpenChatWorkspace.styles';

type OpenChatSidebarProps = Pick<
  OpenChatWorkspaceState,
  | 'selectedTab'
  | 'handleSelectTab'
  | 'selectedUser'
  | 'openChatUserUuid'
  | 'actorDisplayName'
  | 'showMissingTargetUserUuid'
  | 'isSidebarLoading'
  | 'createChatError'
  | 'deleteChatError'
  | 'chats'
  | 'selectedChatUuid'
  | 'interactions'
  | 'selectedInteractionUuid'
  | 'targetUserId'
  | 'isCreatingChat'
  | 'deletingChatUuid'
  | 'navigateToChat'
  | 'navigateToInteraction'
  | 'handleCreateChat'
  | 'handleDeleteChat'
>;

export function OpenChatSidebar({
  selectedTab,
  handleSelectTab,
  selectedUser,
  openChatUserUuid,
  actorDisplayName,
  showMissingTargetUserUuid,
  isSidebarLoading,
  createChatError,
  deleteChatError,
  chats,
  selectedChatUuid,
  interactions,
  selectedInteractionUuid,
  targetUserId,
  isCreatingChat,
  deletingChatUuid,
  navigateToChat,
  navigateToInteraction,
  handleCreateChat,
  handleDeleteChat,
}: OpenChatSidebarProps) {
  return (
    <SidebarPanel>
      <SidebarHeader>
        <ActorCard>
          {selectedUser ? (
            <UserImage
              alt={actorDisplayName}
              user={accessUserToUserImageProfile(selectedUser)}
              dimensions={{ height: 48, width: 48 }}
            />
          ) : null}
          <ActorMeta>
            <MetaLabel>Automation actor</MetaLabel>
            <Text type={TextTypes.Body6} bold tag="span">
              {actorDisplayName}
            </Text>
            {selectedUser?.email && (
              <Text type={TextTypes.Body7} tag="span">
                {selectedUser.email}
              </Text>
            )}
          </ActorMeta>
        </ActorCard>

        {showMissingTargetUserUuid && (
          <Description type={TextTypes.Body7} tag="p">
            No matching partner found. Set up matching on{' '}
            <Link to={OPEN_CHAT_CONFIGURATION_ROUTE}>Open Chat configuration</Link>.
          </Description>
        )}

        <Tabs
          value={selectedTab}
          onValueChange={(value: string) => handleSelectTab(value as OpenChatTab)}
        >
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value={OPEN_CHAT_TAB_CHAT}>Chats</TabsTrigger>
            <TabsTrigger value={OPEN_CHAT_TAB_INTERACTIONS}>Interactions</TabsTrigger>
            <TabsTrigger value={OPEN_CHAT_TAB_HOME}>Home</TabsTrigger>
          </TabsList>
        </Tabs>

        {(createChatError || deleteChatError) && (
          <StatusMessage type={StatusTypes.Error} visible>
            {createChatError ?? deleteChatError}
          </StatusMessage>
        )}

        {selectedTab === OPEN_CHAT_TAB_CHAT && (
          <Button
            type="button"
            appearance={ButtonAppearance.Primary}
            size={ButtonSizes.Small}
            disabled={!targetUserId || isCreatingChat || showMissingTargetUserUuid}
            onClick={() => {
              void handleCreateChat();
            }}
          >
            {isCreatingChat ? 'Creating…' : 'New chat'}
          </Button>
        )}
      </SidebarHeader>

      <SidebarScroll>
        {isSidebarLoading ? (
          <Loading size={LoadingSizes.Small} />
        ) : (
          <>
            {selectedTab === OPEN_CHAT_TAB_CHAT &&
              (showMissingTargetUserUuid ? (
                <EmptySidebarState>
                  <Text type={TextTypes.Body6} tag="p">
                    Missing automation actor UUID.
                  </Text>
                </EmptySidebarState>
              ) : chats.length ? (
                chats.map(chat => (
                  <OpenChatConversationRow
                    key={chat.uuid}
                    chat={chat}
                    active={selectedChatUuid === chat.uuid}
                    deleting={deletingChatUuid === chat.uuid}
                    onSelect={() => navigateToChat(chat.uuid)}
                    onDelete={() => {
                      void handleDeleteChat(chat.uuid);
                    }}
                  />
                ))
              ) : (
                <EmptySidebarState>
                  <Text type={TextTypes.Body6} tag="p">
                    No chats yet. Create one to get started.
                  </Text>
                </EmptySidebarState>
              ))}

            {selectedTab === OPEN_CHAT_TAB_INTERACTIONS &&
              (showMissingTargetUserUuid ? (
                <EmptySidebarState>
                  <Text type={TextTypes.Body6} tag="p">
                    Missing automation actor UUID.
                  </Text>
                </EmptySidebarState>
              ) : interactions.length ? (
                interactions.map(interaction => (
                  <OpenChatInteractionRow
                    key={interaction.interaction_id}
                    interaction={interaction}
                    active={selectedInteractionUuid === interaction.interaction_id}
                    onSelect={() => navigateToInteraction(interaction.interaction_id)}
                  />
                ))
              ) : (
                <EmptySidebarState>
                  <Text type={TextTypes.Body6} tag="p">
                    No interactions found.
                  </Text>
                </EmptySidebarState>
              ))}

            {selectedTab === OPEN_CHAT_TAB_HOME && (
              <EmptySidebarState>
                <Text type={TextTypes.Body6} tag="p">
                  Connection settings and automation tools are in the main panel.
                </Text>
                {!openChatUserUuid && (
                  <Text type={TextTypes.Body7} tag="p">
                    Configure matching on the Home tab to enable chats and interactions.
                  </Text>
                )}
              </EmptySidebarState>
            )}
          </>
        )}
      </SidebarScroll>
    </SidebarPanel>
  );
}
