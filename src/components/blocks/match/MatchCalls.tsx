import {
  Checkbox,
  Dropdown,
  Text,
} from '@a-little-world/little-world-design-system';
import { isEmpty } from 'lodash';
import React from 'react';
import { useSearchParams } from 'react-router-dom';
import styled from 'styled-components';
import useSWR from 'swr';

import { dataFetcher } from '../../../store';
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
} from '../videoCalls/videoCallTableShared';
import FiltersToolbar from '../FiltersToolbar';

type MatchCallsProps = {
  match: {
    user1: VideoCallParticipant;
    user2: VideoCallParticipant;
  };
};

const CALL_TYPE_OPTIONS = [
  { value: 'all', label: 'All types' },
  { value: 'standard', label: 'Standard' },
  { value: 'random', label: 'Random call' },
];

const BothActiveCheckbox = styled(Checkbox)`
  margin-bottom: ${({ theme }) => theme.spacing.xxsmall};
`;

function getUserWasActive(call: VideoCall, userId: number) {
  return call.u1.id === userId ? call.u1_was_active : call.u2_was_active;
}

const MatchCalls = ({ match }: MatchCallsProps) => {
  const [searchParams, setSearchParams] = useSearchParams();
  const callType = searchParams.get('call_type') ?? 'all';
  const bothUsersActive = searchParams.get('both_have_been_active') === 'true';

  const apiSearchParams = new URLSearchParams(searchParams);
  apiSearchParams.delete('tab');
  apiSearchParams.set(
    'match_participants',
    `${match.user1.id},${match.user2.id}`,
  );

  const {
    data: calls,
    error,
    isLoading,
  } = useSWR<PaginatedVideoCalls>(
    match ? `/api/matching/video_calls/?${apiSearchParams.toString()}` : null,
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

  return (
    <div className="w-full flex flex-col gap-4">
      <FiltersToolbar
        paginationList={calls}
        isLoading={isLoading}
        loadingText="Loading calls..."
        withoutPadding
      >
        <Dropdown
          id="match_calls_call_type_dropdown"
          label="Type"
          value={callType}
          options={CALL_TYPE_OPTIONS}
          onValueChange={value => updateSearchParam('call_type', value)}
          placeholder="Filter by type..."
          cannotError
          maxWidth="160px"
        />
        <BothActiveCheckbox
          id="match_calls_both_users_active"
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
              {calls?.results.map(call => (
                <TableRow key={call.uuid}>
                  <TableCell>{formatCallType(call)}</TableCell>
                  <TableCell>{call.duration ?? '—'}</TableCell>
                  <TableCell>{formatDateTime(call.created_at)}</TableCell>
                  <TableCell>{formatDateTime(call.end_time)}</TableCell>
                  <TableCell>
                    <ActiveTag
                      active={getUserWasActive(call, match.user1.id)}
                    />
                  </TableCell>
                  <TableCell>
                    <ActiveTag
                      active={getUserWasActive(call, match.user2.id)}
                    />
                  </TableCell>
                  <TableCell>
                    <ActiveTag active={call.both_have_been_active} />
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          )}
        </Table>
      )}
    </div>
  );
};

export default MatchCalls;
