import { Text, TextTypes } from '@a-little-world/little-world-design-system';
import React from 'react';

import type { OpenChatWorkspaceState } from '../../../hooks/useOpenChatWorkspace';
import { formatTimeDistance } from '../../../helpers/date';
import { LANGUAGES } from '../../../constants';
import { OpenChatConfigurationPanel } from '../../views/OpenChatAccess';
import {
  OPEN_CHAT_TAB_CHAT,
  OPEN_CHAT_TAB_HOME,
  OPEN_CHAT_TAB_INTERACTIONS,
} from './openChatConstants';
import { OpenChatComposer } from './OpenChatComposer';
import { OpenChatInteractionViewer } from './OpenChatInteractionViewer';
import { OpenChatMessageList } from './OpenChatMessageList';
import {
  formatOpenChatPartnerName,
  partnerToUserImageProfile,
} from './openChatHelpers';
import {
  ChatPanelLayout,
  ComposerFooter,
  HomeCardContent,
  MainPanelBody,
  MainPanelCard,
  MainPanelHeader,
  MainPanelHeaderMeta,
  MainPanelHeaderText,
} from './OpenChatWorkspace.styles';

type OpenChatMainPanelProps = Pick<
  OpenChatWorkspaceState,
  | 'selectedTab'
  | 'selectedChat'
  | 'selectedChatUuid'
  | 'selectedInteractionDetail'
  | 'interactionFrameUrl'
  | 'orderedMessages'
  | 'messagesError'
  | 'isMessagesLoading'
  | 'isInteractionDetailLoading'
  | 'isInteractionsLoading'
  | 'showMissingTargetUserUuid'
  | 'currentUser'
  | 'draftMessage'
  | 'setDraftMessage'
  | 'sendError'
  | 'isSending'
  | 'canEditOpenChatConfiguration'
  | 'canManageOpenChatAccess'
  | 'openChatUserUuid'
  | 'navigateToInteraction'
  | 'handleSendMessage'
>;

export function OpenChatMainPanel({
  selectedTab,
  selectedChat,
  selectedChatUuid,
  selectedInteractionDetail,
  interactionFrameUrl,
  orderedMessages,
  messagesError,
  isMessagesLoading,
  isInteractionDetailLoading,
  isInteractionsLoading,
  showMissingTargetUserUuid,
  currentUser,
  draftMessage,
  setDraftMessage,
  sendError,
  isSending,
  canEditOpenChatConfiguration,
  canManageOpenChatAccess,
  openChatUserUuid,
  navigateToInteraction,
  handleSendMessage,
}: OpenChatMainPanelProps) {
  const partnerName = selectedChat
    ? formatOpenChatPartnerName(selectedChat.partner)
    : null;
  const chatCreatedLabel =
    selectedChat?.created &&
    formatTimeDistance(selectedChat.created, new Date(), LANGUAGES.en, true);

  return (
    <MainPanelCard>
      <MainPanelHeader>
        {selectedTab === OPEN_CHAT_TAB_CHAT && (
          <>
            {selectedChat ? (
              <MainPanelHeaderText>
                <Text type={TextTypes.Body5} bold tag="h2">
                  {partnerName}
                </Text>
                <Text type={TextTypes.Body7} tag="p">
                  {chatCreatedLabel
                    ? `Chat started ${chatCreatedLabel}`
                    : 'Support automation chat'}
                </Text>
              </MainPanelHeaderText>
            ) : (
              <Text type={TextTypes.Body5} tag="h2">
                Messages
              </Text>
            )}
          </>
        )}
        {selectedTab === OPEN_CHAT_TAB_INTERACTIONS && (
          <Text type={TextTypes.Body5} tag="h2">
            Interaction
          </Text>
        )}
        {selectedTab === OPEN_CHAT_TAB_HOME && (
          <Text type={TextTypes.Body5} tag="h2">
            Home
          </Text>
        )}
      </MainPanelHeader>

      <MainPanelBody>
        {selectedTab === OPEN_CHAT_TAB_CHAT && (
          <ChatPanelLayout>
            {showMissingTargetUserUuid ? (
              <HomeCardContent>
                <Text type={TextTypes.Body6} tag="p">
                  Missing automation actor UUID.
                </Text>
              </HomeCardContent>
            ) : (
              <OpenChatMessageList
                messages={orderedMessages}
                currentUser={currentUser}
                isLoading={isMessagesLoading}
                error={messagesError}
                onOpenInteraction={navigateToInteraction}
              />
            )}
            <ComposerFooter>
              <OpenChatComposer
                draftMessage={draftMessage}
                onDraftChange={setDraftMessage}
                onSend={text => {
                  void handleSendMessage(text);
                }}
                disabled={!selectedChatUuid || showMissingTargetUserUuid}
                isSending={isSending}
                sendError={sendError}
              />
            </ComposerFooter>
          </ChatPanelLayout>
        )}

        {selectedTab === OPEN_CHAT_TAB_INTERACTIONS && (
          <OpenChatInteractionViewer
            interaction={selectedInteractionDetail}
            frameUrl={interactionFrameUrl}
            isLoading={isInteractionDetailLoading}
            isListLoading={isInteractionsLoading}
            showMissingTargetUserUuid={showMissingTargetUserUuid}
          />
        )}

        {selectedTab === OPEN_CHAT_TAB_HOME && (
          <HomeCardContent>
            <OpenChatConfigurationPanel
              canEdit={canEditOpenChatConfiguration}
              canManage={canManageOpenChatAccess}
              embedded
              automationTargetUserUuid={openChatUserUuid || ''}
            />
          </HomeCardContent>
        )}
      </MainPanelBody>
    </MainPanelCard>
  );
}
