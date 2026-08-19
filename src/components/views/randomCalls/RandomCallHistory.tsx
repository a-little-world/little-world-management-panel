import {
  Loading,
  LoadingSizes,
  Select,
  Text,
} from '@a-little-world/little-world-design-system';
import { isEmpty } from 'lodash';
import React, { useEffect, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import useSWR from 'swr';

import {
  getAllLobbies,
  getLobbyInstanceEndpoint,
  LobbyInstanceData,
  LobbyListItem,
  TasksData,
} from '../../../api/randomCalls';
import { formatDate, formatEventTime } from '../../../helpers/date';
import { dataFetcher } from '../../../store';
import { PageContainer } from '../../atoms/PageLayout';
import {
  BreakdownLabel,
  BreakdownList,
  BreakdownRow,
  BreakdownValue,
  StatCard,
  StatCards,
  StatLabel,
  StatValue,
} from '../../atoms/stats/StatCard';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../../atoms/Tabs';
import LobbyParticipantsTable from '../../blocks/randomCalls/LobbyParticipantsTable';
import MatchProposalsTable from '../../blocks/randomCalls/MatchProposalsTable';
import {
  Description,
  DropdownContainer,
  ProvisionalBucketStats,
  Section,
  SectionTitle,
  StatsGridTight,
  Title,
} from './RandomCalls.styles';

function RandomCallHistory() {
  const [searchParams, setSearchParams] = useSearchParams();
  const selectedLobbyUuid = searchParams.get('lobby_uuid');
  const [allLobbies, setAllLobbies] = useState<LobbyListItem[]>([]);
  const [selectedLobbyName, setSelectedLobbyName] = useState<string | null>(
    null,
  );

  // Fetch all lobbies on mount
  useEffect(() => {
    getAllLobbies({
      onSuccess: lobbies => {
        // Sort by start_time descending (most recent first)
        const sorted = [...lobbies].sort((a, b) => {
          const dateA = new Date(a.start_time).getTime();
          const dateB = new Date(b.start_time).getTime();
          return dateB - dateA;
        });
        setAllLobbies(sorted);
      },
      onError: error => {
        console.error('Error fetching lobbies:', error);
      },
    });
  }, []);

  // Get lobby name from UUID
  useEffect(() => {
    if (!selectedLobbyUuid) {
      setSelectedLobbyName(null);
      return;
    }
    const lobby = allLobbies.find(l => l.uuid === selectedLobbyUuid);
    setSelectedLobbyName(lobby?.name ?? null);
  }, [selectedLobbyUuid, allLobbies]);

  // Fetch lobby overview data when a lobby is selected
  const { data: lobbyData, error: lobbyError } = useSWR<LobbyInstanceData>(
    selectedLobbyName && selectedLobbyUuid
      ? getLobbyInstanceEndpoint(selectedLobbyName, selectedLobbyUuid)
      : null,
    dataFetcher,
  );

  // Fetch tasks for this specific lobby instance (pass lobby_uuid to scope tasks)
  const { data: tasksData } = useSWR<TasksData>(
    selectedLobbyName && selectedLobbyUuid
      ? `/api/random_calls/lobby/${selectedLobbyName}/management/tasks?lobby_uuid=${selectedLobbyUuid}`
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

  if (isEmpty(allLobbies)) {
    return (
      <PageContainer>
        <Title>Random Call History</Title>
        <Description>
          View historical data and statistics for previous random call lobbies.
        </Description>
        <Text>Loading lobbies...</Text>
      </PageContainer>
    );
  }

  const { lobby, snapshot, proposal_statistics } = lobbyData || {};
  const proposalsAreFinal = snapshot?.proposals_are_final ?? !lobby?.is_active;
  const match_proposals = lobbyData?.match_proposals || {
    pending: [],
    accepted: [],
    rejected: [],
    expired: [],
  };
  const lobby_participants = lobbyData?.lobby_participants || [];

  const lobbyOptions = allLobbies.map(lobbyItem => {
    const startDate = new Date(lobbyItem.start_time);
    const formattedDate = formatDate(startDate, 'EEEE, d MMMM yyyy', 'de');
    const formattedTime = formatEventTime(
      startDate,
      new Date(lobbyItem.end_time),
    );
    const label = `${formattedDate} - ${formattedTime}`;
    return { value: lobbyItem.uuid, label };
  });

  return (
    <PageContainer>
      <Title>Random Call History</Title>
      <Description>
        View historical data and statistics for previous random call lobbies.
        Select a lobby from the dropdown below to view its details.
      </Description>

      <DropdownContainer>
        <Select
          placeholder="Select a lobby..."
          value={selectedLobbyUuid || ''}
          onValueChange={handleLobbyChange}
          options={lobbyOptions}
        />
      </DropdownContainer>

      {!selectedLobbyUuid && (
        <Text color="secondary">
          Please select a lobby from the dropdown above to view its details.
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
                <StatCard>
                  <StatValue>{snapshot.total_users}</StatValue>
                  <StatLabel>Total Users</StatLabel>
                  <BreakdownList>
                    <BreakdownRow>
                      <BreakdownLabel>First time</BreakdownLabel>
                      <BreakdownValue>
                        {snapshot.first_time_users}
                      </BreakdownValue>
                    </BreakdownRow>
                    <BreakdownRow>
                      <BreakdownLabel>Returning</BreakdownLabel>
                      <BreakdownValue>
                        {snapshot.returning_users}
                      </BreakdownValue>
                    </BreakdownRow>
                  </BreakdownList>
                </StatCard>
                <StatCard>
                  <StatValue>{snapshot.completed_calls}</StatValue>
                  <StatLabel>Total Calls</StatLabel>
                </StatCard>
                {proposalsAreFinal && (
                  <StatCard>
                    <StatValue>{snapshot.proposals_accepted}</StatValue>
                    <StatLabel>Accepted Proposals</StatLabel>
                  </StatCard>
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
                <StatCard>
                  <StatValue>{lobby.active_users_count}</StatValue>
                  <StatLabel>Active Users</StatLabel>
                </StatCard>
                <StatCard>
                  <StatValue>{lobby.total_users_count}</StatValue>
                  <StatLabel>Total Users</StatLabel>
                </StatCard>
              </StatsGridTight>
            )}
            <ProvisionalBucketStats $provisional={!proposalsAreFinal}>
              <StatCards>
                <StatCard>
                  <StatValue>{proposal_statistics.accepted_count}</StatValue>
                  <StatLabel>Accepted Proposals</StatLabel>
                </StatCard>
                <StatCard>
                  <StatValue>{proposal_statistics.rejected_count}</StatValue>
                  <StatLabel>Rejected Proposals</StatLabel>
                </StatCard>
                <StatCard>
                  <StatValue>{proposal_statistics.expired_count}</StatValue>
                  <StatLabel>Expired Proposals</StatLabel>
                </StatCard>
              </StatCards>
            </ProvisionalBucketStats>
          </Section>

          {/* Lobby Participants */}
          <Section>
            <SectionTitle>Lobby Participants</SectionTitle>
            <LobbyParticipantsTable
              participants={lobby_participants}
              showStatus={false}
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
                />
              </TabsContent>
              <TabsContent value="rejected">
                <MatchProposalsTable matches={match_proposals.rejected} />
              </TabsContent>
              <TabsContent value="expired">
                <MatchProposalsTable matches={match_proposals.expired} />
              </TabsContent>
            </Tabs>
          </Section>

          {/* Celery Tasks */}
          {tasksData && (
            <Section>
              <SectionTitle>Celery Tasks</SectionTitle>
              <StatCards>
                <StatCard>
                  <StatValue>{tasksData.statistics.total}</StatValue>
                  <StatLabel>Total Tasks</StatLabel>
                </StatCard>
                <StatCard>
                  <StatValue>{tasksData.statistics.success}</StatValue>
                  <StatLabel>Successful</StatLabel>
                </StatCard>
                <StatCard>
                  <StatValue>{tasksData.statistics.failure}</StatValue>
                  <StatLabel>Failed</StatLabel>
                </StatCard>
                <StatCard>
                  <StatValue>{tasksData.statistics.pending}</StatValue>
                  <StatLabel>Pending</StatLabel>
                </StatCard>
              </StatCards>
            </Section>
          )}
        </>
      )}
    </PageContainer>
  );
}

export default RandomCallHistory;
