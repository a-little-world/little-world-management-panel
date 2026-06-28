import {
  ButtonVariations,
  SendIcon,
  StatusMessage,
  StatusTypes,
  TextAreaSize,
} from '@a-little-world/little-world-design-system';
import React from 'react';
import { useTheme } from 'styled-components';

import {
  MessageBox,
  SendButton,
  WriteSection,
} from '../user/UserChat.styles';

type OpenChatComposerProps = {
  draftMessage: string;
  onDraftChange: (value: string) => void;
  onSend: (text: string) => void;
  disabled: boolean;
  isSending: boolean;
  sendError: string | null;
};

export function OpenChatComposer({
  draftMessage,
  onDraftChange,
  onSend,
  disabled,
  isSending,
  sendError,
}: OpenChatComposerProps) {
  const theme = useTheme();

  const handleSubmit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (disabled || isSending || !draftMessage.trim()) {
      return;
    }
    onSend(draftMessage);
  };

  const handleKeyDown = (event: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (event.key !== 'Enter' || event.shiftKey) {
      return;
    }
    event.preventDefault();
    if (disabled || isSending || !draftMessage.trim()) {
      return;
    }
    event.currentTarget.form?.requestSubmit();
  };

  return (
    <>
      {sendError && (
        <StatusMessage type={StatusTypes.Error} visible>
          {sendError}
        </StatusMessage>
      )}
      <WriteSection onSubmit={handleSubmit}>
        <MessageBox
          id="open-chat-message"
          value={draftMessage}
          onChange={event => onDraftChange(event.target.value)}
          onKeyDown={handleKeyDown}
          expandable
          placeholder="Write a message..."
          disabled={disabled || isSending}
          size={TextAreaSize.Medium}
        />
        <SendButton
          type="submit"
          disabled={disabled || isSending || !draftMessage.trim()}
          variation={ButtonVariations.Circle}
        >
          <SendIcon
            label="Send message"
            color={theme.color.text.reversed}
            width="20"
            height="20"
          />
        </SendButton>
      </WriteSection>
    </>
  );
}
