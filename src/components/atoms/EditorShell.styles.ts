import styled from 'styled-components';

import { FormStack as BaseFormStack } from './FormLayout';
import { BLUE_40, ORANGE_30, ORANGE_40 } from '../../constants';

/**
 * The shell shared by the full-page editors: a fixed top bar, a structure rail on the left
 * (see `StructureRail`) and a scrolling pane on the right. The course editor and the survey
 * editor had byte-identical copies of all of this; it lives here so a third editor is a
 * layout import rather than another copy.
 *
 * Naming is deliberately domain-free — "section", not "chapter" or "question".
 */

/* ── Page shell ── */

export const EditorRoot = styled.div`
  display: flex;
  flex-direction: column;
  height: 100%;
  overflow: hidden;
  background: ${({ theme }) => theme.color.surface.primary};
`;

export const TopBarDivider = styled.span`
  width: 1px;
  height: 20px;
  background: ${({ theme }) => theme.color.border.subtle};
  flex-shrink: 0;
`;

export const TwoPaneLayout = styled.div`
  flex: 1;
  min-height: 0;
  display: flex;
  overflow: hidden;
`;

export const MainPane = styled.div`
  flex: 1;
  min-width: 0;
  overflow-y: auto;
  background: ${({ theme }) => theme.color.surface.primary};
`;

/* ── A pane's content ── */

/** `$maxWidth` narrows a pane whose form reads better short of the default measure. */
export const PaneRoot = styled.div<{ $maxWidth?: string }>`
  padding: 24px 32px 48px;
  display: flex;
  flex-direction: column;
  gap: ${({ theme }) => theme.spacing.medium};
  max-width: ${({ $maxWidth }) => $maxWidth ?? '820px'};
`;

export const PaneHeading = styled.h2`
  margin: 0;
  font-size: 1.375rem;
  font-weight: 700;
  color: ${BLUE_40};
`;

export const PaneHint = styled.p`
  margin: 4px 0 0;
  font-size: 0.8125rem;
  color: ${({ theme }) => theme.color.text.secondary};
  line-height: 1.5;
`;

export const SectionTitle = styled.span`
  font-size: 0.8125rem;
  font-weight: 600;
  color: ${({ theme }) => theme.color.text.secondary};
  text-transform: uppercase;
  letter-spacing: 0.04em;
`;

export const Divider = styled.div`
  height: 1px;
  background: ${({ theme }) => theme.color.surface.secondary};
  margin: 4px 0;
`;

/* ── A section's header row ── */

export const SectionMeta = styled.div`
  display: flex;
  align-items: center;
  gap: ${({ theme }) => theme.spacing.xsmall};
`;

export const SectionMetaLabel = styled.span`
  font-size: 0.75rem;
  color: ${({ theme }) => theme.color.text.secondary};
`;

export const SectionNumGradient = styled.span`
  width: 22px;
  height: 22px;
  border-radius: 6px;
  background: linear-gradient(135deg, ${ORANGE_30}, ${ORANGE_40});
  color: #fff;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  font-size: 0.6875rem;
  font-weight: 700;
  flex-shrink: 0;
`;

export const DeleteSectionBtn = styled.button`
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

  &:hover:not(:disabled) {
    color: ${({ theme }) => theme.color.text.error};
    background: ${({ theme }) => theme.color.surface.error};
  }

  &:disabled {
    opacity: 0.4;
    cursor: not-allowed;
  }
`;

/* ── "Nothing here yet" callout ── */

export const EmptyCallout = styled.div`
  padding: 24px;
  background: ${({ theme }) => theme.color.surface.primary};
  border: 1.5px dashed ${({ theme }) => theme.color.border.subtle};
  border-radius: 16px;
  display: flex;
  align-items: center;
  gap: 18px;
`;

export const EmptyCalloutText = styled.div`
  flex: 1;
`;

export const EmptyCalloutTitle = styled.div`
  font-size: 0.9375rem;
  font-weight: 700;
  color: ${BLUE_40};
`;

export const EmptyCalloutBody = styled.div`
  font-size: 0.8125rem;
  color: ${({ theme }) => theme.color.text.secondary};
  margin-top: 4px;
  line-height: 1.5;
`;

/* ── Form primitives ── */

export const FormStack = styled(BaseFormStack)`
  width: 100%;
`;

export const TwoCol = styled.div`
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: ${({ theme }) => theme.spacing.medium};
`;
