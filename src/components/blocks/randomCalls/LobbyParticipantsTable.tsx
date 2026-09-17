import {
  Tag,
  TagAppearance,
  TagSizes,
  Text,
  TextTypes,
} from '@a-little-world/little-world-design-system';
import { isEmpty } from 'lodash';
import React from 'react';
import { Link } from 'react-router-dom';
import styled from 'styled-components';

import { LobbyParticipant } from '../../../api/randomCalls';
import { formatDateTime, formatDurationSeconds } from '../../../helpers/date';
import UserImage from '../../atoms/UserImage';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '../../atoms/Table';

const UserLink = styled(Link)`
  display: inline-flex;
  align-items: center;
  gap: ${({ theme }) => theme.spacing.xxsmall};
`;

interface LobbyParticipantsTableProps {
  participants: LobbyParticipant[];
  showStatus?: boolean;
  emptyMessage?: string;
}

export default function LobbyParticipantsTable({
  participants,
  showStatus = true,
  emptyMessage = 'No participants in this lobby.',
}: LobbyParticipantsTableProps) {
  if (isEmpty(participants)) {
    return (
      <Text className="p-4 w-full" center>
        {emptyMessage}
      </Text>
    );
  }

  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead>User</TableHead>
          <TableHead>Type</TableHead>
          {showStatus && <TableHead>Status</TableHead>}
          <TableHead>First joined</TableHead>
          <TableHead>Completed Calls</TableHead>
          <TableHead>Successful</TableHead>
          <TableHead>Longest Call</TableHead>
          <TableHead>Accepted Proposals</TableHead>
          <TableHead>Unsuccessful Proposals</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {participants.map(participant => (
          <TableRow key={participant.user_uuid}>
            <TableCell>
              <UserLink to={`/user/${participant.user_id}`}>
                <UserImage
                  alt={participant.user_name}
                  user={participant.profile}
                  dimensions={{
                    height: 32,
                    width: 32,
                  }}
                />
                <Text type={TextTypes.Body6} tag="span">
                  {participant.user_name}
                </Text>
              </UserLink>
            </TableCell>
            <TableCell>{participant.user_type ?? '—'}</TableCell>
            {showStatus && (
              <TableCell>
                <Tag
                  appearance={
                    participant.is_active
                      ? TagAppearance.success
                      : TagAppearance.outline
                  }
                  size={TagSizes.small}
                >
                  {participant.is_active ? 'Active' : 'Inactive'}
                </Tag>
              </TableCell>
            )}
            <TableCell>
              {formatDateTime(participant.first_joined_at, 'en')}
            </TableCell>
            <TableCell>{participant.completed_calls}</TableCell>
            <TableCell>{participant.successful_calls}</TableCell>
            <TableCell>
              {formatDurationSeconds(participant.longest_call_duration_seconds)}
            </TableCell>
            <TableCell>{participant.accepted_proposals}</TableCell>
            <TableCell>{participant.unsuccessful_proposals}</TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  );
}
