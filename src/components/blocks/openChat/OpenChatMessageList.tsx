import {
  Loading,
  LoadingSizes,
  StatusMessage,
  StatusTypes,
  Text,
  TextTypes,
  TickDoubleIcon,
  TickIcon,
  textParser,
} from '@a-little-world/little-world-design-system';
import { isSameDay } from 'date-fns';
import React, { useEffect, useMemo, useRef } from 'react';
import { useTheme } from 'styled-components';

import type { MatchingPanelUser } from '../../../api';
import type { OpenChatMessage } from '../../../api/openChat';
import { formatMessageDate, formatTime } from '../../../helpers/date';
import {
  buildOpenChatInteractionNewestResponseUrl,
  extractOpenChatInteractionShareUuid,
  getCustomChatElements,
  messageContainsWidget,
  parseOpenChatInteractionPayload,
  processAttachmentWidgets,
} from '../../../helpers/chat';
import {
  InteractionMessage,
  Message,
  MessageGroup,
  MessageText,
  NoMessages,
  StickyDateHeader,
  Time,
} from '../user/UserChat.styles';
import { OpenChatInteractionEmbed } from './OpenChatInteractionEmbed';
import { OpenChatMessagesScroll } from './OpenChatWorkspace.styles';

type OpenChatMessageListProps = {
  messages: OpenChatMessage[];
  currentUser: MatchingPanelUser;
  openChatUserUuid: string;
  isLoading: boolean;
  error: unknown;
  onOpenInteraction: (interactionId: string) => void;
};

const ATTACHMENT_WIDGET_ERROR =
  '[Attachment could not be displayed due to processing error]';

function groupMessagesByDate(messages: OpenChatMessage[]) {
  return messages.reduce<
    Array<{ date: Date; formattedDate: string; messages: OpenChatMessage[] }>
  >((groups, message) => {
    const messageDate = new Date(message.created);
    const prevGroup = groups[groups.length - 1];

    if (!prevGroup || !isSameDay(messageDate, prevGroup.date)) {
      groups.push({
        date: messageDate,
        formattedDate: formatMessageDate(messageDate, 'de'),
        messages: [message],
      });
    } else {
      prevGroup.messages.push(message);
    }

    return groups;
  }, []);
}

export function OpenChatMessageList({
  messages,
  currentUser,
  openChatUserUuid,
  isLoading,
  error,
  onOpenInteraction,
}: OpenChatMessageListProps) {
  const theme = useTheme();
  const scrollRef = useRef<HTMLDivElement>(null);
  const messageGroups = useMemo(() => groupMessagesByDate(messages), [messages]);
  const currentUserId = currentUser.uuid ?? currentUser.hash;

  useEffect(() => {
    const container = scrollRef.current;
    if (!container) {
      return;
    }
    container.scrollTop = container.scrollHeight;
  }, [messages]);

  if (error) {
    return (
      <OpenChatMessagesScroll>
        <StatusMessage type={StatusTypes.Error} visible>
          Could not load messages.
        </StatusMessage>
      </OpenChatMessagesScroll>
    );
  }

  if (isLoading) {
    return (
      <OpenChatMessagesScroll>
        <Loading size={LoadingSizes.Small} />
      </OpenChatMessagesScroll>
    );
  }

  if (!messages.length) {
    return (
      <OpenChatMessagesScroll>
        <NoMessages type={TextTypes.Body4}>No messages yet.</NoMessages>
      </OpenChatMessagesScroll>
    );
  }

  return (
    <OpenChatMessagesScroll ref={scrollRef}>
      {messageGroups.map((group, groupIndex) => (
        <MessageGroup key={group.date.toISOString()}>
          <StickyDateHeader $isSticky={groupIndex !== messageGroups.length - 1}>
            <Text type={TextTypes.Body6}>{group.formattedDate}</Text>
          </StickyDateHeader>
          {group.messages.map(message => {
            const isSelf = message.sender === currentUserId;
            const processedMessageText = processAttachmentWidgets(
              message,
              ATTACHMENT_WIDGET_ERROR,
            );
            const interactionPayload = message.parsable
              ? parseOpenChatInteractionPayload(processedMessageText)
              : null;
            const interactionNewestResponseUrl =
              interactionPayload?.shared_interaction_url
                ? buildOpenChatInteractionNewestResponseUrl(
                    interactionPayload.shared_interaction_url,
                  )
                : null;
            const customChatElements = message.parsable
              ? getCustomChatElements({
                  message: { ...message, text: processedMessageText },
                  userId: currentUserId,
                })
              : [];
            const isWidgetMessage =
              Boolean(message.parsable) &&
              messageContainsWidget(processedMessageText);

            if (interactionPayload) {
              return (
                <InteractionMessage $isSelf={isSelf} key={message.uuid}>
                  <OpenChatInteractionEmbed
                    title={interactionPayload.title}
                    frameUrl={interactionNewestResponseUrl}
                    interactionId={interactionPayload.interaction_id}
                    interactionShareUuid={extractOpenChatInteractionShareUuid(
                      interactionPayload.shared_interaction_url,
                    )}
                    configurationOwnerUserUuid={openChatUserUuid}
                    onOpenInteraction={onOpenInteraction}
                  />
                  <Time type={TextTypes.Body6}>
                    {formatTime(new Date(message.created))}
                  </Time>
                </InteractionMessage>
              );
            }

            return (
              <Message $isSelf={isSelf} key={message.uuid}>
                <MessageText
                  {...(isWidgetMessage && { tag: 'div' as const })}
                  disableParser
                  $isSelf={isSelf}
                  $isWidget={isWidgetMessage}
                >
                  {textParser(processedMessageText, {
                    customElements: customChatElements,
                    onlyLinks: !message.parsable,
                  })}
                </MessageText>
                <Time type={TextTypes.Body6}>
                  {isSelf &&
                    (message.read ? (
                      <TickDoubleIcon
                        label="message read icon"
                        color={theme.color.status.info}
                        width="16px"
                        height="16px"
                      />
                    ) : (
                      <TickIcon
                        label="message unread icon"
                        width="16px"
                        height="16px"
                      />
                    ))}
                  {formatTime(new Date(message.created))}
                </Time>
              </Message>
            );
          })}
        </MessageGroup>
      ))}
    </OpenChatMessagesScroll>
  );
}
