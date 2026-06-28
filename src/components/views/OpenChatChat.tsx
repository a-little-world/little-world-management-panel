import {
  StatusMessage,
  StatusTypes,
  Text,
  TextTypes,
} from '@a-little-world/little-world-design-system';
import React, { useMemo } from 'react';

import type { MatchingPanelUser } from '../../api';
import { buildOpenChatLoginUrl } from '../../api/openChat';
import type { BreadcrumbItem } from '../atoms/Breadcrumbs';
import { useOpenChatWorkspace } from '../../hooks/useOpenChatWorkspace';
import { useGlobalState } from '../../store';
import { PageContainer } from '../atoms/PageLayout';
import { usePageHeader } from '../blocks/LayoutHeaderContext';
import { OpenChatMainPanel } from '../blocks/openChat/OpenChatMainPanel';
import { OpenChatSidebar } from '../blocks/openChat/OpenChatSidebar';
import {
  buildOpenChatTabUrl,
  OPEN_CHAT_TAB_CHAT,
  OPEN_CHAT_TAB_HOME,
  OPEN_CHAT_TAB_INTERACTIONS,
  OPEN_CHAT_TAB_LABELS,
} from '../blocks/openChat/openChatConstants';
import {
  formatOpenChatAccessUserName,
  formatOpenChatPartnerName,
} from '../blocks/openChat/openChatHelpers';
import {
  ActorSelect,
  ActorSelectWrap,
  ConfigHeaderNavLink,
  HeaderActionsRow,
  HeaderLinkButton,
  WorkspaceGrid,
} from '../blocks/openChat/OpenChatWorkspace.styles';

const OpenChatChat = () => {
  const { panelUser } = useGlobalState();
  const currentUser = panelUser as MatchingPanelUser;
  const workspace = useOpenChatWorkspace(currentUser);

  const {
    canAccess,
    canManageOpenChatAccess,
    configuration,
    users,
    openChatUserUuid,
    selectedUser,
    selectedTab,
    selectedChat,
    selectedInteractionDetail,
    isChatsLoading,
    isInteractionsLoading,
    isInteractionDetailLoading,
    handleSelectActor,
    handleSelectTab,
    topLevelError,
    topLevelErrorMessage,
  } = workspace;

  const actorOptions = useMemo(
    () =>
      (users ?? []).map(user => ({
        value: user.uuid,
        label: formatOpenChatAccessUserName(user),
      })),
    [users],
  );

  const loginConfiguration =
    selectedUser?.configuration ?? configuration ?? null;

  const breadcrumbs = useMemo(() => {
    const openChatRoot: BreadcrumbItem = {
      label: 'Open Chat',
      to: buildOpenChatTabUrl(OPEN_CHAT_TAB_HOME, { userUuid: openChatUserUuid }),
    };

    if (selectedTab === OPEN_CHAT_TAB_HOME) {
      return {
        items: [] as BreadcrumbItem[],
        current: 'Open Chat',
      };
    }

    if (selectedTab === OPEN_CHAT_TAB_CHAT) {
      if (selectedChat) {
        return {
          items: [
            openChatRoot,
            {
              label: OPEN_CHAT_TAB_LABELS[OPEN_CHAT_TAB_CHAT],
              onClick: () => handleSelectTab(OPEN_CHAT_TAB_CHAT),
            },
          ],
          current: formatOpenChatPartnerName(selectedChat.partner),
        };
      }
      return {
        items: [openChatRoot],
        current: isChatsLoading
          ? 'Loading…'
          : OPEN_CHAT_TAB_LABELS[OPEN_CHAT_TAB_CHAT],
      };
    }

    if (selectedTab === OPEN_CHAT_TAB_INTERACTIONS) {
      if (selectedInteractionDetail) {
        return {
          items: [
            openChatRoot,
            {
              label: OPEN_CHAT_TAB_LABELS[OPEN_CHAT_TAB_INTERACTIONS],
              onClick: () => handleSelectTab(OPEN_CHAT_TAB_INTERACTIONS),
            },
          ],
          current:
            selectedInteractionDetail.title ||
            selectedInteractionDetail.interaction_id,
        };
      }
      return {
        items: [openChatRoot],
        current:
          isInteractionsLoading || isInteractionDetailLoading
            ? 'Loading…'
            : OPEN_CHAT_TAB_LABELS[OPEN_CHAT_TAB_INTERACTIONS],
      };
    }

    return {
      items: [openChatRoot],
      current: OPEN_CHAT_TAB_LABELS[OPEN_CHAT_TAB_HOME],
    };
  }, [
    handleSelectTab,
    isChatsLoading,
    isInteractionDetailLoading,
    isInteractionsLoading,
    openChatUserUuid,
    selectedChat,
    selectedInteractionDetail,
    selectedTab,
  ]);

  usePageHeader({
    breadcrumbs,
    showMenu: true,
    actions: (
      <HeaderActionsRow>
        {canManageOpenChatAccess && actorOptions.length > 0 && (
          <ActorSelectWrap>
            <ActorSelect
              aria-label="Automation actor"
              value={openChatUserUuid || actorOptions[0]?.value || ''}
              onChange={event => handleSelectActor(event.target.value)}
            >
              {actorOptions.map(option => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </ActorSelect>
          </ActorSelectWrap>
        )}
        <ConfigHeaderNavLink
          to={buildOpenChatTabUrl(OPEN_CHAT_TAB_HOME, { userUuid: openChatUserUuid })}
          $active={selectedTab === OPEN_CHAT_TAB_HOME}
        >
          Configuration
        </ConfigHeaderNavLink>
        {loginConfiguration && (
          <HeaderLinkButton
            href={buildOpenChatLoginUrl(loginConfiguration)}
            target="_blank"
            rel="noopener noreferrer"
          >
            Open in Open Chat
          </HeaderLinkButton>
        )}
      </HeaderActionsRow>
    ),
  });

  if (!canAccess) {
    return (
      <PageContainer>
        <Text type={TextTypes.Body4} tag="p">
          You need the open chat access permission to view this page.
        </Text>
      </PageContainer>
    );
  }

  return (
    <PageContainer>
      {topLevelError && topLevelErrorMessage && (
        <StatusMessage type={StatusTypes.Error} visible>
          {topLevelErrorMessage}
        </StatusMessage>
      )}

      <WorkspaceGrid>
        <OpenChatSidebar {...workspace} />
        <OpenChatMainPanel {...workspace} />
      </WorkspaceGrid>
    </PageContainer>
  );
};

export default OpenChatChat;
