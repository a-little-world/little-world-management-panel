import {
  Button,
  ButtonSizes,
  ButtonVariations,
  DotsIcon,
  Popover,
  SendIcon,
  TextTypes,
  TickDoubleIcon,
  TickIcon,
} from '@a-little-world/little-world-design-system';
import { find, isEmpty } from 'lodash';
import React, { useEffect, useRef, useState } from 'react';
import { useForm } from 'react-hook-form';
import { useTheme } from 'styled-components';
import useSWR from 'swr';

import { markMessageAsRead, sendChatMessage } from '../api/index';
import { formatTimeDistance } from '../helpers/date';
import { dataFetcher } from '../store';
import { registerInput } from './SelectedUsersSheet';
import {
  ChatContainer,
  Message,
  MessageBox,
  MessageText,
  Messages,
  NoMessages,
  SendButton,
  Time,
  WriteSection,
} from './UserChat.styles';

const UserChat = ({ user }) => {
  const [chat, setChat] = useState(null);
  const [chatId, setChatId] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const messagesRef = useRef();
  const theme = useTheme();

  const {
    register,
    handleSubmit,
    formState: { errors },
    setError,
  } = useForm();

  const {
    data: messages,
    mutate,
    error,
    isLoading,
  } = useSWR(`/api/admin/user_advanced/${user.id}/messages/`, dataFetcher);

  useEffect(() => {
    if (isEmpty(messages)) return;

    const supportChat = find(messages, chat => chat?.match.with_management);
    if (supportChat) {
      setChat(supportChat ?? null);
      setChatId(supportChat?.match.match_id);
    }
  }, [messages]);

  const onError = error => {
    setError('message', {});
    setIsSubmitting(false);
  };

  const sendNewMessage = data => {
    setIsSubmitting(true);
    sendChatMessage({
      userId: user.id,
      message: data.newMessage,
      onError,
      onSuccess: message => {
        mutate({
          ...messages,
          [chatId]: {
            ...messages[chatId],
            items: [message, ...messages[chatId].items],
          },
        });
        setIsSubmitting(false);
      },
    });
  };

  const handleReadMessage = messageId => {
    markMessageAsRead({
      userId: user.id,
      messageId,
      onError: error => console.log({ error }),
      onSuccess: () => mutate(),
    });
  };

  if (isLoading) return null;
  console.log({ messages, chat });
  if ((!messages || !chat) && !isLoading) return <>No Messages to display</>;

  return (
    <ChatContainer>
      <Messages ref={messagesRef}>
        {chat.currentPage &&
          (isEmpty(chat) ? (
            <NoMessages type={TextTypes.Body4}>
              {'No messages sent yet'}
            </NoMessages>
          ) : (
            <>
              {chat?.items?.map(message => (
                <Message
                  $isSelf={message.sender !== user.id}
                  key={message.uuid}
                >
                  <MessageText
                    $isSelf={message.sender !== user.id}
                    disableParser={!message.parsable}
                  >
                    {message.text}
                  </MessageText>
                  <div className="flex flex-end justify-end align-center">
                    <Popover
                      trigger={
                        <Button type="button" variation={ButtonVariations.Icon}>
                          <DotsIcon
                            circular
                            height="16px"
                            width="16px"
                            label="message menu icon"
                            labelId="messageMenuIcon"
                            color={theme.color.text.highlight}
                          />
                        </Button>
                      }
                    >
                      <Button
                        variation={ButtonVariations.Inline}
                        disabled={message.sender !== user.id || message.read}
                        onClick={() => handleReadMessage(message.uuid)}
                      >
                        Mark as Read
                      </Button>
                      <Button
                        variation={ButtonVariations.Inline}
                        disabled={message.sender === user.id}
                      >
                        Delete Message
                      </Button>
                    </Popover>
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
                      {formatTimeDistance(message.created, new Date(), 'en')}
                    </Time>
                  </div>
                </Message>
              ))}
              {/* <div ref={scrollRef} /> */}
            </>
          ))}
      </Messages>

      <WriteSection onSubmit={handleSubmit(sendNewMessage)}>
        <MessageBox
          {...registerInput({
            register,
            name: 'newMessage',
            options: { required: 'error.required' },
          })}
          id="newMessage"
          error={errors?.newMessage?.message}
          placeholder="Write a message here..."
          onSubmit={() => handleSubmit(sendNewMessage)()}
        />

        <SendButton
          size={ButtonSizes.Medium}
          type="submit"
          disabled={isSubmitting}
          variation={ButtonVariations.Circle}
          backgroundColor={theme.color.gradient.orange10}
        >
          <SendIcon
            label={'send new message icon'}
            labelId={'send_icon'}
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
