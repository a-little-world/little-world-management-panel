import {
  Button,
  ButtonVariations,
  Popover,
  Text,
  TextTypes,
  TrashIcon,
} from '@a-little-world/little-world-design-system';
import React, { useState } from 'react';

import type { OpenChatListItem } from '../../../api/openChat';
import { formatTimeDistance } from '../../../helpers/date';
import { LANGUAGES } from '../../../constants';
import UnreadDot from '../../atoms/UnreadDot';
import {
  ConversationActions,
  ConversationPreview,
  ConversationRowButton,
  ConversationRowMain,
  ConversationRowTop,
  DeleteConfirmRow,
} from './OpenChatWorkspace.styles';
import {
  formatOpenChatMessagePreview,
  formatOpenChatPartnerName,
} from './openChatHelpers';

type OpenChatConversationRowProps = {
  chat: OpenChatListItem;
  active: boolean;
  deleting: boolean;
  onSelect: () => void;
  onDelete: () => void;
};

export function OpenChatConversationRow({
  chat,
  active,
  deleting,
  onSelect,
  onDelete,
}: OpenChatConversationRowProps) {
  const [confirmDelete, setConfirmDelete] = useState(false);
  const partnerName = formatOpenChatPartnerName(chat.partner);
  const preview = chat.newest_message
    ? formatOpenChatMessagePreview(chat.newest_message.text)
    : 'No messages yet';
  const timeLabel = chat.newest_message?.created
    ? formatTimeDistance(
        chat.newest_message.created,
        new Date(),
        LANGUAGES.en,
        true,
      )
    : null;

  return (
    <ConversationRowButton type="button" $active={active} onClick={onSelect}>
      <ConversationRowMain>
        <ConversationRowTop>
          <Text type={TextTypes.Body6} bold tag="span">
            {partnerName}
          </Text>
          {timeLabel && (
            <Text type={TextTypes.Body7} tag="span">
              {timeLabel}
            </Text>
          )}
        </ConversationRowTop>
        <ConversationPreview>{preview}</ConversationPreview>
      </ConversationRowMain>
      <ConversationActions onClick={event => event.stopPropagation()}>
        {chat.unread_count > 0 && <UnreadDot count={chat.unread_count} />}
        <Popover
          trigger={
            <Button
              type="button"
              variation={ButtonVariations.Icon}
              disabled={deleting}
              aria-label="Delete chat"
            >
              <TrashIcon label="delete chat" width={14} height={14} />
            </Button>
          }
        >
          {confirmDelete ? (
            <DeleteConfirmRow>
              <Text type={TextTypes.Body7} tag="span">
                Delete chat?
              </Text>
              <Button
                type="button"
                variation={ButtonVariations.Inline}
                onClick={() => {
                  setConfirmDelete(false);
                  onDelete();
                }}
              >
                Yes
              </Button>
              <Button
                type="button"
                variation={ButtonVariations.Inline}
                onClick={() => setConfirmDelete(false)}
              >
                No
              </Button>
            </DeleteConfirmRow>
          ) : (
            <Button
              type="button"
              variation={ButtonVariations.Inline}
              onClick={() => setConfirmDelete(true)}
            >
              Delete chat
            </Button>
          )}
        </Popover>
      </ConversationActions>
    </ConversationRowButton>
  );
}
