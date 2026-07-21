import {
  AttachmentIcon,
  Button,
  ButtonAppearance,
  ButtonSizes,
  ButtonVariations,
  CloseIcon,
  DotsIcon,
  PlusIcon,
  Popover,
  SendIcon,
  Tag,
  TagAppearance,
  TagSizes,
  Text,
  TextAreaSize,
  TextTypes,
  TickDoubleIcon,
  TickIcon,
  textParser,
} from '@a-little-world/little-world-design-system';
import { isSameDay } from 'date-fns';
import { isEmpty } from 'lodash';
import { ArrowUpRightIcon } from 'lucide-react';
import React, { useEffect, useRef, useState } from 'react';
import { useForm } from 'react-hook-form';
import { useTheme } from 'styled-components';

import {
  deleteMessage,
  markMessageAsRead,
  sendChatMessage,
  sendFileAttachmentMessage,
  sendSupportMessageReply,
} from '../../../api/index';
import { BLUE_40, CRIMSON_40, GREEN_40 } from '../../../constants';
import {
  buildOpenChatInteractionNewestResponseUrl,
  formatFileName,
  getCustomChatElements,
  messageContainsWidget,
  parseOpenChatInteractionPayload,
  processAttachmentWidgets,
} from '../../../helpers/chat';
import { formatMessageDate, formatTime } from '../../../helpers/date';
import useInfiniteScroll from '../../../hooks/useInfiniteScroll';
import { getSupportTaskDetailRoute } from '../../../router/routes';
import { registerInput } from '../../../store';
import UnreadDot from '../../atoms/UnreadDot';
import { OpenChatInteractionEmbed } from '../openChat/OpenChatInteractionEmbed';
import {
  ActionsContainer,
  Attachment,
  AttachmentButton,
  ChatContainer,
  InteractionMessage,
  Message,
  MessageBox,
  MessageGroup,
  MessageText,
  Messages,
  NoMessages,
  SendButton,
  StickyDateHeader,
  SupportReplyMessageBox,
  SupportReplyTaskDraft,
  SupportReplyTaskIconLink,
  SupportReplyTaskMeta,
  SupportReplyTaskNotice,
  SupportReplyTaskTopRow,
  Time,
  UnreadCheckbox,
  WriteSection,
} from './UserChat.styles';

type UserChatProps = {
  user: any;
  initialDraftMessage?: string;
  sendViaSupportReplyApi?: boolean;
  hideComposer?: boolean;
  activeSupportReplyTask?: any;
  onSupportReplySent?: (message: string) => void;
};

