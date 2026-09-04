import { Button } from '@a-little-world/little-world-design-system';
import styled from 'styled-components';

import { BLUE_40, ORANGE_10, ORANGE_30, ORANGE_40 } from '../../../constants';

export const InlineTitleInput = styled.input`
  border: none;
  outline: none;
  background: transparent;
  font-size: 1.625rem;
  font-weight: 700;
  color: ${ORANGE_40};
  padding: 0;
  width: 100%;

  &::placeholder {
    color: #e0a07a;
  }
`;

/* ── Quiz steps section ── */

export const QuizStepsHeader = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: ${({ theme }) => theme.spacing.small};
`;

export const QuizStepsTitleRow = styled.div`
  display: flex;
  align-items: center;
  gap: ${({ theme }) => theme.spacing.xsmall};
  min-width: 0;
`;

export const QuizStepsTitle = styled.h3`
  margin: 0;
  font-size: 0.9375rem;
  font-weight: 700;
  color: ${BLUE_40};
`;

export const QuizStepsCount = styled.span`
  font-size: 0.9375rem;
  font-weight: 500;
  color: ${({ theme }) => theme.color.text.secondary};
`;

export const QuizStepList = styled.div`
  display: flex;
  flex-direction: column;
  gap: ${({ theme }) => theme.spacing.small};
  margin-top: ${({ theme }) => theme.spacing.xsmall};
`;

export const QuizEmptyCallout = styled.div`
  margin-top: ${({ theme }) => theme.spacing.xsmall};
  padding: ${({ theme }) => `${theme.spacing.small} ${theme.spacing.medium}`};
  border: 1.5px dashed ${({ theme }) => theme.color.border.subtle};
  border-radius: 12px;
  background: ${({ theme }) => theme.color.surface.primary};
`;

export const QuizEmptyText = styled.p`
  margin: 0;
  font-size: 0.8125rem;
  color: ${({ theme }) => theme.color.text.secondary};
  line-height: 1.5;
`;

/* Collapsed quiz step row */

export const QuizStepCollapsedRow = styled.button`
  display: flex;
  align-items: center;
  gap: ${({ theme }) => theme.spacing.xsmall};
  padding: 10px 14px;
  background: ${({ theme }) => theme.color.surface.secondary};
  border-radius: 10px;
  border: 1px solid ${({ theme }) => theme.color.border.subtle};
  cursor: pointer;
  text-align: left;
  width: 100%;
  transition: background 0.1s;

  &:hover {
    background: ${({ theme }) => theme.color.surface.tertiary};
  }
`;

export const QuizStepCollapsedNum = styled.span`
  width: 22px;
  height: 22px;
  border-radius: 6px;
  background: ${({ theme }) => theme.color.surface.primary};
  color: ${BLUE_40};
  font-size: 0.6875rem;
  font-weight: 700;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
`;

export const QuizStepCollapsedQuestion = styled.span`
  flex: 1;
  font-size: 0.8125rem;
  color: ${({ theme }) => theme.color.text.primary};
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
`;

export const QuizStepCollapsedMeta = styled.span`
  font-size: 0.6875rem;
  color: ${({ theme }) => theme.color.text.secondary};
  flex-shrink: 0;
`;

/* Expanded quiz step card */

export const QuizStepItem = styled.div`
  border: 1.5px solid ${({ theme }) => theme.color.border.subtle};
  border-radius: 12px;
  overflow: hidden;
  background: ${({ theme }) => theme.color.surface.primary};
`;

export const QuizStepItemHeaderBtn = styled.button`
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: ${({ theme }) => theme.spacing.xsmall}
    ${({ theme }) => theme.spacing.small};
  background: ${({ theme }) => theme.color.surface.secondary};
  border: none;
  cursor: pointer;
  width: 100%;
  border-bottom: 1px solid ${({ theme }) => theme.color.border.subtle};
  transition: background 0.1s;

  &:hover {
    background: ${({ theme }) => theme.color.surface.tertiary};
  }
`;

export const QuizStepItemTitle = styled.span`
  font-size: 0.75rem;
  font-weight: 700;
  color: ${({ theme }) => theme.color.text.secondary};
  text-transform: uppercase;
  letter-spacing: 0.05em;
`;

export const QuizStepItemBody = styled.div`
  padding: ${({ theme }) => theme.spacing.small};
  display: flex;
  flex-direction: column;
  gap: ${({ theme }) => theme.spacing.small};
`;

/* Answers inside expanded step */

export const AnswerList = styled.div`
  display: flex;
  flex-direction: column;
  gap: ${({ theme }) => theme.spacing.xxsmall};
`;

export const AnswerListHeader = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: ${({ theme }) => theme.spacing.xxsmall};
`;

