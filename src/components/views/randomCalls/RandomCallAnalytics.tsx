import {
  Loading,
  LoadingSizes,
  Select,
  StatusMessage,
  StatusTypes,
  Text,
  TextTypes,
} from '@a-little-world/little-world-design-system';
import { format } from 'date-fns';
import React from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import styled from 'styled-components';
import useSWR from 'swr';

import {
  displaySnapshotProposalsTotal,
  fetchLobbyAnalytics,
  RANDOM_CALL_LOBBY_ANALYTICS_ENDPOINT,
} from '../../../api/randomCalls';
import { formatEventTime } from '../../../helpers/date';
import { DatePicker } from '../../atoms/DatePicker';
import {
  ListPanel,
  ListScroll,
  NoResultsContainer,
  PageContainer,
} from '../../atoms/PageLayout';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '../../atoms/Table';
import { FiltersToolbar } from '../../blocks/FiltersToolbar';
import { Description, Title } from './RandomCalls.styles';

const InstanceLink = styled(Link)`
  color: ${({ theme }) => theme.color.text.link};
  font-weight: 500;
  text-decoration: none;
  white-space: nowrap;

  &:hover {
    text-decoration: underline;
  }
`;

const ORDERING_OPTIONS = [
  { label: 'Newest first', value: '-start_time' },
  { label: 'Oldest first', value: 'start_time' },
  { label: 'Most users', value: '-total_users' },
  { label: 'Most proposals', value: '-proposals_total' },
  { label: 'Most accepted proposals', value: '-proposals_accepted' },
  { label: 'Most completed calls', value: '-completed_calls' },
];

function parseDateParam(value: string | null): Date | null {
  if (!value) return null;
  const parsed = new Date(`${value}T00:00:00`);
  return Number.isNaN(parsed.getTime()) ? null : parsed;
}

function formatTimeRange(start: string | null, end: string | null) {
  if (!start || !end) return '—';
  return formatEventTime(new Date(start), new Date(end));
}

function RandomCallAnalytics() {
  const [searchParams, setSearchParams] = useSearchParams({
    page_size: '25',
    ordering: '-start_time',
    lobby_name: 'default',
  });

  const ordering = searchParams.get('ordering') || '-start_time';
  const fromDate = parseDateParam(searchParams.get('from'));
  const toDate = parseDateParam(searchParams.get('to'));

  const { data, error, isLoading } = useSWR(
    [RANDOM_CALL_LOBBY_ANALYTICS_ENDPOINT, searchParams.toString()] as const,
    ([, queryString]) => fetchLobbyAnalytics(queryString),
    { revalidateOnFocus: true, revalidateOnMount: true },
  );

  const updateSearchParam = (key: string, value?: string) => {
    const nextParams = new URLSearchParams(searchParams);
    nextParams.delete('page');
    if (!value) {
      nextParams.delete(key);
    } else {
      nextParams.set(key, value);
    }
    setSearchParams(nextParams);
  };

  const onDateChange = (key: 'from' | 'to', value: Date | null) => {
    updateSearchParam(key, value ? format(value, 'yyyy-MM-dd') : '');
  };

  const instanceHistorySearch = (lobbyUuid: string) => {
    const params = new URLSearchParams();
    params.set('tab', 'history');
    params.set('lobby_uuid', lobbyUuid);
    return `?${params.toString()}`;
  };

  return (
    <PageContainer>
      <Title>Analytics</Title>
      <Description>
        Paginated snapshot of each random call lobby instance.
      </Description>

      <FiltersToolbar
        paginationList={data}
        isLoading={isLoading}
        loadingText="Loading lobby analytics..."
        showPageSizeDropdown
        showPagination
      >
        <Select
          id="lobby-analytics-ordering"
          label="Sort by"
          value={ordering}
          options={ORDERING_OPTIONS}
          onValueChange={val => updateSearchParam('ordering', val)}
          cannotError
          maxWidth="220px"
        />
        <DatePicker
          label="From"
          date={fromDate}
          setDate={date => onDateChange('from', date)}
        />
        <DatePicker
          label="To"
          date={toDate}
          setDate={date => onDateChange('to', date)}
        />
      </FiltersToolbar>

      {error && (
        <StatusMessage type={StatusTypes.Error} visible>
          Failed to load lobby analytics.
        </StatusMessage>
      )}

      {isLoading && !data && <Loading size={LoadingSizes.Medium} />}

      {data && (
        <ListPanel>
          <ListScroll>
            {data.results.length === 0 ? (
              <NoResultsContainer>
                <Text type={TextTypes.Body3}>No lobby instances found.</Text>
              </NoResultsContainer>
            ) : (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Date</TableHead>
                    <TableHead>Day</TableHead>
                    <TableHead>Time</TableHead>
                    <TableHead>Users</TableHead>
                    <TableHead>First / returning</TableHead>
                    <TableHead>Proposals</TableHead>
                    <TableHead>Accepted</TableHead>
                    <TableHead>Rejected</TableHead>
                    <TableHead>Expired</TableHead>
                    <TableHead>Completed calls</TableHead>
                    <TableHead>Learners</TableHead>
                    <TableHead>Volunteers</TableHead>
                    <TableHead />
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {data.results.map(row => (
                    <TableRow key={row.lobby_uuid}>
                      <TableCell>{row.date ?? '—'}</TableCell>
                      <TableCell>{row.day ?? '—'}</TableCell>
                      <TableCell>
                        {formatTimeRange(row.start_time, row.end_time)}
                      </TableCell>
                      <TableCell>{row.total_users}</TableCell>
                      <TableCell>
                        {row.first_time_users} / {row.returning_users}
                      </TableCell>
                      <TableCell>
                        {displaySnapshotProposalsTotal(row)}
                      </TableCell>
                      <TableCell>{row.proposals_accepted}</TableCell>
                      <TableCell>{row.proposals_rejected}</TableCell>
                      <TableCell>{row.proposals_expired}</TableCell>
                      <TableCell>{row.completed_calls}</TableCell>
                      <TableCell>{row.learner_count}</TableCell>
                      <TableCell>{row.volunteer_count}</TableCell>
                      <TableCell>
                        <InstanceLink
                          to={instanceHistorySearch(row.lobby_uuid)}
                        >
                          View Session
                        </InstanceLink>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            )}
          </ListScroll>
        </ListPanel>
      )}
    </PageContainer>
  );
}

export default RandomCallAnalytics;
