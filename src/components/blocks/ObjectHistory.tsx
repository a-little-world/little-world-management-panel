import { ChevronDownIcon, ChevronUpIcon } from 'lucide-react';
import React, { useState } from 'react';
import styled from 'styled-components';

import { Text } from '@a-little-world/little-world-design-system';
import { BLUE_40, ORANGE_40 } from '../../constants';
import { formatTimeDistance } from '../../helpers/date';
import { Card, CardHeader, CardTitle } from '../atoms/Card';
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

// ─── Local color constants ────────────────────────────────────────────────────

const DIFF_OLD_BG = '#fde8e8';
const DIFF_NEW_BG = '#d4f0de';
const AVATAR_BLUE_BG = '#cfe3f8';
const AVATAR_NEUTRAL_BG = '#e8e8e8';
const AVATAR_NEUTRAL_COLOR = '#888';

// ─── Styled components ────────────────────────────────────────────────────────

export const CollapsibleHeader = styled(CardHeader)`
  flex-direction: row;
  align-items: center;
  justify-content: space-between;
  cursor: pointer;
  user-select: none;
  & > * + * {
    margin-top: 0;
  }
  &:hover {
    background: ${({ theme }) => theme.color.surface.secondary};
  }
`;

const HistoryScroll = styled.div`
  max-height: 480px;
  overflow-y: auto;
  padding: 0 ${({ theme }) => theme.spacing.medium}
    ${({ theme }) => theme.spacing.medium};
`;

const Timeline = styled.ol`
  list-style: none;
  margin: 0;
  padding: 0;
`;

const TimelineItem = styled.li<{ $last: boolean }>`
  display: flex;
  gap: ${({ theme }) => theme.spacing.small};
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
  margin-bottom: ${({ theme }) => theme.spacing.xxsmall};
`;

const DiffRow = styled.div<{ $type: 'old' | 'new' }>`
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 8px 14px;
  background: ${({ $type }) => ($type === 'old' ? DIFF_OLD_BG : DIFF_NEW_BG)};
`;

const ProfileChip = styled.div`
  display: inline-flex;
  align-items: center;
  gap: 6px;
  font-size: 13px;
  font-weight: 600;
  color: ${({ theme }) => theme.color.text.primary};
`;

const ProfileList = styled.div`
  display: flex;
  flex-wrap: wrap;
  gap: ${({ theme }) => theme.spacing.xxsmall};
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

const TimestampRow = styled.div`
  display: flex;
  align-items: center;
  gap: ${({ theme }) => theme.spacing.xxsmall};
`;

const EntryLabel = styled.span`
  font-family: 'Work Sans', system-ui, sans-serif;
  font-size: 11px;
  font-weight: 700;
  letter-spacing: 0.06em;
  text-transform: uppercase;
  color: ${ORANGE_40};
`;

const ChangedField = styled(Text)`
  background: ${({ theme }) => theme.color.surface.secondary};
  font-weight: 600;
  padding: 0 ${({ theme }) => theme.spacing.xxxsmall};
`;

// ─── Helpers ──────────────────────────────────────────────────────────────────

function formatFieldName(field: string, modelType?: string): string {
  if (field === 'status') {
    if (modelType === 'supporttaskaction') return 'Action Status';
    if (modelType === 'supporttask') return 'Task Status';
  }
  return field.replace(/_/g, ' ').replace(/\b\w/g, c => c.toUpperCase());
}

function isUserProfile(value: unknown): value is UserProfile {
  return (
    value !== null &&
    typeof value === 'object' &&
    'first_name' in (value as object) &&
    'second_name' in (value as object)
  );
}

function formatValue(value: unknown): string {
  if (typeof value === 'object') {
    try {
      value = JSON.stringify(value, null, 2);
    } catch (_e) {}
  }
  return String(value);
}

function renderDiffValue(value: unknown): React.ReactNode {
  if (Array.isArray(value) && value.every(isUserProfile)) {
    if (!value.length) {
      return <DiffValue $empty>empty</DiffValue>;
    }
    return (
      <ProfileList>
        {value.map(profile => (
          <ProfileChip key={profile.id}>
            <UserImage
              alt={`${profile.first_name} ${profile.second_name}`}
              user={profile}
              dimensions={{ width: 20, height: 20 }}
            />
            {profile.first_name} {profile.second_name}
          </ProfileChip>
        ))}
      </ProfileList>
    );
  }
  if (isUserProfile(value)) {
    return (
      <ProfileChip>
        <UserImage
          alt={`${value.first_name} ${value.second_name}`}
          user={value}
          dimensions={{ width: 20, height: 20 }}
        />
        {value.first_name} {value.second_name}
      </ProfileChip>
    );
  }
  const str = formatValue(value);
  return <DiffValue $empty={!str}>{str || 'empty'}</DiffValue>;
}

function getInitials(profile: UserProfile): string {
  return `${profile.first_name[0] ?? ''}${profile.second_name[0] ?? ''}`.toUpperCase();
}

// ─── Component ────────────────────────────────────────────────────────────────

interface ObjectHistoryListProps {
  history: ObjectHistory[];
  title?: string;
  labelByModelType?: Record<string, string>;
}

export default function ObjectHistoryList({
  history,
  title = 'History',
  labelByModelType,
}: ObjectHistoryListProps) {
  const [open, setOpen] = useState(true);
  const sorted = [...history].sort(
    (a, b) =>
      new Date(b.changed_at).getTime() - new Date(a.changed_at).getTime(),
  );
  const now = new Date();

  return (
    <Card center={false}>
      <CollapsibleHeader onClick={() => setOpen(o => !o)}>
        <CardTitle>{title}</CardTitle>
        {open ? <ChevronUpIcon size={16} /> : <ChevronDownIcon size={16} />}
      </CollapsibleHeader>
      {open && (
        <HistoryScroll>
          <Timeline>
            {sorted.map((entry, i) => {
              const actor = entry.changed_by_profile;
              const isCreate = entry.type === 'CREATE';
              const isLast = i === sorted.length - 1;

              return (
                <TimelineItem key={entry.id} $last={isLast}>
                  <AvatarSlot>
                    {isCreate ? (
                      <InitialsDot $bg={ORANGE_40} $color="white">
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
                        <InitialsDot $bg={AVATAR_BLUE_BG} $color={BLUE_40}>
                          {getInitials(actor)}
                        </InitialsDot>
                      )
                    ) : (
                      <InitialsDot
                        $bg={AVATAR_NEUTRAL_BG}
                        $color={AVATAR_NEUTRAL_COLOR}
                      >
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
                          <ChangedField>
                            {formatFieldName(entry.field, entry.model_type)}
                          </ChangedField>
                        </EntryHeader>
                        <DiffBlock>
                          <DiffRow $type="old">
                            <DiffSign>−</DiffSign>
                            {renderDiffValue(entry.old_value)}
                          </DiffRow>
                          <DiffRow $type="new">
                            <DiffSign>+</DiffSign>
                            {renderDiffValue(entry.new_value)}
                          </DiffRow>
                        </DiffBlock>
                      </>
                    )}
                    <TimestampRow>
                      <Timestamp>
                        {formatTimeDistance(entry.changed_at, now)}
                      </Timestamp>
                      {labelByModelType?.[entry.model_type] && (
                        <EntryLabel>
                          {labelByModelType[entry.model_type]}
                        </EntryLabel>
                      )}
                    </TimestampRow>
                  </EntryContent>
                </TimelineItem>
              );
            })}
          </Timeline>
        </HistoryScroll>
      )}
    </Card>
  );
}
