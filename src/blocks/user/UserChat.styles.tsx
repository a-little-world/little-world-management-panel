import {
  Button,
  Checkbox,
  Text,
  TextArea,
} from '@a-little-world/little-world-design-system';
import styled, { css } from 'styled-components';

export const ChatContainer = styled.div`
  display: flex;
  position: relative;
  flex-direction: column;
  flex: 1;
  gap: ${({ theme }) => theme.spacing.small};
  overflow: visible;
  min-height: 0;
  width: 100%;
  height: 100%;
`;

export const ActionsContainer = styled.div`
  display: flex;
  align-items: flex-end;
  justify-content: flex-end;
  gap: ${({ theme }) => theme.spacing.xsmall};
`;

export const WriteSection = styled.form`
  position: relative;
  z-index: 1; // prevents overlap issues with messages
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  gap: ${({ theme }) => theme.spacing.xsmall};
  overflow: visible;
`;

export const Messages = styled.div`
  position: relative;
  height: 100%;
  border: 2px solid ${({ theme }) => theme.color.border.minimal};
  border-radius: 20px;
  flex-grow: 1;
  display: flex;
  flex-direction: column-reverse;
  gap: ${({ theme }) => theme.spacing.small};
  padding: ${({ theme }) => theme.spacing.small};
  overflow-y: auto;
  overflow-x: hidden;
  min-height: 0;
  -webkit-overflow-scrolling: touch;
`;

export const MessageGroup = styled.div`
  position: relative;
  display: flex;
  flex-direction: column;
  gap: ${({ theme }) => theme.spacing.xxsmall};
`;

export const StickyDateHeader = styled.div<{ $isSticky: boolean }>`
  position: ${({ $isSticky }) => ($isSticky ? 'sticky' : 'relative')};
  top: ${({ $isSticky }) => ($isSticky ? '0' : 'auto')};
  z-index: 2;
  background: ${({ theme }) => theme.color.surface.primary};
  padding: ${({ theme }) => theme.spacing.xxsmall}
    ${({ theme }) => theme.spacing.small};
  border-radius: ${({ theme }) => theme.radius.medium};
  margin: ${({ theme }) => theme.spacing.xxsmall} 0;
  align-self: center;
  box-shadow: ${({ $isSticky, theme }) =>
    $isSticky ? `0 2px 4px ${theme.color.border.subtle}` : 'none'};
`;

export const Message = styled.div<{ $isSelf: boolean }>`
  align-self: ${({ $isSelf }) => ($isSelf ? 'flex-end' : 'flex-start')};
  align-items: ${({ $isSelf }) => ($isSelf ? 'flex-end' : 'flex-start')};
  display: flex;
  flex-direction: column;
  width: 90%;
`;

export const MessageText = styled(Text)<{
  $isSelf: boolean;
  $isWidget: boolean;
}>`
  position: relative;
  padding: ${({ theme, $isWidget }) =>
    $isWidget
      ? theme.spacing.xxxsmall
      : `${theme.spacing.xxsmall} ${theme.spacing.xsmall}`};
  border: 1px solid ${({ theme }) => theme.color.border.subtle};
  border-radius: ${({ theme }) => theme.radius.medium};
  margin-bottom: ${({ theme }) => theme.spacing.xxsmall};
  max-width: 100%;
  overflow-wrap: break-word;
  white-space: pre-wrap;
  hyphens: auto;

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
  background: ${({ theme }) => theme.color.surface.secondary};
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

const TOOLBAR_BTN_CSS = css`
  flex-shrink: 0;
`;

export const Attachment = styled.div`
  ${TOOLBAR_BTN_CSS}
  position: relative;
  display: flex;
  height: 44px;
  align-items: center;
  justify-content: center;
  color: ${({ theme }) => theme.color.text.tertiary};
`;

export const SendButton = styled(Button)`
  ${TOOLBAR_BTN_CSS}
`;

export const AttachmentButton = styled(Button)`
  ${TOOLBAR_BTN_CSS}
`;
