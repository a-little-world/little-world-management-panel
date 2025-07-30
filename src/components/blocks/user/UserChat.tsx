import {
  AttachmentIcon,
  Button,
  ButtonSizes,
  ButtonVariations,
  CloseIcon,
  DotsIcon,
  PlusIcon,
  Popover,
  SendIcon,
  Text,
  TextAreaSize,
  TextTypes,
  TickDoubleIcon,
  TickIcon,
  textParser,
} from '@a-little-world/little-world-design-system';
import { isSameDay } from 'date-fns';
import { isEmpty } from 'lodash';
import React, { useEffect, useRef, useState } from 'react';
import { useForm } from 'react-hook-form';
import { useTheme } from 'styled-components';

import {
  deleteMessage,
  markMessageAsRead,
  sendChatMessage,
  sendFileAttachmentMessage,
} from '../../../api/index';
import {
  formatFileName,
  getCustomChatElements,
  messageContainsWidget,
} from '../../../helpers/chat';
import { formatMessageDate, formatTime } from '../../../helpers/date';
import useInfiniteScroll from '../../../hooks/useInfiniteScroll';
import { registerInput } from '../../../store';
import UnreadDot from '../../atoms/UnreadDot';
import {
  ActionsContainer,
  Attachment,
  AttachmentButton,
  ChatContainer,
  Message,
  MessageBox,
  MessageGroup,
  MessageText,
  Messages,
  NoMessages,
  SendButton,
  StickyDateHeader,
  Time,
  UnreadCheckbox,
  WriteSection,
} from './UserChat.styles';

