import { Tag, TagAppearance, TagSizes, Text, TextTypes } from '@a-little-world/little-world-design-system';
import React from 'react';

import type { OpenChatInteraction } from '../../../api/openChat';
import { BLUE_40, LANGUAGES } from '../../../constants';
import { formatTimeDistance } from '../../../helpers/date';
import {
  ConversationPreview,
  ConversationRowMain,
  ConversationRowTop,
  InteractionRowButton,
} from './OpenChatWorkspace.styles';

type OpenChatInteractionRowProps = {
  interaction: OpenChatInteraction;
  active: boolean;
  onSelect: () => void;
};

export function OpenChatInteractionRow({
  interaction,
  active,
  onSelect,
}: OpenChatInteractionRowProps) {
  const title =
    interaction.title?.trim() ||
    `Interaction ${interaction.interaction_id.slice(0, 8)}…`;
  const createdLabel = interaction.created
    ? formatTimeDistance(interaction.created, new Date(), LANGUAGES.en, true)
    : 'Created date unavailable';

  return (
    <InteractionRowButton type="button" $active={active} onClick={onSelect}>
      <ConversationRowMain>
        <ConversationRowTop>
          <Text type={TextTypes.Body6} bold tag="span">
            {title}
          </Text>
          <Tag
            size={TagSizes.small}
            appearance={TagAppearance.outline}
            color={BLUE_40}
          >
            Bot
          </Tag>
        </ConversationRowTop>
        <ConversationPreview>{createdLabel}</ConversationPreview>
      </ConversationRowMain>
    </InteractionRowButton>
  );
}
