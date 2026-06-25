import {
  Checkbox,
  Select,
  Text,
} from '@a-little-world/little-world-design-system';
import { isEmpty } from 'lodash';
import React from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import useSWR from 'swr';

import styled from 'styled-components';
import { dataFetcher } from '../../../store';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '../../atoms/Table';
import FiltersToolbar from '../FiltersToolbar';
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

const CALL_TYPE_OPTIONS = [
  { value: 'all', label: 'All types' },
  { value: 'standard', label: 'Standard' },
  { value: 'random', label: 'Random call' },
];

const BothActiveCheckbox = styled(Checkbox)`
  margin-bottom: ${({ theme }) => theme.spacing.xxsmall};
`;

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
  const [searchParams, setSearchParams] = useSearchParams();
  const callType = searchParams.get('call_type') ?? 'all';
  const bothUsersActive = searchParams.get('both_have_been_active') === 'true';

  const apiSearchParams = new URLSearchParams(searchParams);
  apiSearchParams.delete('tab');
  apiSearchParams.set('user_id', String(user.id));

  const {
    data: calls,
    error,
    isLoading,
  } = useSWR<PaginatedVideoCalls>(
    user ? `/api/matching/video_calls/?${apiSearchParams.toString()}` : null,
    dataFetcher,
  );

  const updateSearchParam = (key: string, value?: string) => {
    const nextParams = new URLSearchParams(searchParams);
    nextParams.delete('page');

    if (!value || value === 'all') {
      nextParams.delete(key);
    } else {
      nextParams.set(key, value);
    }

    setSearchParams(nextParams);
  };

  return (
    <div className="w-full flex flex-col gap-4">
      <FiltersToolbar
        paginationList={calls}
        isLoading={isLoading}
        loadingText="Loading calls..."
        withoutPadding
      >
        <Select
          id="user_calls_call_type_dropdown"
          label="Type"
          value={callType}
          options={CALL_TYPE_OPTIONS}
          onValueChange={value => updateSearchParam('call_type', value)}
          placeholder="Filter by type..."
          cannotError
          maxWidth="160px"
        />
        <BothActiveCheckbox
          id="user_calls_both_users_active"
          label="Both users active"
          checked={bothUsersActive}
          onCheckedChange={(checked: boolean) =>
            updateSearchParam(
              'both_have_been_active',
              checked ? 'true' : undefined,
            )
          }
          required={false}
        />
      </FiltersToolbar>

      {error ? (
        <Text className="p-4 w-full" center>
          Error loading video calls
        </Text>
      ) : isLoading ? (
        <Text className="p-4 w-full" center>
          Loading...
        </Text>
      ) : (
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
            <TableBody>
              <TableRow>
                <TableCell colSpan={fields.length}>
                  <Text center>No results.</Text>
                </TableCell>
              </TableRow>
            </TableBody>
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
      )}
    </div>
  );
};

export default UserCalls;
