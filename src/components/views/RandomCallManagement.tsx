import {
    Tag,
    TagAppearance,
    TagSizes,
    Text,
} from '@a-little-world/little-world-design-system';
import { isEmpty } from 'lodash';
import React, { useState } from 'react';
import styled from 'styled-components';
import useSWR from 'swr';

import { dataFetcher } from '../../store';
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from '../atoms/Table';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../atoms/Tabs';

const Container = styled.div`
  padding: 1.5rem;
  width: 100%;
`;

const StatsGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 1rem;
  margin-bottom: 2rem;
`;

const StatCard = styled.div`
  background: ${({ theme }) => theme.color.surface.primary};
  border: 1px solid ${({ theme }) => theme.color.border.subtle};
  border-radius: 8px;
  padding: 1.5rem;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
`;

const StatLabel = styled.div`
  font-size: 0.875rem;
  color: ${({ theme }) => theme.color.text.secondary};
  margin-bottom: 0.5rem;
`;

const StatValue = styled.div`
  font-size: 2rem;
  font-weight: bold;
  color: ${({ theme }) => theme.color.text.primary};
`;

const Section = styled.div`
  margin-bottom: 2rem;
`;

const SectionTitle = styled.h2`
  font-size: 1.25rem;
  font-weight: 600;
  margin-bottom: 1rem;
  color: ${({ theme }) => theme.color.text.primary};
`;

const RefreshIndicator = styled.div<{ isRefreshing: boolean }>`
  display: inline-block;
  margin-left: 0.5rem;
  opacity: ${({ isRefreshing }) => (isRefreshing ? 1 : 0.3)};
  transition: opacity 0.3s;
`;

const Header = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 1.5rem;
`;

const Title = styled.h1`
  font-size: 1.75rem;
  font-weight: 700;
  color: ${({ theme }) => theme.color.text.primary};
  display: flex;
  align-items: center;
`;

interface LobbyData {
    lobby: {
        name: string;
        uuid: string;
        is_active: boolean;
        start_time: string | null;
        end_time: string | null;
        active_users_count: number;
        total_users_count: number;
    };
    active_users: Array<{
        uuid: string;
        user_hash: string;
        user_name: string;
        is_active: boolean;
        last_status_checked_at: string | null;
        has_pending_match: boolean;
    }>;
    match_proposals: {
        pending: any[];
        accepted: any[];
        rejected: any[];
        expired: any[];
    };
    statistics: {
        total_matches: number;
        pending_count: number;
        accepted_count: number;
        rejected_count: number;
        expired_count: number;
    };
}

function formatTimeAgo(dateString: string | null): string {
    if (!dateString) return 'Never';

    const date = new Date(dateString);
    const now = new Date();
    const seconds = Math.floor((now.getTime() - date.getTime()) / 1000);

    if (seconds < 60) return `${seconds}s ago`;
    if (seconds < 3600) return `${Math.floor(seconds / 60)}m ago`;
    if (seconds < 86400) return `${Math.floor(seconds / 3600)}h ago`;
    return `${Math.floor(seconds / 86400)}d ago`;
}

function ActiveUsersTable({ users }: { users: LobbyData['active_users'] }) {
    if (isEmpty(users)) {
        return (
            <Text className="p-4 w-full" center>
                No active users in lobby.
            </Text>
        );
    }

    return (
        <Table>
            <TableHeader>
                <TableRow>
                    <TableHead>User Hash</TableHead>
                    <TableHead>Name</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Last Check-in</TableHead>
                    <TableHead>Pending Match</TableHead>
                </TableRow>
            </TableHeader>
            <TableBody>
                {users.map(user => (
                    <TableRow key={user.uuid}>
                        <TableCell>{user.user_hash}</TableCell>
                        <TableCell>{user.user_name}</TableCell>
                        <TableCell>
                            <Tag
                                appearance={
                                    user.is_active ? TagAppearance.success : TagAppearance.error
                                }
                                size={TagSizes.small}
                            >
                                {user.is_active ? 'Active' : 'Inactive'}
                            </Tag>
                        </TableCell>
                        <TableCell>{formatTimeAgo(user.last_status_checked_at)}</TableCell>
                        <TableCell>
                            {user.has_pending_match ? (
                                <Tag appearance={TagAppearance.success} size={TagSizes.small}>
                                    Yes
                                </Tag>
                            ) : (
                                <Tag appearance={TagAppearance.error} size={TagSizes.small}>
                                    No
                                </Tag>
                            )}
                        </TableCell>
                    </TableRow>
                ))}
            </TableBody>
        </Table>
    );
}

