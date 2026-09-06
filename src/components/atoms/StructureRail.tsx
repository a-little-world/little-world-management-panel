import React from 'react';
import styled from 'styled-components';

import { ORANGE_10, ORANGE_30, ORANGE_40 } from '../../constants';

/* ── Styled primitives ── */

const RailPanel = styled.nav`
  width: 272px;
  flex-shrink: 0;
  background: ${({ theme }) => theme.color.surface.primary};
  border-right: 1px solid ${({ theme }) => theme.color.border.subtle};
  display: flex;
  flex-direction: column;
  overflow: hidden;
`;

const RailTop = styled.div`
  flex: 1;
  overflow-y: auto;
  padding: ${({ theme }) => `${theme.spacing.medium} ${theme.spacing.small}`};
  display: flex;
  flex-direction: column;
  gap: ${({ theme }) => theme.spacing.xxsmall};
`;

const RailSectionLabel = styled.div`
  font-size: 0.6875rem;
  font-weight: 700;
  color: ${({ theme }) => theme.color.text.secondary};
  text-transform: uppercase;
  letter-spacing: 0.08em;
  padding: 0 ${({ theme }) => theme.spacing.xsmall};
`;

const RailNavItem = styled.button<{ $selected?: boolean }>`
  display: flex;
  align-items: center;
  gap: ${({ theme }) => theme.spacing.xsmall};
  padding: 7px ${({ theme }) => theme.spacing.xsmall};
  border-radius: 10px;
  border: none;
  border-left: 3px solid
    ${({ $selected }) => ($selected ? ORANGE_30 : 'transparent')};
  background: ${({ $selected }) => ($selected ? ORANGE_10 : 'transparent')};
  cursor: pointer;
  text-align: left;
  width: 100%;
  transition: background 0.1s;

  &:hover {
    background: ${({ $selected }) => ($selected ? ORANGE_10 : '#f4f5f7')};
  }
`;

const RailNavItemTitle = styled.span<{ $selected?: boolean }>`
  flex: 1;
  min-width: 0;
  font-size: 0.8125rem;
  font-weight: ${({ $selected }) => ($selected ? 700 : 500)};
  color: ${({ $selected }) => ($selected ? '#000' : '#4b4c4f')};
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
`;

const RailSectionNum = styled.span<{ $selected?: boolean }>`
  width: 22px;
  height: 22px;
  border-radius: 6px;
  background: ${({ $selected }) => ($selected ? '#fff' : '#f4f5f7')};
  color: ${({ $selected }) => ($selected ? ORANGE_40 : '#4b4c4f')};
  font-size: 0.6875rem;
  font-weight: 700;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
`;

const RailSectionsMeta = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: ${({ theme }) =>
    `${theme.spacing.medium} ${theme.spacing.xsmall} 4px`};
`;

/** The label inside the meta row already has the row's padding, so it drops its own. */
const RailMetaLabel = styled(RailSectionLabel)`
  margin: 0;
`;

const RailSectionCount = styled.span`
  color: ${({ theme }) => theme.color.text.tertiary};
  font-weight: 400;
`;

const RailUntitled = styled.span`
  opacity: 0.5;
  font-style: italic;
`;

const RailMoveGroup = styled.span`
  display: flex;
  gap: 2px;
  flex-shrink: 0;
`;

const RailAddGlyph = styled.span`
  font-weight: 800;
  margin-right: 2px;
  font-size: 1rem;
`;

const RailHint = styled.span`
  font-size: 0.6875rem;
  color: ${({ theme }) => theme.color.text.secondary};
`;

const RailEmptyDashed = styled.div`
  margin: 6px ${({ theme }) => theme.spacing.xsmall} 0;
  padding: 14px ${({ theme }) => theme.spacing.small};
  border: 1.5px dashed ${({ theme }) => theme.color.border.subtle};
  border-radius: 12px;
  text-align: center;
  font-size: 0.75rem;
  color: ${({ theme }) => theme.color.text.secondary};
  line-height: 1.4;
`;

const RailAddSectionBtn = styled.button`
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
  transition:
    background 0.1s,
    border-color 0.1s;

  &:hover:not(:disabled) {
    background: ${({ theme }) => theme.color.surface.secondary};
  }

  &:disabled {
    opacity: 0.4;
    cursor: not-allowed;
  }
