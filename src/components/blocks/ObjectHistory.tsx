import { Tag, TagAppearance, TagSizes } from '@a-little-world/little-world-design-system';
import React from 'react';
import styled from 'styled-components';

import { formatTimeDistance } from '../../helpers/date';
import UserImage from '../atoms/UserImage';

// ─── Types (moved from api/supportTasks.ts) ───────────────────────────────────

export interface UserProfile {
  id: number;
  first_name: string;
  second_name: string;
  image: string | null;
  avatar_config: Record<string, unknown>;
  image_type: 'image' | 'avatar';
}

export type ObjectHistoryType = 'CREATE' | 'UPDATE';

export interface ObjectHistory {
  id: number;
  model_type: string;
  changed_by_profile: UserProfile | null;
  changed_at: string;
  type: ObjectHistoryType;
  field: string;
  old_value: unknown;
  new_value: unknown;
}

// ─── Styled components ────────────────────────────────────────────────────────

const ORANGE_40 = '#db590b';
const BLUE_40 = '#0063af';

const Wrapper = styled.div`
  display: flex;
  flex-direction: column;
`;

const Title = styled.h3`
  font-family: 'Work Sans', system-ui, sans-serif;
  font-weight: 700;
  font-size: 20px;
  color: ${ORANGE_40};
  margin: 0 0 20px;
`;

const Timeline = styled.ol`
  list-style: none;
  margin: 0;
  padding: 0;
`;

const TimelineItem = styled.li<{ $last: boolean }>`
  display: flex;
  gap: 16px;
  position: relative;

  &:not(:last-child) {
    padding-bottom: 28px;
  }
`;

const AvatarSlot = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  flex-shrink: 0;
  position: relative;
  width: 36px;

  li:not(:last-child) & {
    &::after {
      content: '';
      position: absolute;
      top: 36px;
      bottom: -28px;
      left: 50%;
      transform: translateX(-50%);
      width: 2px;
      background: ${({ theme }) => theme.color.border.subtle};
    }
  }
`;

const InitialsDot = styled.div<{ $bg: string; $color: string }>`
  width: 36px;
  height: 36px;
  border-radius: ${({ theme }) => theme.radius.full};
  background: ${({ $bg }) => $bg};
  color: ${({ $color }) => $color};
  display: inline-flex;
  align-items: center;
  justify-content: center;
  font-size: 14px;
  font-weight: 700;
  font-family: 'Work Sans', system-ui, sans-serif;
  flex-shrink: 0;
  user-select: none;
`;

const EntryContent = styled.div`
  flex: 1;
  min-width: 0;
  padding-top: 6px;
`;

const EntryHeader = styled.div`
  font-size: 14px;
  color: ${({ theme }) => theme.color.text.primary};
  display: flex;
  align-items: center;
  flex-wrap: wrap;
  gap: 6px;
  margin-bottom: 10px;
  line-height: 1.4;
`;

const ActorName = styled.span`
  font-weight: 700;
`;

const DiffBlock = styled.div`
  display: flex;
  flex-direction: column;
  border-radius: ${({ theme }) => theme.radius.small};
  overflow: hidden;
  margin-bottom: 8px;
`;

const DiffRow = styled.div<{ $type: 'old' | 'new' }>`
  display: flex;
  align-items: baseline;
  gap: 10px;
  padding: 8px 14px;
  background: ${({ $type }) =>
    $type === 'old' ? '#fde8e8' : '#d4f0de'};
`;

const DiffSign = styled.span`
  font-family: source-code-pro, Menlo, Monaco, monospace;
  font-size: 14px;
  font-weight: 700;
  color: ${({ theme }) => theme.color.text.secondary};
  flex-shrink: 0;
`;

const DiffValue = styled.span<{ $empty: boolean }>`
  font-family: source-code-pro, Menlo, Monaco, monospace;
  font-size: 13px;
  color: ${({ $empty, theme }) =>
    $empty ? theme.color.text.tertiary : theme.color.text.primary};
  font-style: ${({ $empty }) => ($empty ? 'italic' : 'normal')};
