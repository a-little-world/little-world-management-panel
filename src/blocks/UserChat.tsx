import {
  Button,
  ButtonSizes,
  ButtonVariations,
  DotsIcon,
  Popover,
  SendIcon,
  TextAreaSize,
  TextTypes,
  TickDoubleIcon,
  TickIcon,
} from '@a-little-world/little-world-design-system';
import { isEmpty } from 'lodash';
import React, { useRef, useState } from 'react';
import { useForm } from 'react-hook-form';
import { useTheme } from 'styled-components';

import { markMessageAsRead, sendChatMessage } from '../api/index';
import { formatTimeDistance } from '../helpers/date';
import useInfiniteScroll from '../hooks/useInfiniteScroll';
import { registerInput } from '../store';
import {
  ChatContainer,
  Message,
  MessageBox,
  MessageText,
  Messages,
  NoMessages,
  SendButton,
  Time,
  UnreadCheckbox,
  WriteSection,
} from './UserChat.styles';

const UserChat = ({ user }) => {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [unreadOnly, setUnreadOnly] = useState(false);
  const messagesRef = useRef();
  const theme = useTheme();

  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
    setError,
  } = useForm();

  const onError = error => {
    setError('message', {});
    setIsSubmitting(false);
  };

  const {
    data,
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

  const sendNewMessage = payload => {
    setIsSubmitting(true);
    sendChatMessage({
      userId: user.id,
      message: payload.newMessage,
      onError,
      onSuccess: message => {
        console.log({ message });
        reset();
        setResults([message, ...results]);
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
            {messages?.map(message => (
              <Message
                $isSelf={message.sender !== user.hash}
                key={message.uuid}
              >
                <MessageText
                  $isSelf={message.sender !== user.hash}
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
                          color={theme.color.surface.quaternary}
                        />
                      </Button>
                    }
                  >
                    <Button
                      variation={ButtonVariations.Inline}
                      disabled={message.sender !== user.hash || message.read}
                      onClick={() => handleReadMessage(message.uuid)}
                    >
                      Mark as Read
                    </Button>
                    <Button
                      variation={ButtonVariations.Inline}
                      disabled={message.sender === user.hash}
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
            <div ref={scrollRef} />
          </>
        )}
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
          size={TextAreaSize.Medium}
        />

        <SendButton
          size={ButtonSizes.Large}
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
