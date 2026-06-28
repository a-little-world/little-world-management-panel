import {
  Loading,
  LoadingSizes,
  Text,
  TextTypes,
} from '@a-little-world/little-world-design-system';
import { ExternalLink } from 'lucide-react';
import React from 'react';

import type { OpenChatInteractionDetail } from '../../../api/openChat';
import { formatTimeDistance } from '../../../helpers/date';
import { LANGUAGES } from '../../../constants';
import {
  ExternalLinkButton,
  InteractionFrame,
  InteractionFrameContainer,
  InteractionViewerHeader,
  InteractionViewerTitle,
  InteractionViewerTitleBlock,
  MetaLabel,
} from './OpenChatWorkspace.styles';

type OpenChatInteractionViewerProps = {
  interaction: OpenChatInteractionDetail | null;
  frameUrl: string | null;
  isLoading: boolean;
  isListLoading: boolean;
  showMissingTargetUserUuid: boolean;
};

export function OpenChatInteractionViewer({
  interaction,
  frameUrl,
  isLoading,
  isListLoading,
  showMissingTargetUserUuid,
}: OpenChatInteractionViewerProps) {
  if (showMissingTargetUserUuid) {
    return (
      <InteractionFrameContainer>
        <Text type={TextTypes.Body6} tag="p">
          Missing automation actor UUID.
        </Text>
      </InteractionFrameContainer>
    );
  }

  if (isListLoading || isLoading) {
    return (
      <InteractionFrameContainer>
        <Loading size={LoadingSizes.Small} />
      </InteractionFrameContainer>
    );
  }

  if (!interaction) {
    return (
      <InteractionFrameContainer>
        <Text type={TextTypes.Body6} tag="p">
          Select an interaction to view details.
        </Text>
      </InteractionFrameContainer>
    );
  }

  const createdLabel = interaction.created
    ? formatTimeDistance(interaction.created, new Date(), LANGUAGES.en, true)
    : 'Created date unavailable';

  return (
    <InteractionFrameContainer>
      <InteractionViewerHeader>
        <InteractionViewerTitleBlock>
          <InteractionViewerTitle>
            {interaction.title || interaction.interaction_id}
          </InteractionViewerTitle>
          <MetaLabel>{createdLabel}</MetaLabel>
        </InteractionViewerTitleBlock>
        {frameUrl && (
          <ExternalLinkButton
            href={frameUrl}
            target="_blank"
            rel="noopener noreferrer"
            aria-label="Open interaction in new page"
            title="Open interaction in new page"
          >
            <ExternalLink size={16} />
          </ExternalLinkButton>
        )}
      </InteractionViewerHeader>
      {frameUrl ? (
        <InteractionFrame
          src={frameUrl}
          title={`open-chat-interaction-${interaction.interaction_id}`}
        />
      ) : (
        <Text type={TextTypes.Body6} tag="p">
          Interaction page URL unavailable.
        </Text>
      )}
    </InteractionFrameContainer>
  );
}