const UserChat = ({
  user,
  initialDraftMessage = '',
  sendViaSupportReplyApi = false,
  hideComposer = false,
  activeSupportReplyTask = null,
  onSupportReplySent = () => {},
}: UserChatProps) => {
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
    scrollRef,
    fetchError,
  } = useInfiniteScroll({
    url: `/api/matching/users/${user.id}/messages/`,
    revalidateOnFocus: true,
    refreshInterval: 10000,
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

    if (shouldSendViaSupportReplyApi) {
      sendSupportMessageReply({
        userId: user.id,
        text,
        file: selectedFile,
        onError,
        onSuccess: result => {
          onMessageSent(result);
          onSupportReplySent(text);
        },
      });
    } else if (selectedFile) {
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
      onSuccess: () => {
        setResults(prev =>
          prev.map(message =>
            message.uuid === messageId ? { ...message, read: true } : message,
          ),
        );
      },
    });
  };

  const handleDeleteMessage = messageId => {
    deleteMessage({
      userId: user.id,
      messageId,
      onError: error => {
        if (
          error?.status === 400 &&
          error?.message === 'Only unread messages can be deleted.'
        ) {
          setResults(prev =>
            prev.map(message =>
              message.uuid === messageId ? { ...message, read: true } : message,
            ),
          );
        }
        console.log({ error });
      },
      onSuccess: () => {
        setResults(prev => prev.filter(message => message.uuid !== messageId));
      },
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
  const replyTask: any = activeSupportReplyTask;
  const replyTaskActionStatus = replyTask?.action?.status ?? null;
  const activeSupportReplySuggestion =
    typeof replyTask?.action?.parameters?.message === 'string'
      ? replyTask.action.parameters.message.trim()
      : '';
  const shouldPrefillFromSuggestion = replyTaskActionStatus === 'OPEN';
  const composerInitialMessage =
    initialDraftMessage ||
    (shouldPrefillFromSuggestion ? activeSupportReplySuggestion : '');
  const shouldSendViaSupportReplyApi =
    sendViaSupportReplyApi || Boolean(replyTask);
  const replyTaskStatusLabel =
    replyTaskActionStatus === 'EXECUTED'
      ? 'Executed'
      : replyTaskActionStatus === 'CANCELLED'
        ? 'Cancelled'
        : 'Open';
  const replyTaskStatusColor =
    replyTaskActionStatus === 'EXECUTED'
      ? GREEN_40
      : replyTaskActionStatus === 'CANCELLED'
        ? CRIMSON_40
        : BLUE_40;
  const isReplyTaskCompleted = replyTaskActionStatus === 'EXECUTED';
  const showDraftInNotice =
    Boolean(activeSupportReplySuggestion) && (hideComposer || !replyTask);
  const ComposerField = composerInitialMessage
    ? SupportReplyMessageBox
    : MessageBox;
  const composerSize = composerInitialMessage
    ? TextAreaSize.Large
    : TextAreaSize.Medium;

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
                  const errorMessage =
                    '[Attachment could not be displayed due to processing error]';
                  const processedMessageText = processAttachmentWidgets(
                    message,
                    errorMessage,
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

                  const customChatElements = message?.parsable
                    ? getCustomChatElements({
                        message: { ...message, text: processedMessageText },
                        userId: user.uuid ?? user.hash,
                      })
                    : [];

                  if (interactionPayload) {
                    return (
                      <InteractionMessage
                        $isSelf={message.sender !== (user.uuid ?? user.hash)}
                        key={message.uuid}
                      >
                        <OpenChatInteractionEmbed
                          title={interactionPayload.title}
                          frameUrl={interactionNewestResponseUrl}
                          interactionId={interactionPayload.interaction_id}
                        />
                        <Time type={TextTypes.Body6}>
                          {formatTime(new Date(message.created))}
                        </Time>
                      </InteractionMessage>
                    );
                  }
                  const isSelf = message.sender !== (user.uuid ?? user.hash);
                  return (
                    <Message $isSelf={isSelf} key={message.uuid}>
                      <ActionsContainer>
                        {!message.read && (
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
                                  color={theme.color.surface.quaternary}
                                />
                              </Button>
                            }
                          >
                            {!isSelf && (
                              <Button
                                variation={ButtonVariations.Inline}
                                disabled={message.read}
                                onClick={() => handleReadMessage(message.uuid)}
                              >
                                Mark as Read
                              </Button>
                            )}
                            {isSelf && (
                              <Button
                                variation={ButtonVariations.Inline}
                                disabled={message.read}
                                onClick={() =>
                                  handleDeleteMessage(message.uuid)
                                }
                              >
                                Delete Message
                              </Button>
                            )}
                          </Popover>
                        )}

                        <MessageText
                          {...(message.parsable &&
                            messageContainsWidget(processedMessageText) && {
                              as: 'div',
                            })}
                          disableParser={!message.parsable}
                          $isSelf={message.sender !== (user.uuid ?? user.hash)}
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

      {replyTask && (
        <SupportReplyTaskNotice $isCompleted={isReplyTaskCompleted}>
          <SupportReplyTaskTopRow>
            <SupportReplyTaskMeta>
              <Text type={TextTypes.Body7} bold>
                Support reply task #{replyTask.id}
              </Text>
              <SupportReplyTaskIconLink
                to={getSupportTaskDetailRoute(replyTask.id)}
              >
                <ArrowUpRightIcon size={14} />
              </SupportReplyTaskIconLink>
            </SupportReplyTaskMeta>
            <Tag
              size={TagSizes.small}
              appearance={TagAppearance.outline}
              color={replyTaskStatusColor}
            >
              {replyTaskStatusLabel}
            </Tag>
          </SupportReplyTaskTopRow>
          {showDraftInNotice ? (
            <SupportReplyTaskDraft type={TextTypes.Body7}>
              {activeSupportReplySuggestion}
            </SupportReplyTaskDraft>
          ) : (
            !hideComposer &&
            activeSupportReplySuggestion && (
              <Text type={TextTypes.Body7}>
                Draft loaded in the composer below — review and send when ready.
              </Text>
            )
          )}
          {!activeSupportReplySuggestion && (
            <Text type={TextTypes.Body7}>No draft suggestion yet.</Text>
          )}
        </SupportReplyTaskNotice>
      )}

      {!hideComposer && (
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

          <ComposerField
            {...registerInput({
              register,
              name: 'text',
              options: { required: !selectedFile },
            })}
            key={`message ${messagesSent}`}
            id="text"
            defaultValue={composerInitialMessage}
            error={errors?.newMessage?.message}
            expandable
            placeholder={'Write a message...'}
            onSubmit={() => handleSubmit(onSendMessage)()}
            size={composerSize}
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
            appearance={ButtonAppearance.Secondary}
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
                onClick={clearSelectedFile}
                width="20"
                height="20"
              />
            ) : (
              <PlusIcon label={'upload attachment'} width="20" height="20" />
            )}
          </AttachmentButton>
          <SendButton
            size={ButtonSizes.Large}
            type="submit"
            disabled={isSubmitting}
            variation={ButtonVariations.Circle}
          >
            <SendIcon
              label={'Send message'}
              color={theme.color.text.reversed}
              width="20"
              height="20"
            />
          </SendButton>
        </WriteSection>
      )}
    </ChatContainer>
  );
};

export default UserChat;
