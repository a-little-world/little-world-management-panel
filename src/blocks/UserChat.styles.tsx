import {
  Button,
  Checkbox,
  Text,
  TextArea,
} from '@a-little-world/little-world-design-system';
import styled, { css } from 'styled-components';

export const SendButton = styled(Button)`
  flex-shrink: 0;
`;

export const ChatContainer = styled.div`
  position: relative;
  display: flex;
  flex-direction: column;
  flex: 1;
  gap: ${({ theme }) => theme.spacing.small};
  width: 100%;
  height: 100%;
`;

export const WriteSection = styled.form`
  display: flex;
  align-items: flex-start;
  gap: ${({ theme }) => theme.spacing.xxsmall};
`;

export const Messages = styled.div`
  height: 100%;
  border: 2px solid ${({ theme }) => theme.color.border.minimal};
  border-radius: 20px;
  flex-grow: 1;
  display: flex;
  flex-direction: column-reverse;
  gap: ${({ theme }) => theme.spacing.small};
  padding: ${({ theme }) => theme.spacing.small};
  overflow-y: scroll;
  position: relative;
`;

export const Message = styled.div<{ $isSelf: boolean }>`
  align-self: ${({ $isSelf }) => ($isSelf ? 'flex-end' : 'flex-start')};
  align-items: ${({ $isSelf }) => ($isSelf ? 'flex-end' : 'flex-start')};
  display: flex;
  flex-direction: column;
  width: 90%;
`;

export const MessageText = styled(Text)<{ $isSelf: boolean }>`
  position: relative;
  padding: ${({ theme }) => `${theme.spacing.xxsmall} ${theme.spacing.xsmall}`};
  border: 1px solid ${({ theme }) => theme.color.border.subtle};
  border-radius: 24px;
  margin-bottom: ${({ theme }) => theme.spacing.xxsmall};

  ${({ $isSelf, theme }) =>
    $isSelf &&
    `
   background: ${theme.color.surface.message};
`}

  &::before {
    content: ' ';
    position: absolute;
    width: 0;
    height: 0;
    bottom: -9px;
    border: 5px solid;

    ${({ theme, $isSelf }) =>
      $isSelf
        ? css`
            border-color: ${theme.color.border.subtle}
              ${theme.color.border.subtle} transparent transparent;
            left: auto;
            right: 15px;
          `
        : css`
            border-color: ${theme.color.border.subtle} transparent transparent
              ${theme.color.border.subtle};
            right: auto;
            left: 15px;
          `}
  }

  &::after {
    content: ' ';
    position: absolute;
    width: 0;
    height: 0;
    bottom: -7px;
    border: 5px solid;

    ${({ theme, $isSelf }) =>
      $isSelf
        ? css`
            border-color: ${theme.color.surface.message}
              ${theme.color.surface.message} transparent transparent;
            left: auto;
            right: 16px;
          `
        : css`
            border-color: ${theme.color.surface.primary} transparent transparent
              ${theme.color.surface.primary};
            right: auto;
            left: 16px;
          `}
  }
`;

export const MessageBox = styled(TextArea)`
  height: 44px;
  border-radius: 100px;
  background: ${({ theme }) => theme.color.surface.secondary};
  padding: ${({ theme }) => theme.spacing.xsmall};
  line-height: normal;
`;

export const UnreadCheckbox = styled(Checkbox)`
  position: absolute;
  top: ${({ theme }) => theme.spacing.medium};
  left: ${({ theme }) => theme.spacing.medium};
  z-index: 1;
  padding: ${({ theme }) =>
    `${theme.spacing.xxxsmall} ${theme.spacing.xxsmall} 3px`};
  border: 1px solid ${({ theme }) => theme.color.border.moderate};
  background: ${({ theme }) => theme.color.surface.primary};
  border-radius: ${({ theme }) => theme.radius.xxsmall};
`;

export const NoMessages = styled(Text)`
  height: 100%;
  background: ${({ theme }) => theme.color.surface.tertiary};
  border-radius: 10px;
  align-items: center;
  justify-content: center;
  text-align: center;
  display: flex;
  padding: ${({ theme }) => theme.spacing.xxsmall};
`;

export const Time = styled(Text)`
  display: flex;
  align-items: center;
  color: ${({ theme }) => theme.color.text.secondary};
  padding-left: ${({ theme }) => theme.spacing.small};
  gap: ${({ theme }) => theme.spacing.xxxsmall};
`;
