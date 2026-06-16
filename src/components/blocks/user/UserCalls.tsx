import { Text } from '@a-little-world/little-world-design-system';
import { isEmpty } from 'lodash';
import React from 'react';
import { Link, createSearchParams, useSearchParams } from 'react-router-dom';
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
  formatCallType,
  formatDateTime,
  participantName,
} from '../videoCalls/videoCallTableShared';

const fields = [
  { key: 'participant', label: 'Participant' },
  { key: 'call_type', label: 'Type' },
  { key: 'duration', label: 'Duration' },
  { key: 'start', label: 'Start' },
  { key: 'end', label: 'End' },
  { key: 'user_was_active', label: 'User active' },
  { key: 'participant_was_active', label: 'Partner Active' },
  { key: 'both_have_been_active', label: 'Both active' },
] as const;

function getOtherParticipant(call: VideoCall, userId: number) {
  return call.u1.id === userId ? call.u2 : call.u1;
}

function getUserWasActive(call: VideoCall, userId: number) {
  return call.u1.id === userId ? call.u1_was_active : call.u2_was_active;
}

function getParticipantWasActive(call: VideoCall, userId: number) {
  return call.u1.id === userId ? call.u2_was_active : call.u1_was_active;
}

const UserCalls = ({ user }: { user: { id: number } }) => {
  const [searchParams] = useSearchParams();
  const {
    data: calls,
    error,
    isLoading,
  } = useSWR<PaginatedVideoCalls>(
    user
      ? `/api/matching/video_calls/?user_id=${user.id}&${createSearchParams(searchParams)}`
      : null,
    dataFetcher,
  );

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
            {calls?.results.map(call => {
              const participant = getOtherParticipant(call, user.id);

              return (
                <TableRow key={call.uuid}>
                  <TableCell>
                    <Link to={`/user/${participant.id}`}>
                      {participantName(participant)}
                    </Link>
                  </TableCell>
                  <TableCell>{formatCallType(call)}</TableCell>
                  <TableCell>{call.duration ?? '—'}</TableCell>
                  <TableCell>{formatDateTime(call.created_at)}</TableCell>
                  <TableCell>{formatDateTime(call.end_time)}</TableCell>
                  <TableCell>
                    <ActiveTag active={getUserWasActive(call, user.id)} />
                  </TableCell>
                  <TableCell>
                    <ActiveTag
                      active={getParticipantWasActive(call, user.id)}
                    />
                  </TableCell>
                  <TableCell>
                    <ActiveTag active={call.both_have_been_active} />
                  </TableCell>
                </TableRow>
              );
            })}
          </TableBody>
        )}
      </Table>
      <Pagination list={calls} />
    </div>
  );
};

export default UserCalls;
