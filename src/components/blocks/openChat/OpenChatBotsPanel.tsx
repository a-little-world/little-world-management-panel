import {
  StatusMessage,
  StatusTypes,
  Text,
  TextTypes,
} from '@a-little-world/little-world-design-system';
import { BotManager, OpenChatProvider } from '@open-chat-go/client/react';
import React, { useMemo } from 'react';
import styled from 'styled-components';

import { createAuthorizedOpenChatClient } from '../../../api/openChatBrowserClient';

const Panel = styled.div`
  display: flex;
  flex-direction: column;
  gap: ${({ theme }) => theme.spacing.small};
`;

const EmbeddedManager = styled.div`
  width: 100%;
  min-width: 0;
`;

export function OpenChatBotsPanel({
  configurationOwnerUserUuid,
  openChatBrowserOrigin,
  hasConfiguration,
  canEdit,
}: {
  configurationOwnerUserUuid: string;
  openChatBrowserOrigin: string | null;
  hasConfiguration: boolean;
  canEdit: boolean;
}) {
  const client = useMemo(() => {
    if (
      !hasConfiguration ||
      !configurationOwnerUserUuid.trim() ||
      !openChatBrowserOrigin
    ) {
      return null;
    }
    return createAuthorizedOpenChatClient({
      baseUrl: openChatBrowserOrigin,
      userUuid: configurationOwnerUserUuid,
      scopes: canEdit ? ['bots:read', 'bots:write'] : ['bots:read'],
    });
  }, [
    canEdit,
    configurationOwnerUserUuid,
    hasConfiguration,
    openChatBrowserOrigin,
  ]);

  if (!hasConfiguration) {
    return (
      <Text type={TextTypes.Body4} tag="p">
        Save an Open Chat configuration before loading bots.
      </Text>
    );
  }

  if (!openChatBrowserOrigin || !configurationOwnerUserUuid.trim()) {
    return (
      <StatusMessage type={StatusTypes.Error} visible>
        The browser-facing Open Chat host or configuration owner is missing.
      </StatusMessage>
    );
  }

  if (!client) {
    return null;
  }

  return (
    <Panel>
      <Text type={TextTypes.Body4} tag="p">
        Bots are loaded and edited directly in Open Chat.
      </Text>
      {!canEdit && (
        <Text type={TextTypes.Body5} tag="p">
          You can inspect bots, but saving changes requires permission to edit
          Open Chat configuration.
        </Text>
      )}
      <EmbeddedManager className="oc-client">
        <OpenChatProvider
          key={`${configurationOwnerUserUuid}:${openChatBrowserOrigin}`}
          client={client}
        >
          <BotManager includePublic={false} />
        </OpenChatProvider>
      </EmbeddedManager>
    </Panel>
  );
}