function MatchProposalsTable({ matches }: { matches: any[] }) {
    if (isEmpty(matches)) {
        return (
            <Text className="p-4 w-full" center>
                No matches in this category.
            </Text>
        );
    }

    return (
        <Table>
            <TableHeader>
                <TableRow>
                    <TableHead>Match UUID</TableHead>
                    <TableHead>User 1</TableHead>
                    <TableHead>User 2</TableHead>
                    <TableHead>U1 Accepted</TableHead>
                    <TableHead>U2 Accepted</TableHead>
                    <TableHead>Status</TableHead>
                </TableRow>
            </TableHeader>
            <TableBody>
                {matches.map(match => (
                    <TableRow key={match.uuid}>
                        <TableCell>{match.uuid}</TableCell>
                        <TableCell>
                            {match.u1.name} ({match.u1.hash})
                        </TableCell>
                        <TableCell>
                            {match.u2.name} ({match.u2.hash})
                        </TableCell>
                        <TableCell>
                            <Tag
                                appearance={
                                    match.u1_accepted ? TagAppearance.success : TagAppearance.error
                                }
                                size={TagSizes.small}
                            >
                                {match.u1_accepted ? 'Yes' : 'No'}
                            </Tag>
                        </TableCell>
                        <TableCell>
                            <Tag
                                appearance={
                                    match.u2_accepted ? TagAppearance.success : TagAppearance.error
                                }
                                size={TagSizes.small}
                            >
                                {match.u2_accepted ? 'Yes' : 'No'}
                            </Tag>
                        </TableCell>
                        <TableCell>
                            {match.accepted && (
                                <Tag appearance={TagAppearance.success} size={TagSizes.small}>
                                    Accepted
                                </Tag>
                            )}
                            {match.rejected && (
                                <Tag appearance={TagAppearance.error} size={TagSizes.small}>
                                    Rejected
                                </Tag>
                            )}
                            {!match.accepted && !match.rejected && (
                                <Tag appearance={TagAppearance.success} size={TagSizes.small}>
                                    Pending
                                </Tag>
                            )}
                        </TableCell>
                    </TableRow>
                ))}
            </TableBody>
        </Table>
    );
}

function RandomCallManagement() {
    const [lobbyName] = useState('default');
    const [autoRefresh, setAutoRefresh] = useState(true);

    const {
        data,
        error,
        isValidating,
    } = useSWR<LobbyData>(
        `/api/random_calls/lobby/${lobbyName}/management/overview`,
        dataFetcher,
        {
            refreshInterval: autoRefresh ? 3000 : 0, // Refresh every 3 seconds if enabled
            revalidateOnFocus: true,
            revalidateOnMount: true,
        },
    );

    if (error) {
        return (
            <Container>
                <Text>Error loading lobby data: {error.message}</Text>
            </Container>
        );
    }

    if (!data) {
        return (
            <Container>
                <Text>Loading lobby data...</Text>
            </Container>
        );
    }

    const { lobby, active_users, match_proposals, statistics } = data;

    return (
        <Container>
            <Header>
                <Title>
                    Random Call Management - {lobby.name}
                    <RefreshIndicator isRefreshing={isValidating}>
                        {isValidating ? '🔄' : '⏸'}
                    </RefreshIndicator>
                </Title>
                <div>
                    <label>
                        <input
                            type="checkbox"
                            checked={autoRefresh}
                            onChange={e => setAutoRefresh(e.target.checked)}
                        />{' '}
                        Auto-refresh (3s)
                    </label>
                </div>
            </Header>

            {/* Lobby Status */}
            <Section>
                <SectionTitle>Lobby Status</SectionTitle>
                <StatsGrid>
                    <StatCard>
                        <StatLabel>Lobby Status</StatLabel>
                        <StatValue>
                            <Tag
                                appearance={
                                    lobby.is_active ? TagAppearance.success : TagAppearance.error
                                }
                                size={TagSizes.small}
                            >
                                {lobby.is_active ? 'Active' : 'Inactive'}
                            </Tag>
                        </StatValue>
                    </StatCard>
                    <StatCard>
                        <StatLabel>Active Users</StatLabel>
                        <StatValue>{lobby.active_users_count}</StatValue>
                    </StatCard>
                    <StatCard>
                        <StatLabel>Total Users</StatLabel>
                        <StatValue>{lobby.total_users_count}</StatValue>
                    </StatCard>
                    <StatCard>
                        <StatLabel>Total Matches</StatLabel>
                        <StatValue>{statistics.total_matches}</StatValue>
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

            {/* Active Users */}
            <Section>
                <SectionTitle>Active Users</SectionTitle>
                <ActiveUsersTable users={active_users} />
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
        </Container>
    );
}

export default RandomCallManagement;