`;

const RailMoveBtn = styled.button`
  width: 20px;
  height: 20px;
  border-radius: 5px;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  background: transparent;
  border: none;
  cursor: pointer;
  color: ${({ theme }) => theme.color.text.secondary};
  font-size: 0.75rem;
  transition:
    background 0.1s,
    color 0.1s;
  flex-shrink: 0;

  &:hover:not(:disabled) {
    background: ${ORANGE_10};
    color: ${ORANGE_40};
  }

  &:disabled {
    opacity: 0.25;
    cursor: default;
  }
`;

const RailFooter = styled.div`
  padding: ${({ theme }) => theme.spacing.small};
  border-top: 1px solid ${({ theme }) => theme.color.surface.secondary};
  display: flex;
  flex-direction: column;
  gap: 2px;
`;

const RailFooterText = styled.div`
  font-size: 0.6875rem;
  color: ${({ theme }) => theme.color.text.secondary};
`;

/* ── Component ── */

export type StructureRailProps = {
  sectionTitles: string[];
  selectedSection: 'details' | number;
  onSelectDetails: () => void;
  onSelectSection: (idx: number) => void;
  onAddSection: () => void;
  onMoveUp: (idx: number) => void;
  onMoveDown: (idx: number) => void;
  saving: boolean;
  /** Wording for the editor using the rail. Defaults suit a course. */
  detailsLabel?: string;
  sectionsLabel?: string;
  addLabel?: string;
  untitledLabel?: string;
  emptyLabel?: string;
  /** Optional note shown in the footer. */
  footerNote?: string;
};

/**
 * Left navigation rail for any structured content editor. Renders a primary
 * "details" link followed by an ordered, reorderable list of sections, plus an
 * add-section button. Generic enough to use across different editors on the platform.
 */
const StructureRail = ({
  sectionTitles,
  selectedSection,
  onSelectDetails,
  onSelectSection,
  onAddSection,
  onMoveUp,
  onMoveDown,
  saving,
  detailsLabel = 'Course details',
  sectionsLabel = 'Chapters',
  addLabel = 'Add chapter',
  untitledLabel = 'Untitled chapter',
  emptyLabel = 'No chapters yet. Add one below.',
  footerNote = 'Saves are manual — use Save changes above.',
}: StructureRailProps) => (
  <RailPanel>
    <RailTop>
      <RailSectionLabel>Structure</RailSectionLabel>

      <RailNavItem
        type="button"
        $selected={selectedSection === 'details'}
        onClick={onSelectDetails}
      >
        <RailNavItemTitle $selected={selectedSection === 'details'}>
          {detailsLabel}
        </RailNavItemTitle>
      </RailNavItem>

      <RailSectionsMeta>
        <RailMetaLabel>
          {sectionsLabel}
          {sectionTitles.length > 0 && (
            <RailSectionCount> · {sectionTitles.length}</RailSectionCount>
          )}
        </RailMetaLabel>
        <RailHint>Reorder with ↑↓</RailHint>
      </RailSectionsMeta>

      {sectionTitles.length === 0 ? (
        <RailEmptyDashed>{emptyLabel}</RailEmptyDashed>
      ) : (
        sectionTitles.map((title, idx) => (
          <RailNavItem
            key={idx}
            type="button"
            $selected={selectedSection === idx}
            onClick={() => onSelectSection(idx)}
          >
            <RailSectionNum $selected={selectedSection === idx}>
              {String(idx + 1).padStart(2, '0')}
            </RailSectionNum>
            <RailNavItemTitle $selected={selectedSection === idx}>
              {title || <RailUntitled>{untitledLabel}</RailUntitled>}
            </RailNavItemTitle>
            <RailMoveGroup onClick={e => e.stopPropagation()}>
              <RailMoveBtn
                type="button"
                title="Move up"
                disabled={idx === 0}
                onClick={() => idx > 0 && onMoveUp(idx)}
              >
                ↑
              </RailMoveBtn>
              <RailMoveBtn
                type="button"
                title="Move down"
                disabled={idx === sectionTitles.length - 1}
                onClick={() =>
                  idx < sectionTitles.length - 1 && onMoveDown(idx)
                }
              >
                ↓
              </RailMoveBtn>
            </RailMoveGroup>
          </RailNavItem>
        ))
      )}

      <RailAddSectionBtn type="button" onClick={onAddSection} disabled={saving}>
        <RailAddGlyph>+</RailAddGlyph>
        {addLabel}
      </RailAddSectionBtn>
    </RailTop>

    {footerNote && (
      <RailFooter>
        <RailFooterText>{footerNote}</RailFooterText>
      </RailFooter>
    )}
  </RailPanel>
);

export default StructureRail;