`;

const Timestamp = styled.div`
  font-size: 12px;
  color: ${({ theme }) => theme.color.text.tertiary};
`;

// ─── Helpers ──────────────────────────────────────────────────────────────────

function formatFieldName(field: string): string {
  return field
    .replace(/_/g, ' ')
    .replace(/\b\w/g, c => c.toUpperCase());
}

function formatValue(value: unknown): string {
  if (value === null || value === undefined || value === '') return '';
  return String(value);
}

function getInitials(profile: UserProfile): string {
  return `${profile.first_name[0] ?? ''}${profile.second_name[0] ?? ''}`.toUpperCase();
}

// ─── Component ────────────────────────────────────────────────────────────────

interface ObjectHistoryListProps {
  history: ObjectHistory[];
  title?: string;
}

export default function ObjectHistoryList({
  history,
  title = 'History',
}: ObjectHistoryListProps) {
  const sorted = [...history].sort(
    (a, b) => new Date(b.changed_at).getTime() - new Date(a.changed_at).getTime(),
  );
  const now = new Date();

  return (
    <Wrapper>
      <Title>{title}</Title>
      <Timeline>
        {sorted.map((entry, i) => {
          const actor = entry.changed_by_profile;
          const isCreate = entry.type === 'CREATE';
          const isLast = i === sorted.length - 1;

          return (
            <TimelineItem key={entry.id} $last={isLast}>
              <AvatarSlot>
                {isCreate ? (
                  <InitialsDot $bg={ORANGE_40} $color="#fff">
                    +
                  </InitialsDot>
                ) : actor ? (
                  actor.image_type === 'image' && actor.image ? (
                    <UserImage
                      alt={`${actor.first_name} ${actor.second_name}`}
                      user={actor}
                      dimensions={{ width: 36, height: 36 }}
                    />
                  ) : (
                    <InitialsDot $bg="#cfe3f8" $color={BLUE_40}>
                      {getInitials(actor)}
                    </InitialsDot>
                  )
                ) : (
                  <InitialsDot $bg="#e8e8e8" $color="#888">
                    ·
                  </InitialsDot>
                )}
              </AvatarSlot>

              <EntryContent>
                {isCreate ? (
                  <EntryHeader>
                    {actor ? (
                      <ActorName>
                        {actor.first_name} {actor.second_name}
                      </ActorName>
                    ) : (
                      <ActorName>System</ActorName>
                    )}
                    created this task
                  </EntryHeader>
                ) : (
                  <>
                    <EntryHeader>
                      {actor ? (
                        <ActorName>
                          {actor.first_name} {actor.second_name}
                        </ActorName>
                      ) : (
                        <ActorName>System</ActorName>
                      )}
                      changed
                      <Tag
                        bold
                        size={TagSizes.small}
                        appearance={TagAppearance.outline}
                        color={BLUE_40}
                      >
                        {formatFieldName(entry.field)}
                      </Tag>
                    </EntryHeader>
                    <DiffBlock>
                      <DiffRow $type="old">
                        <DiffSign>−</DiffSign>
                        <DiffValue $empty={!formatValue(entry.old_value)}>
                          {formatValue(entry.old_value) || 'empty'}
                        </DiffValue>
                      </DiffRow>
                      <DiffRow $type="new">
                        <DiffSign>+</DiffSign>
                        <DiffValue $empty={!formatValue(entry.new_value)}>
                          {formatValue(entry.new_value) || 'empty'}
                        </DiffValue>
                      </DiffRow>
                    </DiffBlock>
                  </>
                )}
                <Timestamp>{formatTimeDistance(entry.changed_at, now)}</Timestamp>
              </EntryContent>
            </TimelineItem>
          );
        })}
      </Timeline>
    </Wrapper>
  );
}