const UserChat = ({ user }) => {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [unreadOnly, setUnreadOnly] = useState(false);
  const messagesRef = useRef();
  const theme = useTheme();
  const [selectedFile, setSelectedFile] = useState(null);
  const fileInputRef = useRef();
  const [messagesSent, setMessagesSent] = useState(0);
  const chatId = user.matches.support.results[0].chatId;
  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
    setError,
    setFocus,
  } = useForm();

  const onError = error => {
    setError('message', {});
    setIsSubmitting(false);
  };

  const {
    results,
    setResults,
    loading: isLoading,
    mutate,
    scrollRef,
    fetchError,
  } = useInfiniteScroll({
    url: `/api/matching/users/${user.id}/messages/`,
  });

  const messages = unreadOnly
    ? results?.filter(message => !message.read)
    : results;

  useEffect(() => {
    setFocus('text');
  }, [setFocus]);

  const handleFileSelect = event => {
    const file = event.target.files[0];
    if (file) {
      // Create a new File object with explicit metadata
      const fileWithMetadata = new File([file], formatFileName(file.name), {
        type: file.type,
        lastModified: file.lastModified,
      });
      setSelectedFile(fileWithMetadata);
    }
  };

  const handleAttachmentClick = () => {
    fileInputRef.current.click();
  };

  const clearSelectedFile = () => {
    setSelectedFile(null);
    reset();
    fileInputRef.current.value = ''; // Reset file input
  };

  const onMessageSent = message => {
    reset();
    clearSelectedFile();
    setIsSubmitting(false);
    setResults([message, ...results]);
    messagesRef.current.scrollTop = 0;
    setMessagesSent(curr => curr + 1);
  };

  const onSendMessage = ({ text }) => {
    setIsSubmitting(true);

    if (selectedFile) {
      sendFileAttachmentMessage({
        file: selectedFile,
        text,
        chatId,
        onError,
        onSuccess: onMessageSent,
      });
    } else {
      sendChatMessage({
        text,
        chatId,
        onError,
        onSuccess: onMessageSent,
      });
    }
  };

  const handleReadMessage = messageId => {
    markMessageAsRead({
      userId: user.id,
      messageId,
      onError: error => console.log({ error }),
      onSuccess: () => mutate(),
    });
  };

  const handleDeleteMessage = messageId => {
    deleteMessage({
      userId: user.id,
      messageId,
      onError: error => console.log({ error }),
      onSuccess: () => mutate(),
    });
  };

  const groupMessagesByDate = messages => {
    if (!messages) return [];

    return messages.reduce((groups, message) => {
      const messageDate = new Date(message.created);
      const prevGroup = groups[groups.length - 1];

      // If this is the first message or the date is different from the last group
      if (!prevGroup || !isSameDay(messageDate, prevGroup.date)) {
        groups.push({
          date: messageDate,
          formattedDate: formatMessageDate(messageDate, 'de'),
          messages: [message],
        });
      } else {
        // Add message to existing group
        prevGroup.messages.unshift(message);
      }

      return groups;
    }, []);
  };

  const messageGroups = groupMessagesByDate(messages);

  return (
    <ChatContainer>
      <UnreadCheckbox
        label={'Unread only'}
        checked={unreadOnly}
        onCheckedChange={setUnreadOnly}
        required={false}
      />
      <Messages ref={messagesRef}>
        {isEmpty(messages) ? (
          <NoMessages type={TextTypes.Body4}>
            {fetchError
              ? 'Error fetching messages'
              : isLoading
              ? 'Loading messages'
              : unreadOnly
              ? 'No unread messages'
              : 'No messages sent yet'}
          </NoMessages>
        ) : (
          <>
            {messageGroups.map((group, groupIndex) => (
              <MessageGroup key={group.date.toISOString()}>
                <StickyDateHeader
                  $isSticky={groupIndex !== messageGroups.length - 1}
                >
                  <Text type={TextTypes.Body6}>{group.formattedDate}</Text>
                </StickyDateHeader>
                {group.messages.map(message => {
                  // Specific fix for known AttachmentWidget format from backend
                  let processedMessageText = message.text;

                  if (message.parsable && messageContainsWidget(message.text)) {
                    // Only fix messages that are actually malformed (old data)
                    // Check if the JSON parsing would fail due to unescaped content
                    const widgetStartTag = '<AttachmentWidget ';
                    const widgetEndTag = ' ></AttachmentWidget>';

                    const widgetStart = message.text.indexOf(widgetStartTag);
                    const widgetEnd = message.text.indexOf(widgetEndTag);

                    if (widgetStart !== -1 && widgetEnd > widgetStart) {
                      const jsonStart = widgetStart + widgetStartTag.length;
                      const jsonPart = message.text.substring(
                        jsonStart,
                        widgetEnd,
                      );

                      try {
                        // Try to parse the JSON - if it works, don't modify it
                        JSON.parse(jsonPart);
                        // JSON is valid, use as-is
                      } catch (_e) {
                        // JSON is malformed, try to fix it
                        if (
                          jsonPart.includes('"caption": "') &&
                          !jsonPart.includes('\\"')
                        ) {
                          // Find the caption content between "caption": " and the next "
                          const captionStart =
                            jsonPart.indexOf('"caption": "') + 12;
                          const remainingText =
                            jsonPart.substring(captionStart);
                          const captionEnd =
                            remainingText.indexOf('", ') !== -1
                              ? remainingText.indexOf('", ')
                              : remainingText.indexOf('"} >') !== -1
                              ? remainingText.indexOf('"} >')
                              : remainingText.indexOf('"}');

                          if (captionEnd > 0) {
                            const captionContent = remainingText.substring(
                              0,
                              captionEnd,
                            );
                            // Escape only the necessary characters for JSON, preserving line breaks
                            const escapedCaption = captionContent
                              .replace(/\\/g, '\\\\') // Escape backslashes
                              .replace(/"/g, '\\"'); // Escape quotes

                            // Replace the unescaped caption with the escaped version
                            const fixedJsonPart = jsonPart.replace(
                              `"caption": "${captionContent}"`,
                              `"caption": "${escapedCaption}"`,
                            );

                            processedMessageText = message.text.replace(
                              jsonPart,
                              fixedJsonPart,
                            );
                          }
                        }
                      }
                    }
                  }

                  const customChatElements = message?.parsable
                    ? getCustomChatElements({
                        message: { ...message, text: processedMessageText },
                        userId: user.hash,
                      })
                    : [];

                  return (
                    <Message
                      $isSelf={message.sender !== user.hash}
                      key={message.uuid}
                    >
                      <ActionsContainer>
                        <Popover
                          trigger={
                            <Button
                              type="button"
                              variation={ButtonVariations.Icon}
                            >
                              <DotsIcon
                                circular
                                height="16px"
                                width="16px"
                                label="message menu icon"
                                labelId="messageMenuIcon"
                                color={theme.color.surface.quaternary}
                              />
                            </Button>
                          }
                        >
                          <Button
                            variation={ButtonVariations.Inline}
                            disabled={
                              message.sender !== user.hash || message.read
                            }
                            onClick={() => handleReadMessage(message.uuid)}
                          >
                            Mark as Read
                          </Button>
                          {message.sender !== user.hash && (
                            <Button
                              variation={ButtonVariations.Inline}
                              disabled={message.sender === user.hash}
                              onClick={() => handleDeleteMessage(message.uuid)}
                            >
                              Delete Message
                            </Button>
                          )}
                        </Popover>

                        <MessageText
                          {...(message.parsable &&
                            messageContainsWidget(processedMessageText) && {
                              as: 'div',
                            })}
                          disableParser={!message.parsable}
                          $isSelf={message.sender !== user.hash}
                          $isWidget={
                            message.parsable &&
                            messageContainsWidget(processedMessageText)
                          }
                        >
                          {textParser(processedMessageText, {
                            customElements: customChatElements,
                            onlyLinks: !message.parsable,
                          })}
                        </MessageText>
                      </ActionsContainer>
                      <Time type={TextTypes.Body6}>
                        {message.read ? (
                          <TickDoubleIcon
                            labelId="messageReadIcon"
                            label="message read icon"
                            color={theme.color.status.info}
                            width="16px"
                            height="16px"
                          />
                        ) : (
                          <TickIcon
                            labelId="messageUnreadIcon"
                            label="message unread icon"
                            width="16px"
                            height="16px"
                          />
                        )}
                        {formatTime(new Date(message.created))}
                      </Time>
                    </Message>
                  );
                })}
              </MessageGroup>
            ))}
            <div ref={scrollRef} />
          </>
        )}
      </Messages>

      <WriteSection onSubmit={handleSubmit(onSendMessage)}>
        <input
          type="file"
          ref={fileInputRef}
          onChange={handleFileSelect}
          style={{ display: 'none' }}
          accept="application/pdf, .pdf,.doc,.docx,.txt,.rtf,.odt,
                    .jpg,.jpeg,.png,.gif,.bmp,.webp,.tiff,
                    .ppt,.pptx,.xls,.xlsx,.csv, image/*"
        />

        <MessageBox
          {...registerInput({
            register,
            name: 'text',
            options: { required: !selectedFile },
          })}
          key={`message ${messagesSent}`}
          id="text"
          error={errors?.newMessage?.message}
          expandable
          placeholder={'Write a message...'}
          onSubmit={() => handleSubmit(onSendMessage)()}
          size={TextAreaSize.Medium}
        />
        {!!selectedFile && (
          <Attachment>
            <AttachmentIcon
              label={`Selected file: ${selectedFile.name}`}
              height={40}
              width={40}
            />
            <UnreadDot count={1} height="18px" top="0px" right="22px" />
          </Attachment>
        )}
        <AttachmentButton
          size={ButtonSizes.Large}
          type="button"
          variation={ButtonVariations.Circle}
          backgroundColor={
            selectedFile
              ? theme.color.status.error
              : theme.color.surface.primary
          }
          borderColor={theme.color.text.title}
          color={
            selectedFile ? theme.color.text.reversed : theme.color.text.title
          }
          onClick={selectedFile ? clearSelectedFile : handleAttachmentClick}
        >
          {selectedFile ? (
            <CloseIcon
              label="Remove attachment"
              labelId="remove_attachment"
              onClick={clearSelectedFile}
              width="20"
              height="20"
            />
          ) : (
            <PlusIcon
              label={'upload attachment'}
              labelId="attachment_icon"
              width="20"
              height="20"
            />
          )}
        </AttachmentButton>
        <SendButton
          size={ButtonSizes.Large}
          type="submit"
          disabled={isSubmitting}
          variation={ButtonVariations.Circle}
          backgroundColor={theme.color.gradient.orange10}
        >
          <SendIcon
            label={'Send message'}
            labelId="send_icon"
            color={theme.color.text.reversed}
            width="20"
            height="20"
          />
        </SendButton>
      </WriteSection>
    </ChatContainer>
  );
};

export default UserChat;
