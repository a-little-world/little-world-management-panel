import styled from 'styled-components';

import { FormStack as BaseFormStack } from '../../../atoms/FormLayout';

export const EditorRoot = styled.div`
  display: flex;
  flex-direction: column;
  height: 100%;
  overflow: hidden;
  background: ${({ theme }) => theme.color.surface.primary};
`;

export const TwoPaneLayout = styled.div`
  flex: 1;
  min-height: 0;
  display: flex;
  overflow: hidden;
`;

export const CategoryRail = styled.nav`
  width: 272px;
  flex-shrink: 0;
  background: ${({ theme }) => theme.color.surface.primary};
  border-right: 1px solid ${({ theme }) => theme.color.border.subtle};
  display: flex;
  flex-direction: column;
  overflow: hidden;
`;

export const CategoryRailTop = styled.div`
  flex: 1;
  overflow-y: auto;
  padding: ${({ theme }) => `${theme.spacing.medium} ${theme.spacing.small}`};
  display: flex;
  flex-direction: column;
  gap: ${({ theme }) => theme.spacing.xxsmall};
`;

export const CategoryRailLabel = styled.div`
  font-size: 0.6875rem;
  font-weight: 700;
  color: ${({ theme }) => theme.color.text.secondary};
  text-transform: uppercase;
  letter-spacing: 0.08em;
  padding: 0 ${({ theme }) => theme.spacing.xsmall};
`;

export const CategoryRailItem = styled.button<{ $selected?: boolean }>`
  display: flex;
  align-items: center;
  gap: ${({ theme }) => theme.spacing.xsmall};
  padding: 7px ${({ theme }) => theme.spacing.xsmall};
  border-radius: 10px;
  border: none;
  border-left: 3px solid
    ${({ $selected, theme }) =>
      $selected ? theme.color.border.bold : 'transparent'};
  background: ${({ $selected, theme }) =>
    $selected ? theme.color.surface.secondary : 'transparent'};
  cursor: pointer;
  text-align: left;
  width: 100%;

  &:hover {
    background: ${({ theme }) => theme.color.surface.secondary};
  }
`;

export const CategoryRailItemTitle = styled.span`
  flex: 1;
  min-width: 0;
  font-size: 0.8125rem;
  font-weight: 600;
  color: ${({ theme }) => theme.color.text.primary};
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
`;

export const CategoryRailCount = styled.span`
  font-size: 0.6875rem;
  color: ${({ theme }) => theme.color.text.secondary};
  flex-shrink: 0;
`;

export const CategoryRailAddBtn = styled.button`
  display: flex;
  align-items: center;
  justify-content: flex-start;
  gap: 4px;
  width: calc(100% - ${({ theme }) => theme.spacing.xsmall} * 2);
  margin: ${({ theme }) => `${theme.spacing.xsmall} ${theme.spacing.xsmall} 0`};
  padding: 8px ${({ theme }) => theme.spacing.xsmall};
  border: 1.5px dashed ${({ theme }) => theme.color.border.moderate};
  border-radius: 10px;
  background: transparent;
  color: ${({ theme }) => theme.color.text.secondary};
  font-size: 0.8125rem;
  font-weight: 600;
  cursor: pointer;

  &:hover:not(:disabled) {
    background: ${({ theme }) => theme.color.surface.secondary};
  }

  &:disabled {
    opacity: 0.4;
    cursor: not-allowed;
  }
`;

export const CategoryRailEmpty = styled.div`
  margin: 6px ${({ theme }) => theme.spacing.xsmall} 0;
  padding: 14px ${({ theme }) => theme.spacing.small};
  border: 1.5px dashed ${({ theme }) => theme.color.border.subtle};
  border-radius: 12px;
  text-align: center;
  font-size: 0.75rem;
  color: ${({ theme }) => theme.color.text.secondary};
  line-height: 1.4;
`;

export const MainPane = styled.div`
  flex: 1;
  min-width: 0;
  overflow-y: auto;
  background: ${({ theme }) => theme.color.surface.primary};
`;

export const CategoryEditorRoot = styled.div`
  padding: ${({ theme }) => theme.spacing.medium}
    ${({ theme }) => theme.spacing.large};
  display: flex;
  flex-direction: column;
  gap: ${({ theme }) => theme.spacing.medium};
  max-width: 760px;
`;

export const CategoryEditorHeading = styled.h2`
  margin: 0;
  font-size: 1.375rem;
  font-weight: 700;
  color: ${({ theme }) => theme.color.text.primary};
`;

export const CategoryEditorHint = styled.p`
  margin: 4px 0 0;
  font-size: 0.8125rem;
  color: ${({ theme }) => theme.color.text.secondary};
`;

export const FormStack = styled(BaseFormStack)``;

export const TwoCol = styled.div`
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: ${({ theme }) => theme.spacing.small};

  @media (max-width: ${({ theme }) => theme.breakpoints.small}) {
    grid-template-columns: 1fr;
  }
`;

export const Divider = styled.hr`
  border: none;
  border-top: 1px solid ${({ theme }) => theme.color.border.subtle};
  margin: 0;
`;

export const CardsSectionHeader = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: ${({ theme }) => theme.spacing.small};
`;

export const CardsSectionTitle = styled.h3`
  margin: 0;
  font-size: 1rem;
  font-weight: 700;
  color: ${({ theme }) => theme.color.text.primary};
`;

export const CardEditorItem = styled.div`
  border: 1px solid ${({ theme }) => theme.color.border.subtle};
  border-radius: ${({ theme }) => theme.radius.small};
  padding: ${({ theme }) => theme.spacing.small};
  display: flex;
  flex-direction: column;
  gap: ${({ theme }) => theme.spacing.small};
`;

export const CardEditorHeader = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: ${({ theme }) => theme.spacing.small};
`;

export const CardEditorLabel = styled.span`
  font-size: 0.8125rem;
  font-weight: 700;
  color: ${({ theme }) => theme.color.text.secondary};
`;

export const CardList = styled.div`
  display: flex;
  flex-direction: column;
  gap: ${({ theme }) => theme.spacing.small};
`;

export const DeleteCategoryBtn = styled.button`
  display: inline-flex;
  align-items: center;
  gap: 4px;
  border: none;
  background: transparent;
  color: ${({ theme }) => theme.color.text.secondary};
  font-size: 0.8125rem;
  font-weight: 600;
  cursor: pointer;
  padding: 0;

  &:hover:not(:disabled) {
    color: ${({ theme }) => theme.color.text.primary};
  }

  &:disabled {
    opacity: 0.4;
    cursor: not-allowed;
  }
`;

export const IconButton = styled.button`
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 28px;
  height: 28px;
  border: none;
  border-radius: ${({ theme }) => theme.radius.xxsmall};
  background: transparent;
  color: ${({ theme }) => theme.color.text.secondary};
  cursor: pointer;

  &:hover:not(:disabled) {
    background: ${({ theme }) => theme.color.surface.secondary};
    color: ${({ theme }) => theme.color.text.primary};
  }

  &:disabled {
    opacity: 0.4;
    cursor: not-allowed;
  }
`;

export const EmptyCategoryPane = styled.div`
  flex: 1;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: ${({ theme }) => theme.spacing.large};
  color: ${({ theme }) => theme.color.text.secondary};
  font-size: 0.875rem;
`;
