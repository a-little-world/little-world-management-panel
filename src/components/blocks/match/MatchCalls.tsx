import { Text } from '@a-little-world/little-world-design-system';
import { isEmpty } from 'lodash';
import React from 'react';
import { createSearchParams, useSearchParams } from 'react-router-dom';
import useSWR from 'swr';

import { dataFetcher } from '../../../store';
import Pagination from '../../atoms/Pagination';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '../../atoms/Table';
import {
  ActiveTag,
  PaginatedVideoCalls,
  VideoCall,
  VideoCallParticipant,
  formatCallType,
  formatDateTime,
  participantName,
} from '../videoCalls/videoCallTableShared';

type MatchCallsProps = {
  match: {
    user1: VideoCallParticipant;
    user2: VideoCallParticipant;
  };
};

function getUserWasActive(call: VideoCall, userId: number) {
  return call.u1.id === userId ? call.u1_was_active : call.u2_was_active;
}

const MatchCalls = ({ match }: MatchCallsProps) => {
  const [searchParams] = useSearchParams();
  const {
    data: calls,
    error,
    isLoading,
  } = useSWR<PaginatedVideoCalls>(
    match
      ? `/api/matching/video_calls/?match_participants=${match.user1.id},${match.user2.id}&${createSearchParams(searchParams)}`
      : null,
    dataFetcher,
  );

  const fields = [
    { key: 'type', label: 'Type' },
    { key: 'duration', label: 'Duration' },
    { key: 'start', label: 'Start' },
    { key: 'end', label: 'End' },
    {
      key: 'user1_was_active',
      label: `${match.user1.profile.first_name} active`,
    },
    {
      key: 'user2_was_active',
      label: `${match.user2.profile.first_name} active`,
    },
    { key: 'both_have_been_active', label: 'Both active' },
  ] as const;

  if (error) {
    return (
      <Text className="p-4 w-full" center>
        Error loading video calls
      </Text>
    );
  }

  if (isLoading) {
    return (
      <Text className="p-4 w-full" center>
        Loading...
      </Text>
    );
  }

  return (
    <div className="w-full flex flex-col gap-4">
      <Table>
        <TableHeader>
          <TableRow>
            {fields.map(({ key, label }) => (
              <TableHead key={key} className="w-[100px]">
                {label}
              </TableHead>
            ))}
          </TableRow>
        </TableHeader>
        {isEmpty(calls?.results) ? (
          <Text className="p-4 w-full" center>
            No results.
          </Text>
        ) : (
          <TableBody>
            {calls?.results.map(call => (
              <TableRow key={call.uuid}>
                <TableCell>{formatCallType(call)}</TableCell>
                <TableCell>{call.duration ?? '—'}</TableCell>
                <TableCell>{formatDateTime(call.created_at)}</TableCell>
                <TableCell>{formatDateTime(call.end_time)}</TableCell>
                <TableCell>
                  <ActiveTag active={getUserWasActive(call, match.user1.id)} />
                </TableCell>
                <TableCell>
                  <ActiveTag active={getUserWasActive(call, match.user2.id)} />
                </TableCell>
                <TableCell>
                  <ActiveTag active={call.both_have_been_active} />
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        )}
      </Table>
      <Pagination list={calls} />
    </div>
  );
};

export default MatchCalls;
