import { Button } from '@a-little-world/little-world-design-system';
import styled from 'styled-components';

import { FormStack as BaseFormStack } from '../../atoms/FormLayout';

/* ── Brand colours — specific to the courses feature ── */
const BRAND_ORANGE = '#db590b';
const BRAND_ORANGE_LIGHT = '#f39224';
const BRAND_ORANGE_TINT = '#fde5cf';
const BRAND_BLUE = '#0063af';

/* ── Top-level chrome ── */

export const EditorRoot = styled.div`
  display: flex;
  flex-direction: column;
  height: 100dvh;
  overflow: hidden;
  background: ${({ theme }) => theme.color.surface.primary};
`;

export const TopBarRoot = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: ${({ theme }) =>
    `${theme.spacing.xxxsmall} ${theme.spacing.medium}`};
  flex-shrink: 0;
  background: ${({ theme }) => theme.color.surface.primary};
  border-bottom: 1px solid ${({ theme }) => theme.color.border.subtle};
  gap: ${({ theme }) => theme.spacing.medium};
  z-index: 10;
`;

export const TopBarRight = styled.div`
  display: flex;
  align-items: center;
  gap: ${({ theme }) => theme.spacing.small};
  flex-shrink: 0;
`;

export const TopBarDivider = styled.span`
  width: 1px;
  height: 20px;
  background: ${({ theme }) => theme.color.border.subtle};
  flex-shrink: 0;
`;

/* ── Two-pane shell ── */

export const TwoPaneLayout = styled.div`
  flex: 1;
  min-height: 0;
  display: flex;
  overflow: hidden;
`;

/* ── Main right pane ── */

export const MainPane = styled.div`
  flex: 1;
  min-width: 0;
  overflow-y: auto;
  background: ${({ theme }) => theme.color.surface.primary};
`;

/* ── Course details pane ── */

export const CourseDetailsRoot = styled.div`
  padding: 24px 32px;
  display: flex;
  flex-direction: column;
  gap: ${({ theme }) => theme.spacing.medium};
  max-width: 720px;
`;

export const CourseDetailsHeading = styled.h2`
  margin: 0;
  font-size: 1.375rem;
  font-weight: 700;
  color: ${BRAND_BLUE};
`;

export const CourseDetailsHint = styled.p`
  margin: 4px 0 0;
  font-size: 0.8125rem;
  color: ${({ theme }) => theme.color.text.secondary};
`;

export const EmptyChaptersCallout = styled.div`
  padding: 24px;
  background: ${({ theme }) => theme.color.surface.primary};
  border: 1.5px dashed ${({ theme }) => theme.color.border.subtle};
  border-radius: 16px;
  display: flex;
  align-items: center;
  gap: 18px;
`;

export const EmptyChaptersText = styled.div`
  flex: 1;
`;

export const EmptyChaptersTitle = styled.div`
  font-size: 0.9375rem;
  font-weight: 700;
  color: ${BRAND_BLUE};
`;

export const EmptyChaptersBody = styled.div`
  font-size: 0.8125rem;
  color: ${({ theme }) => theme.color.text.secondary};
  margin-top: 4px;
  line-height: 1.5;
`;

/* ── Chapter editor pane ── */

export const ChapterEditorRoot = styled.div`
  padding: 20px 32px 48px;
  display: flex;
  flex-direction: column;
  gap: 14px;
  max-width: 820px;
`;

export const ChapterEditorMeta = styled.div`
  display: flex;
  align-items: center;
  gap: ${({ theme }) => theme.spacing.xsmall};
`;

export const ChapterEditorMetaLabel = styled.span`
  font-size: 0.75rem;
  color: ${({ theme }) => theme.color.text.secondary};
`;

export const ChapterNumGradient = styled.span`
  width: 22px;
  height: 22px;
  border-radius: 6px;
  background: linear-gradient(135deg, ${BRAND_ORANGE_LIGHT}, ${BRAND_ORANGE});
  color: #fff;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  font-size: 0.6875rem;
  font-weight: 700;
  flex-shrink: 0;
`;

export const DeleteChapterBtn = styled.button`
  display: inline-flex;
  align-items: center;
  gap: 4px;
  margin-left: auto;
  background: none;
  border: none;
  cursor: pointer;
  font-size: 0.8125rem;
  font-weight: 600;
  color: ${({ theme }) => theme.color.text.secondary};
  padding: 4px ${({ theme }) => theme.spacing.xsmall};
  border-radius: ${({ theme }) => theme.radius.small};
  transition:
    color 0.1s,
    background 0.1s;

  &:hover {
    color: ${({ theme }) => theme.color.text.error};
    background: ${({ theme }) => theme.color.surface.error};
  }
`;

export const Divider = styled.div`
  height: 1px;
  background: ${({ theme }) => theme.color.surface.secondary};
  margin: 4px 0;
`;

export const InlineTitleInput = styled.input`
  border: none;
  outline: none;
  background: transparent;
  font-size: 1.625rem;
  font-weight: 700;
  color: ${BRAND_ORANGE};
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
`;

export const QuizStepsTitle = styled.h3`
  margin: 0;
  font-size: 0.9375rem;
  font-weight: 700;
  color: ${BRAND_BLUE};
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
  color: ${BRAND_BLUE};
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
    ${({ $correct }) => ($correct ? BRAND_ORANGE_LIGHT : 'transparent')};
  background: ${({ $correct }) =>
    $correct ? BRAND_ORANGE_TINT : 'transparent'};
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
  color: ${BRAND_ORANGE};
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
  background: ${BRAND_ORANGE_TINT};
  display: inline-flex;
  align-items: center;
  justify-content: center;
  font-size: 0.75rem;
  color: ${BRAND_ORANGE};
  flex-shrink: 0;
`;

export const CompletionPanelTitle = styled.span`
  font-size: 0.875rem;
  font-weight: 700;
  color: ${BRAND_BLUE};
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

export const FormStack = styled(BaseFormStack)`
  width: 100%;
`;

export const TwoCol = styled.div`
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: ${({ theme }) => theme.spacing.medium};
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

export const QuizSectionTitle = styled.span`
  font-size: 0.8125rem;
  font-weight: 600;
  color: ${({ theme }) => theme.color.text.secondary};
  text-transform: uppercase;
  letter-spacing: 0.04em;
`;
