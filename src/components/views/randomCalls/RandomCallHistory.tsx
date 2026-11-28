import {
  Loading,
  LoadingSizes,
  Text,
} from '@a-little-world/little-world-design-system';
import React from 'react';
import { useSearchParams } from 'react-router-dom';
import styled from 'styled-components';
import useSWR from 'swr';

import {
  getLobbyInstanceEndpoint,
  LobbyHistoryItem,
  LobbyInstanceData,
  RANDOM_CALL_LOBBY_HISTORY_ENDPOINT,
  TasksData,
} from '../../../api/randomCalls';
import { formatDate, formatEventTime } from '../../../helpers/date';
import {
  AudienceSegment,
  formatSuccessfulCallUserPct,
  proposalPairBreakdown,
  usersWithoutSuccessfulCall,
} from '../../../helpers/randomCallStats';
import { dataFetcher } from '../../../store';
import { ListScroll, PageContainer } from '../../atoms/PageLayout';
import Stat, { StatCards } from '../../atoms/stats/Stat';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '../../atoms/Table';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../../atoms/Tabs';
import LobbyParticipantsTable from '../../blocks/randomCalls/LobbyParticipantsTable';
import MatchProposalsTable from '../../blocks/randomCalls/MatchProposalsTable';
import {
  Description,
  ProvisionalBucketStats,
  Section,
  SectionTitle,
  StatsGridTight,
  Title,
} from './RandomCalls.styles';

const HistoryList = styled(ListScroll)`
  max-height: 22rem;
  overflow: auto;
  margin-bottom: ${({ theme }) => theme.spacing.medium};
`;

const ViewButton = styled.button`
  background: none;
  border: none;
  color: ${({ theme }) => theme.color.text.link};
  cursor: pointer;
  font-weight: 500;
  padding: 0;
  white-space: nowrap;

  &:hover {
    text-decoration: underline;
  }
`;