export const AnswerRowHighlight = styled.div<{ $correct?: boolean }>`
  display: flex;
  align-items: center;
  gap: ${({ theme }) => theme.spacing.xsmall};
  padding: 6px 8px;
  border-radius: 10px;
  border: 1.5px solid
    ${({ $correct }) => ($correct ? ORANGE_30 : 'transparent')};
  background: ${({ $correct }) => ($correct ? ORANGE_10 : 'transparent')};
  transition:
    background 0.1s,
    border-color 0.1s;
`;

export const AnswerRadio = styled.input`
  flex-shrink: 0;
  width: 1rem;
  height: 1rem;
  cursor: pointer;
  margin: 0;
`;

export const CorrectAnswerBadge = styled.span`
  font-size: 0.625rem;
  font-weight: 700;
  color: ${ORANGE_40};
  text-transform: uppercase;
  letter-spacing: 0.06em;
  flex-shrink: 0;
`;

export const AnswerInstructionHint = styled.span`
  font-size: 0.6875rem;
  color: ${({ theme }) => theme.color.text.secondary};
`;

/* ── Completion messaging ── */

export const CompletionToggle = styled.button`
  display: flex;
  align-items: center;
  gap: ${({ theme }) => theme.spacing.xsmall};
  width: 100%;
  padding: 12px ${({ theme }) => theme.spacing.medium};
  border: 1px solid ${({ theme }) => theme.color.border.subtle};
  border-radius: 12px;
  background: ${({ theme }) => theme.color.surface.primary};
  cursor: pointer;
  text-align: left;
  transition: background 0.1s;

  &:hover {
    background: ${({ theme }) => theme.color.surface.secondary};
  }
`;

export const CompletionToggleLabel = styled.span`
  font-size: 0.8125rem;
  font-weight: 600;
  color: ${({ theme }) => theme.color.text.primary};
`;

export const CompletionOptionalBadge = styled.span`
  font-size: 0.6875rem;
  padding: 2px 8px;
  border-radius: 999px;
  background: ${({ theme }) => theme.color.surface.secondary};
  color: ${({ theme }) => theme.color.text.secondary};
`;

export const CompletionToggleHint = styled.span`
  flex: 1;
  font-size: 0.75rem;
  color: ${({ theme }) => theme.color.text.secondary};
  text-align: right;
  padding-right: ${({ theme }) => theme.spacing.xsmall};
`;

export const CompletionPanel = styled.div`
  border: 1.5px solid ${({ theme }) => theme.color.border.subtle};
  border-radius: 16px;
  background: ${({ theme }) => theme.color.surface.primary};
  overflow: hidden;
`;

export const CompletionPanelHeader = styled.div`
  display: flex;
  align-items: center;
  gap: ${({ theme }) => theme.spacing.xsmall};
  padding: 14px 18px;
  border-bottom: 1px solid ${({ theme }) => theme.color.surface.secondary};
`;

export const CompletionIconBadge = styled.span`
  width: 24px;
  height: 24px;
  border-radius: 8px;
  background: ${ORANGE_10};
  display: inline-flex;
  align-items: center;
  justify-content: center;
  font-size: 0.75rem;
  color: ${ORANGE_40};
  flex-shrink: 0;
`;

export const CompletionPanelTitle = styled.span`
  font-size: 0.875rem;
  font-weight: 700;
  color: ${BLUE_40};
`;

export const CompletionPanelHint = styled.span`
  flex: 1;
  font-size: 0.75rem;
  color: ${({ theme }) => theme.color.text.secondary};
  text-align: right;
  padding-right: ${({ theme }) => theme.spacing.xsmall};
`;

export const CompletionCollapseBtn = styled.button`
  background: none;
  border: none;
  cursor: pointer;
  color: ${({ theme }) => theme.color.text.secondary};
  display: flex;
  align-items: center;
  padding: 0;
`;

export const CompletionPanelBody = styled.div`
  padding: 18px 20px;
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: ${({ theme }) => theme.spacing.medium};
`;

/* ── Shared form primitives ── */

export const BackButton = styled(Button)`
  gap: ${({ theme }) => theme.spacing.xxxsmall};
  font-weight: 600;
  padding: ${({ theme }) => theme.spacing.xxsmall} !important;
  flex-shrink: 0;

  > svg {
    flex-shrink: 0;
  }
`;

export const IconButton = styled.button`
  background: none;
  border: none;
  cursor: pointer;
  padding: ${({ theme }) => theme.spacing.xxsmall};
  border-radius: ${({ theme }) => theme.radius.small};
  color: ${({ theme }) => theme.color.text.secondary};
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
  transition:
    color 0.1s,
    background 0.1s;

  &:hover {
    color: ${({ theme }) => theme.color.text.error};
    background: ${({ theme }) => theme.color.surface.error};
  }
`;
