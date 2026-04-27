import { ImagePlus, X as XIcon } from 'lucide-react';
import styled, { css } from 'styled-components';

export const FieldRoot = styled.div`
  display: flex;
  flex-direction: column;
`;

export const VisuallyHiddenInput = styled.input`
  position: absolute;
  width: 1px;
  height: 1px;
  padding: 0;
  margin: -1px;
  overflow: hidden;
  clip: rect(0, 0, 0, 0);
  white-space: nowrap;
  border: 0;
`;

export const DropZone = styled.div<{
  $disabled: boolean;
  $isDragging: boolean;
}>`
  position: relative;
  width: 100%;
  overflow: hidden;
  border-radius: ${({ theme }) => theme.radius.medium};
  border: 2px dashed ${({ theme }) => theme.color.border.moderate};
  text-align: left;
  transition:
    border-color 0.15s ease,
    background-color 0.15s ease,
    opacity 0.15s ease;
  background: ${({ theme }) => theme.color.surface.secondary};

  ${({ $disabled, theme }) =>
    $disabled &&
    css`
      cursor: not-allowed;
      opacity: 0.7;
      border-color: ${theme.color.border.subtle};
      background: ${theme.color.surface.primary};
    `}

  ${({ $disabled, $isDragging, theme }) =>
    !$disabled &&
    $isDragging &&
    css`
      border-color: ${theme.color.border.selected};
      background: ${theme.color.surface.secondary};
    `}

  ${({ $disabled, $isDragging, theme }) =>
    !$disabled &&
    !$isDragging &&
    css`
      &:hover {
        border-color: ${theme.color.border.moderate};
        background: ${theme.color.surface.secondary};
      }
    `}
`;

export const PreviewColumn = styled.div`
  display: flex;
  flex-direction: column;
  align-items: stretch;
`;

export const PreviewClickArea = styled.div<{
  $disabled: boolean;
  $compact?: boolean;
}>`
  position: relative;
  display: flex;
  max-height: ${({ $compact }) => ($compact ? '7rem' : '13rem')};
  min-height: ${({ $compact }) => ($compact ? '4.5rem' : '8rem')};
  align-items: center;
  justify-content: center;
  padding: ${({ theme }) => theme.spacing.xsmall};
  background: ${({ theme }) => theme.color.surface.secondary};
  cursor: ${({ $disabled }) => ($disabled ? 'default' : 'pointer')};

  &:focus-visible {
    outline: 2px solid ${({ theme }) => theme.color.border.selected};
    outline-offset: 2px;
  }
`;

export const PreviewImage = styled.img<{ $compact?: boolean }>`
  max-height: ${({ $compact }) => ($compact ? '6rem' : '12rem')};
  width: 100%;
  object-fit: contain;
  pointer-events: none;
`;

export const RemoveImageButton = styled.button`
  position: absolute;
  top: ${({ theme }) => theme.spacing.small};
  right: ${({ theme }) => theme.spacing.small};
  display: flex;
  align-items: center;
  justify-content: center;
  padding: ${({ theme }) => theme.spacing.xsmall};
  border: none;
  border-radius: 9999px;
  cursor: pointer;
  color: ${({ theme }) => theme.color.text.reversed};
  background: ${({ theme }) => theme.color.text.title};
  opacity: 0.85;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.18);

  &:hover {
    opacity: 1;
  }

  &:focus-visible {
    outline: 2px solid ${({ theme }) => theme.color.border.selected};
    outline-offset: 2px;
  }
`;

export const RemoveIcon = styled(XIcon)`
  width: 1rem;
  height: 1rem;
`;

export const PreviewFooter = styled.div<{ $compact?: boolean }>`
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  justify-content: space-between;
  gap: ${({ theme }) => theme.spacing.small};
  padding: ${({ theme, $compact }) =>
    $compact ? theme.spacing.xsmall : theme.spacing.small};
  border-top: 1px solid ${({ theme }) => theme.color.border.subtle};
`;

export const PreviewCaption = styled.p<{ $compact?: boolean }>`
  margin: 0;
  min-width: 0;
  flex: 1;
  font-size: ${({ $compact }) => ($compact ? '0.75rem' : '0.8125rem')};
  line-height: 1.35;
  color: ${({ theme }) => theme.color.text.secondary};
`;

export const EmptyState = styled.div<{ $compact?: boolean }>`
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: ${({ theme, $compact }) =>
    $compact ? theme.spacing.xsmall : theme.spacing.small};
  padding: ${({ theme, $compact }) =>
    $compact ? theme.spacing.small : theme.spacing.medium};
`;

export const EmptyIcon = styled(ImagePlus)<{ $compact?: boolean }>`
  width: ${({ $compact }) => ($compact ? '2rem' : '2.5rem')};
  height: ${({ $compact }) => ($compact ? '2rem' : '2.5rem')};
  color: ${({ theme }) => theme.color.text.tertiary};
`;

export const EmptyTitle = styled.p<{ $compact?: boolean }>`
  margin: 0;
  text-align: center;
  font-size: ${({ $compact }) => ($compact ? '0.875rem' : '0.9375rem')};
  line-height: 1.4;
  color: ${({ theme }) => theme.color.text.primary};
`;

export const EmptySubtitle = styled.p<{ $compact?: boolean }>`
  margin: 0;
  text-align: center;
  font-size: ${({ $compact }) => ($compact ? '0.75rem' : '0.8125rem')};
  line-height: 1.4;
  color: ${({ theme }) => theme.color.text.secondary};
`;

export const FieldError = styled.p`
  margin: 0;
  font-size: 0.8125rem;
  line-height: 1.35;
  color: ${({ theme }) => theme.color.text.error};
`;