function RandomCallHistory() {
  const [searchParams, setSearchParams] = useSearchParams();
  const selectedLobbyUuid = searchParams.get('lobby_uuid');

  const { data: allLobbies, error: listError } = useSWR<LobbyHistoryItem[]>(
    RANDOM_CALL_LOBBY_HISTORY_ENDPOINT,
    dataFetcher,
  );

  // Fetch lobby overview data when a lobby is selected
  const selectedLobby =
    allLobbies?.find(lobby => lobby.uuid === selectedLobbyUuid) ?? null;
  const selectedLobbyName = selectedLobby?.name ?? null;
  const segment: AudienceSegment = selectedLobby?.is_external_session
    ? 'external'
    : 'standard';

  const { data: lobbyData, error: lobbyError } = useSWR<LobbyInstanceData>(
    selectedLobbyName && selectedLobbyUuid
      ? getLobbyInstanceEndpoint(selectedLobbyName, selectedLobbyUuid)
      : null,
    dataFetcher,
  );

  // Fetch tasks for this specific lobby instance (pass lobby_uuid to scope tasks)
  const { data: tasksData } = useSWR<TasksData>(
    selectedLobbyName && selectedLobbyUuid
      ? `/api/random_calls/lobby/${encodeURIComponent(selectedLobbyName)}/management/tasks?lobby_uuid=${encodeURIComponent(selectedLobbyUuid)}`
      : null,
    dataFetcher,
  );

  const handleLobbyChange = (value: string) => {
    const nextParams = new URLSearchParams(searchParams);
    nextParams.set('tab', 'history');
    if (value) {
      nextParams.set('lobby_uuid', value);
    } else {
      nextParams.delete('lobby_uuid');
    }
    setSearchParams(nextParams);
  };

  const { lobby, snapshot, proposal_statistics } = lobbyData || {};
  const proposalsAreFinal = snapshot?.proposals_are_final ?? !lobby?.is_active;
  const match_proposals = lobbyData?.match_proposals || {
    pending: [],
    accepted: [],
    rejected: [],
    expired: [],
  };
  const lobby_participants = lobbyData?.lobby_participants || [];

  return (
    <PageContainer>
      <Title>Random Call History</Title>
      <Description>
        Sessions that have ended, standard and external. Open a row to see its
        details.
      </Description>

      {listError && <Text color="error">Could not load the session list.</Text>}
      {!allLobbies && !listError && <Loading size={LoadingSizes.Medium} />}
      {allLobbies && allLobbies.length === 0 && (
        <Text color="secondary">No sessions yet.</Text>
      )}
      {allLobbies && allLobbies.length > 0 && (
        <HistoryList>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Date</TableHead>
                <TableHead>Time</TableHead>
                <TableHead>Session Type</TableHead>
                <TableHead>Company</TableHead>
                <TableHead />
              </TableRow>
            </TableHeader>
            <TableBody>
              {allLobbies.map(lobbyItem => {
                const start = lobbyItem.start_time
                  ? new Date(lobbyItem.start_time)
                  : null;
                const end = lobbyItem.end_time
                  ? new Date(lobbyItem.end_time)
                  : start;
                return (
                  <TableRow key={lobbyItem.uuid}>
                    <TableCell>
                      {start
                        ? formatDate(start, 'EEEE, d MMMM yyyy', 'de')
                        : '—'}
                    </TableCell>
                    <TableCell>
                      {start && end ? formatEventTime(start, end) : '—'}
                    </TableCell>
                    <TableCell>{lobbyItem.session_type}</TableCell>
                    <TableCell>{lobbyItem.company_name ?? '—'}</TableCell>
                    <TableCell>
                      <ViewButton
                        type="button"
                        onClick={() => handleLobbyChange(lobbyItem.uuid)}
                      >
                        {lobbyItem.uuid === selectedLobbyUuid
                          ? 'Viewing'
                          : 'View'}
                      </ViewButton>
                    </TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
        </HistoryList>
      )}

      {!selectedLobbyUuid && allLobbies && allLobbies.length > 0 && (
        <Text color="secondary">
          Select a session from the list to view its details.
        </Text>
      )}

      {selectedLobbyUuid && !lobbyData && !lobbyError && (
        <Loading size={LoadingSizes.Medium} />
      )}

      {lobbyError && (
        <Text color="error">
          Error loading lobby data: {lobbyError.message}
        </Text>
      )}

      {lobbyData && lobby && proposal_statistics && (
        <>
          {snapshot && (
            <Section>
              <SectionTitle>Overview</SectionTitle>
              <StatsGridTight>
                <Stat
                  label="Total Users"
                  stat={snapshot.total_users}
                  breakdown={[
                    {
                      label: 'First time',
                      value: snapshot.first_time_users,
                    },
                    {
                      label: 'Returning',
                      value: snapshot.returning_users,
                    },
                  ]}
                />
                {segment === 'external' && (
                  <Stat
                    label="Participants"
                    stat={snapshot.learner_count + snapshot.volunteer_count}
                    breakdown={[
                      { label: 'Learners', value: snapshot.learner_count },
                      {
                        label: 'External participants',
                        value: snapshot.volunteer_count,
                      },
                    ]}
                  />
                )}
                <Stat label="Total Calls" stat={snapshot.completed_calls} />
                <Stat
                  label="Users with successful call"
                  stat={formatSuccessfulCallUserPct(snapshot)}
                  breakdown={[
                    {
                      label: 'With call',
                      value: snapshot.users_with_successful_calls,
                    },
                    {
                      label: 'Without call',
                      value: usersWithoutSuccessfulCall(snapshot),
                    },
                  ]}
                />
                {proposalsAreFinal && (
                  <Stat
                    label="Accepted Proposals"
                    stat={snapshot.proposals_accepted}
                  />
                )}
              </StatsGridTight>
            </Section>
          )}

          <Section>
            <SectionTitle>
              {proposalsAreFinal
                ? 'Proposal statistics'
                : 'Live proposal statistics'}
            </SectionTitle>
            {!proposalsAreFinal && (
              <Description>
                Operational counts — persisted bucket totals finalize when the
                lobby ends.
              </Description>
            )}
            {lobby.is_active && (
              <StatsGridTight>
                <Stat label="Active Users" stat={lobby.active_users_count} />
                <Stat label="Total Users" stat={lobby.total_users_count} />
              </StatsGridTight>
            )}
            <ProvisionalBucketStats $provisional={!proposalsAreFinal}>
              <StatCards>
                <Stat
                  label="Accepted Proposals"
                  stat={proposal_statistics.accepted_count}
                  breakdown={proposalPairBreakdown(
                    proposal_statistics,
                    'accepted',
                    segment,
                  )}
                />
                <Stat
                  label="Rejected Proposals"
                  stat={proposal_statistics.rejected_count}
                  breakdown={proposalPairBreakdown(
                    proposal_statistics,
                    'rejected',
                    segment,
                  )}
                />
                <Stat
                  label="Expired Proposals"
                  stat={proposal_statistics.expired_count}
                  breakdown={proposalPairBreakdown(
                    proposal_statistics,
                    'expired',
                    segment,
                  )}
                />
              </StatCards>
            </ProvisionalBucketStats>
          </Section>

          {/* Lobby Participants */}
          <Section>
            <SectionTitle>Lobby Participants</SectionTitle>
            <LobbyParticipantsTable
              participants={lobby_participants}
              showStatus={false}
              segment={segment}
            />
          </Section>

          {/* Proposals */}
          <Section>
            <SectionTitle>Proposals</SectionTitle>
            <Tabs defaultValue="accepted">
              <TabsList className="grid w-full grid-cols-3">
                <TabsTrigger value="accepted">
                  Accepted ({proposal_statistics.accepted_count})
                </TabsTrigger>
                <TabsTrigger value="rejected">
                  Rejected ({proposal_statistics.rejected_count})
                </TabsTrigger>
                <TabsTrigger value="expired">
                  Expired ({proposal_statistics.expired_count})
                </TabsTrigger>
              </TabsList>

              <TabsContent value="accepted">
                <MatchProposalsTable
                  matches={match_proposals.accepted}
                  showCompletedColumn
                  segment={segment}
                />
              </TabsContent>
              <TabsContent value="rejected">
                <MatchProposalsTable
                  matches={match_proposals.rejected}
                  segment={segment}
                />
              </TabsContent>
              <TabsContent value="expired">
                <MatchProposalsTable
                  matches={match_proposals.expired}
                  segment={segment}
                />
              </TabsContent>
            </Tabs>
          </Section>

          {/* Celery Tasks */}
          {tasksData && (
            <Section>
              <SectionTitle>Celery Tasks</SectionTitle>
              <StatCards>
                <Stat label="Total Tasks" stat={tasksData.statistics.total} />
                <Stat label="Successful" stat={tasksData.statistics.success} />
                <Stat label="Failed" stat={tasksData.statistics.failure} />
                <Stat label="Pending" stat={tasksData.statistics.pending} />
              </StatCards>
            </Section>
          )}
        </>
      )}
    </PageContainer>
  );
}

export default RandomCallHistory;
