import {
  Tag,
  TagAppearance,
  TagSizes,
  Text,
  TextTypes,
} from '@a-little-world/little-world-design-system';
import React from 'react';

import { formatDate, formatTime } from '../../../helpers/date';

export type VideoCallParticipant = {
  id: number;
  uuid: string;
  email: string;
  profile: {
    first_name: string;
    second_name: string;
  };
};

export type VideoCall = {
  uuid: string;
  created_at: string;
  end_time: string | null;
  duration: string | null;
  call_type: 'random' | 'standard';
  random_call_session: boolean;
  both_have_been_active: boolean;
  u1_was_active: boolean;
  u2_was_active: boolean;
  u1: VideoCallParticipant;
  u2: VideoCallParticipant;
};

export type PaginatedVideoCalls = {
  count: number;
  page: number;
  previous_page: number | null;
  next_page: number | null;
  last_page: number;
  results: VideoCall[];
};

export function participantName(participant: VideoCallParticipant) {
  return `${participant.profile.first_name} ${participant.profile.second_name}`;
}

export function ActiveTag({ active }: { active: boolean }) {
  return (
    <Tag
      appearance={active ? TagAppearance.success : TagAppearance.error}
      size={TagSizes.small}
    >
      {active ? 'Yes' : 'No'}
    </Tag>
  );
}

export function formatDateTime(value: string | null) {
  if (!value) return '—';
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return '—';
  return (
    <>
      <Text tag="span" type={TextTypes.Body5}>
        {formatDate(date, 'P')}{' '}
      </Text>
      <Text tag="span" type={TextTypes.Body5}>
        {formatTime(date)}
      </Text>
    </>
  );
}

export function formatCallType(call: VideoCall) {
  return call.call_type === 'random' ? 'Random call' : 'Standard';
}
