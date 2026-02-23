import {
  Dropdown,
  Loading,
  LoadingSizes,
  Tag,
  TagAppearance,
  TagSizes,
  Text,
} from '@a-little-world/little-world-design-system';
import { isEmpty } from 'lodash';
import React, { useEffect, useState } from 'react';
import useSWR from 'swr';

import {
  getAllLobbies,
  LobbyListItem,
  LobbyOverviewData,
  TasksData,
} from '../../../api/randomCalls';
import { formatDate, formatEventTime } from '../../../helpers/date';
import { dataFetcher } from '../../../store';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '../../atoms/Table';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../../atoms/Tabs';
import {
  Container,
  Description,
  DropdownContainer,
  Section,
  SectionTitle,
  StatCardSecondary as StatCard,
  StatLabel,
  StatsGridTight as StatsGrid,
  StatValueSmall as StatValue,
  Title,
} from './RandomCalls.styles';

interface MatchProposal {
  uuid: string;
  u1_hash: string;
  u1_name: string;
  u2_hash: string;
  u2_name: string;
  u1_accepted: boolean;
  u2_accepted: boolean;
  accepted: boolean;
  rejected: boolean;
  in_session: boolean;
}

const MatchProposalsTable = ({ matches }: { matches: MatchProposal[] }) => {
  if (isEmpty(matches)) {
    return <Text color="secondary">No matches found</Text>;
  }

  return (
    <Table>
      <TableHead>
        <TableRow>
          <TableHeader>User 1</TableHeader>
          <TableHeader>User 2</TableHeader>
          <TableHeader>U1 Accepted</TableHeader>
          <TableHeader>U2 Accepted</TableHeader>
          <TableHeader>Status</TableHeader>
        </TableRow>
      </TableHead>
      <TableBody>
        {matches.map(match => (
          <TableRow key={match.uuid}>
            <TableCell>{match.u1_name}</TableCell>
            <TableCell>{match.u2_name}</TableCell>
            <TableCell>
              {match.u1_accepted ? (
                <Tag appearance={TagAppearance.success} size={TagSizes.small}>
                  Yes
                </Tag>
              ) : (
                <Tag appearance={TagAppearance.secondary} size={TagSizes.small}>
                  No
                </Tag>
              )}
            </TableCell>
            <TableCell>
              {match.u2_accepted ? (
                <Tag appearance={TagAppearance.success} size={TagSizes.small}>
                  Yes
                </Tag>
              ) : (
                <Tag appearance={TagAppearance.secondary} size={TagSizes.small}>
                  No
                </Tag>
              )}
            </TableCell>
            <TableCell>
              {match.accepted ? (
                <Tag appearance={TagAppearance.success} size={TagSizes.small}>
                  Accepted
                </Tag>
              ) : match.rejected ? (
                <Tag appearance={TagAppearance.error} size={TagSizes.small}>
                  Rejected
                </Tag>
              ) : (
                <Tag appearance={TagAppearance.secondary} size={TagSizes.small}>
                  Pending
                </Tag>
              )}
            </TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  );
};

function RandomCallHistory() {
  const [selectedLobbyUuid, setSelectedLobbyUuid] = useState<string | null>(
    null,
  );
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
    if (selectedLobbyUuid) {
      const lobby = allLobbies.find(l => l.uuid === selectedLobbyUuid);
      if (lobby) {
        setSelectedLobbyName(lobby.name);
      }
    }
  }, [selectedLobbyUuid, allLobbies]);

  // Fetch lobby overview data when a lobby is selected
  const { data: lobbyData, error: lobbyError } = useSWR<LobbyOverviewData>(
    selectedLobbyName
      ? `/api/random_calls/lobby/${selectedLobbyName}/management/overview`
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
    setSelectedLobbyUuid(value || null);
  };

  if (isEmpty(allLobbies)) {
    return (
      <Container>
        <Title>Random Call History</Title>
        <Description>
          View historical data and statistics for previous random call lobbies.
        </Description>
        <Text>Loading lobbies...</Text>
      </Container>
    );
  }

  const { lobby, statistics } = lobbyData || {};
  const match_proposals = lobbyData?.match_proposals || {
    pending: [],
    accepted: [],
    rejected: [],
    expired: [],
  };

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
    <Container>
      <Title>Random Call History</Title>
      <Description>
        View historical data and statistics for previous random call lobbies.
        Select a lobby from the dropdown below to view its details.
      </Description>

      <DropdownContainer>
        <Dropdown
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

      {lobbyData && lobby && statistics && (
        <>
          {/* Key Stats */}
          <Section>
            <SectionTitle>Key Stats</SectionTitle>
            <StatsGrid>
              <StatCard>
                <StatLabel>Total Users</StatLabel>
                <StatValue>{lobby.total_users_count}</StatValue>
              </StatCard>
              <StatCard>
                <StatLabel>Total Calls</StatLabel>
                <StatValue>{match_proposals.accepted.length}</StatValue>
              </StatCard>
              <StatCard>
                <StatLabel>Matches Made</StatLabel>
                <StatValue>{statistics.accepted_count}</StatValue>
              </StatCard>
            </StatsGrid>
          </Section>

          {/* Match Statistics */}
          <Section>
            <SectionTitle>Match Statistics</SectionTitle>
            <StatsGrid>
              <StatCard>
                <StatLabel>Pending Matches</StatLabel>
                <StatValue>{statistics.pending_count}</StatValue>
              </StatCard>
              <StatCard>
                <StatLabel>Accepted Matches</StatLabel>
                <StatValue>{statistics.accepted_count}</StatValue>
              </StatCard>
              <StatCard>
                <StatLabel>Rejected Matches</StatLabel>
                <StatValue>{statistics.rejected_count}</StatValue>
              </StatCard>
              <StatCard>
                <StatLabel>Expired Matches</StatLabel>
                <StatValue>{statistics.expired_count}</StatValue>
              </StatCard>
            </StatsGrid>
          </Section>

          {/* Match Proposals */}
          <Section>
            <SectionTitle>Match Proposals</SectionTitle>
            <Tabs defaultValue="pending">
              <TabsList className="grid w-full grid-cols-4">
                <TabsTrigger value="pending">
                  Pending ({statistics.pending_count})
                </TabsTrigger>
                <TabsTrigger value="accepted">
                  Accepted ({statistics.accepted_count})
                </TabsTrigger>
                <TabsTrigger value="rejected">
                  Rejected ({statistics.rejected_count})
                </TabsTrigger>
                <TabsTrigger value="expired">
                  Expired ({statistics.expired_count})
                </TabsTrigger>
              </TabsList>
              <TabsContent value="pending">
                <MatchProposalsTable matches={match_proposals.pending} />
              </TabsContent>
              <TabsContent value="accepted">
                <MatchProposalsTable matches={match_proposals.accepted} />
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
              <StatsGrid>
                <StatCard>
                  <StatLabel>Total Tasks</StatLabel>
                  <StatValue>{tasksData.statistics.total}</StatValue>
                </StatCard>
                <StatCard>
                  <StatLabel>Successful</StatLabel>
                  <StatValue>{tasksData.statistics.success}</StatValue>
                </StatCard>
                <StatCard>
                  <StatLabel>Failed</StatLabel>
                  <StatValue>{tasksData.statistics.failure}</StatValue>
                </StatCard>
                <StatCard>
                  <StatLabel>Pending</StatLabel>
                  <StatValue>{tasksData.statistics.pending}</StatValue>
                </StatCard>
              </StatsGrid>
            </Section>
          )}
        </>
      )}
    </Container>
  );
}

export default RandomCallHistory;
