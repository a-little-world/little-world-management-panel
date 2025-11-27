import {
    Button,
    ButtonAppearance,
    ButtonSizes,
    Card,
    CardHeader,
    CardSizes,
    Modal,
    Tag,
    TagAppearance,
    TagSizes,
    Text,
} from '@a-little-world/little-world-design-system';
import { isEmpty } from 'lodash';
import React, { useState } from 'react';
import styled from 'styled-components';
import useSWR, { mutate } from 'swr';

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
  max-height: calc(100vh - 2rem);
  overflow-y: auto;
  box-sizing: border-box;
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
  cursor: pointer;
  display: flex;
  align-items: center;
  gap: 0.5rem;
  user-select: none;

  &:hover {
    opacity: 0.8;
  }
`;

const CollapsibleContent = styled.div<{ $isOpen: boolean }>`
  max-height: ${({ $isOpen }) => ($isOpen ? '10000px' : '0')};
  overflow: hidden;
  transition: max-height 0.3s ease-out;
`;

const TaskDetailRow = styled.div`
  padding: 1rem;
  background: ${({ theme }) => theme.color.surface.secondary};
  border-top: 1px solid ${({ theme }) => theme.color.border.subtle};
  font-family: monospace;
  font-size: 0.875rem;
  white-space: pre-wrap;
  word-break: break-all;
`;

const TaskDetailSection = styled.div`
  margin-bottom: 1rem;

  &:last-child {
    margin-bottom: 0;
  }
`;

const TaskDetailLabel = styled.div`
  font-weight: 600;
  margin-bottom: 0.5rem;
  color: ${({ theme }) => theme.color.text.primary};
  font-family: sans-serif;
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
        pending: MatchProposal[];
        accepted: MatchProposal[];
        rejected: MatchProposal[];
        expired: MatchProposal[];
    };
    statistics: {
        total_matches: number;
        pending_count: number;
        accepted_count: number;
        rejected_count: number;
        expired_count: number;
    };
}

interface TaskData {
    task_id: string;
    task_name: string;
    status: string;
    date_created: string | null;
    date_done: string | null;
    result: string | null;
    traceback: string | null;
    worker: string | null;
}

interface TasksData {
    tasks: TaskData[];
    statistics: {
        total: number;
        success: number;
        failure: number;
        pending: number;
    };
    task_statistics: {
        [taskName: string]: {
            total: number;
            success: number;
            failure: number;
            pending: number;
        };
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

function TasksTable({ tasks }: { tasks: TaskData[] }) {
    const [expandedTasks, setExpandedTasks] = useState<Set<string>>(new Set());

    if (isEmpty(tasks)) {
        return (
            <Text className="p-4 w-full" center>
                No tasks found.
            </Text>
        );
    }

    const getStatusTag = (status: string) => {
        let appearance = TagAppearance.error;
        if (status === 'SUCCESS') appearance = TagAppearance.success;
        // For PENDING and other statuses, use error appearance

        return (
            <Tag appearance={appearance} size={TagSizes.small}>
                {status}
            </Tag>
        );
    };

    const formatTaskName = (taskName: string) => {
        // Extract just the function name from the full task path
        const parts = taskName.split('.');
        return parts[parts.length - 1] || taskName;
    };

    const toggleTask = (taskId: string) => {
        setExpandedTasks(prev => {
            const newSet = new Set(prev);
            if (newSet.has(taskId)) {
                newSet.delete(taskId);
            } else {
                newSet.add(taskId);
            }
            return newSet;
        });
    };

    const formatJsonResult = (result: string | null) => {
        if (!result) return 'No result';
        try {
            const parsed = JSON.parse(result);
            return JSON.stringify(parsed, null, 2);
        } catch {
            return result;
        }
    };

    return (
        <Table>
            <TableHeader>
                <TableRow>
                    <TableHead style={{ width: '30px' }}></TableHead>
                    <TableHead>Task Name</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Created</TableHead>
                    <TableHead>Completed</TableHead>
                    <TableHead>Worker</TableHead>
                    <TableHead>Task ID</TableHead>
                </TableRow>
            </TableHeader>
            <TableBody>
                {tasks.map(task => {
                    const isExpanded = expandedTasks.has(task.task_id);
                    return (
                        <React.Fragment key={task.task_id}>
                            <TableRow
                                style={{ cursor: 'pointer' }}
                                onClick={() => toggleTask(task.task_id)}
                            >
                                <TableCell>
                                    {isExpanded ? '▼' : '▶'}
                                </TableCell>
                                <TableCell>{formatTaskName(task.task_name)}</TableCell>
                                <TableCell>{getStatusTag(task.status)}</TableCell>
                                <TableCell>{formatTimeAgo(task.date_created)}</TableCell>
                                <TableCell>
                                    {task.date_done ? formatTimeAgo(task.date_done) : '-'}
                                </TableCell>
                                <TableCell>{task.worker || '-'}</TableCell>
                                <TableCell style={{ fontFamily: 'monospace', fontSize: '0.75rem' }}>
                                    {task.task_id.substring(0, 8)}...
                                </TableCell>
                            </TableRow>
                            {isExpanded && (
                                <TableRow>
                                    <TableCell colSpan={7} style={{ padding: 0 }}>
                                        <TaskDetailRow>
                                            <TaskDetailSection>
                                                <TaskDetailLabel>Full Task ID:</TaskDetailLabel>
                                                <div>{task.task_id}</div>
                                            </TaskDetailSection>
                                            <TaskDetailSection>
                                                <TaskDetailLabel>Full Task Name:</TaskDetailLabel>
                                                <div>{task.task_name}</div>
                                            </TaskDetailSection>
                                            {task.result && (
                                                <TaskDetailSection>
                                                    <TaskDetailLabel>Result:</TaskDetailLabel>
                                                    <div>{formatJsonResult(task.result)}</div>
                                                </TaskDetailSection>
                                            )}
                                            {task.traceback && (
                                                <TaskDetailSection>
                                                    <TaskDetailLabel>Traceback:</TaskDetailLabel>
                                                    <div style={{ color: 'red' }}>{task.traceback}</div>
                                                </TaskDetailSection>
                                            )}
                                            {task.date_created && (
                                                <TaskDetailSection>
                                                    <TaskDetailLabel>Created At:</TaskDetailLabel>
                                                    <div>{new Date(task.date_created).toLocaleString()}</div>
                                                </TaskDetailSection>
                                            )}
                                            {task.date_done && (
                                                <TaskDetailSection>
                                                    <TaskDetailLabel>Completed At:</TaskDetailLabel>
                                                    <div>{new Date(task.date_done).toLocaleString()}</div>
                                                </TaskDetailSection>
                                            )}
                                        </TaskDetailRow>
                                    </TableCell>
                                </TableRow>
                            )}
                        </React.Fragment>
                    );
                })}
            </TableBody>
        </Table>
    );
}

function MatchProposalsTable({ matches }: { matches: MatchProposal[] }) {
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
                            {match.u1_name} ({match.u1_hash})
                        </TableCell>
                        <TableCell>
                            {match.u2_name} ({match.u2_hash})
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
    const [showResetConfirm, setShowResetConfirm] = useState(false);
    const [isResetting, setIsResetting] = useState(false);
    const [tasksSectionOpen, setTasksSectionOpen] = useState(true);

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

    const {
        data: tasksData,
        error: tasksError,
        isValidating: tasksValidating,
    } = useSWR<TasksData>(
        `/api/random_calls/lobby/${lobbyName}/management/tasks`,
        dataFetcher,
        {
            refreshInterval: autoRefresh ? 5000 : 0, // Refresh every 5 seconds if enabled
            revalidateOnFocus: true,
            revalidateOnMount: true,
        },
    );

    const handleResetLobby = async () => {
        setIsResetting(true);
        try {
            const response = await fetch(
                `/api/random_calls/lobby/${lobbyName}/management/reset`,
                {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                        'X-CSRFToken':
                            document.cookie.split('csrftoken=')[1]?.split(';')[0] || '',
                    },
                    credentials: 'same-origin',
                },
            );

            if (!response.ok) {
                throw new Error('Failed to reset lobby');
            }

            // Refresh the data
            mutate(`/api/random_calls/lobby/${lobbyName}/management/overview`);
            setShowResetConfirm(false);
        } catch (error) {
            console.error('Error resetting lobby:', error);
            alert('Failed to reset lobby. Please try again.');
        } finally {
            setIsResetting(false);
        }
    };

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
                <div style={{ display: 'flex', gap: '1rem', alignItems: 'center' }}>
                    <label>
                        <input
                            type="checkbox"
                            checked={autoRefresh}
                            onChange={e => setAutoRefresh(e.target.checked)}
                        />{' '}
                        Auto-refresh (3s)
                    </label>
                    <Button
                        appearance={ButtonAppearance.Secondary}
                        size={ButtonSizes.Small}
                        onClick={() => setShowResetConfirm(true)}
                    >
                        Reset Lobby
                    </Button>
                </div>
            </Header>

            {/* Reset Confirmation Modal */}
            <Modal open={showResetConfirm} onClose={() => setShowResetConfirm(false)}>
                <Card width={CardSizes.Medium}>
                    <CardHeader>Reset Random Call Lobby</CardHeader>
                    <div style={{ padding: '1.5rem' }}>
                        <Text>
                            Are you sure you want to reset the "{lobbyName}" lobby? This will:
                        </Text>
                        <ul style={{ marginTop: '1rem', marginBottom: '1rem', paddingLeft: '1.5rem' }}>
                            <li>Delete all lobby users</li>
                            <li>Delete all match proposals</li>
                            <li>Recreate the lobby with current time</li>
                        </ul>
                        <Text bold>This action cannot be undone.</Text>
                        <div
                            style={{
                                display: 'flex',
                                gap: '1rem',
                                marginTop: '1.5rem',
                                justifyContent: 'flex-end',
                            }}
                        >
                            <Button
                                appearance={ButtonAppearance.Secondary}
                                size={ButtonSizes.Medium}
                                onClick={() => setShowResetConfirm(false)}
                                disabled={isResetting}
                            >
                                Cancel
                            </Button>
                            <Button
                                appearance={ButtonAppearance.Primary}
                                size={ButtonSizes.Medium}
                                onClick={handleResetLobby}
                                disabled={isResetting}
                            >
                                {isResetting ? 'Resetting...' : 'Reset Lobby'}
                            </Button>
                        </div>
                    </div>
                </Card>
            </Modal>

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

            {/* Celery Tasks */}
            <Section>
                <SectionTitle onClick={() => setTasksSectionOpen(!tasksSectionOpen)}>
                    {tasksSectionOpen ? '▼' : '▶'} Celery Tasks
                    {tasksValidating && <RefreshIndicator isRefreshing={true}>🔄</RefreshIndicator>}
                </SectionTitle>
                <CollapsibleContent $isOpen={tasksSectionOpen}>
                    {tasksError ? (
                        <Text>Error loading tasks: {tasksError.message}</Text>
                    ) : tasksData ? (
                        <>
                            <StatsGrid>
                                <StatCard>
                                    <StatLabel>Total Tasks</StatLabel>
                                    <StatValue>{tasksData.statistics.total}</StatValue>
                                </StatCard>
                                <StatCard>
                                    <StatLabel>Successful</StatLabel>
                                    <StatValue>
                                        <Tag appearance={TagAppearance.success} size={TagSizes.small}>
                                            {tasksData.statistics.success}
                                        </Tag>
                                    </StatValue>
                                </StatCard>
                                <StatCard>
                                    <StatLabel>Failed</StatLabel>
                                    <StatValue>
                                        <Tag appearance={TagAppearance.error} size={TagSizes.small}>
                                            {tasksData.statistics.failure}
                                        </Tag>
                                    </StatValue>
                                </StatCard>
                                <StatCard>
                                    <StatLabel>Pending</StatLabel>
                                    <StatValue>
                                        <Tag appearance={TagAppearance.error} size={TagSizes.small}>
                                            {tasksData.statistics.pending}
                                        </Tag>
                                    </StatValue>
                                </StatCard>
                            </StatsGrid>
                            <div style={{ marginTop: '1.5rem' }}>
                                <TasksTable tasks={tasksData.tasks} />
                            </div>
                        </>
                    ) : (
                        <Text>Loading tasks...</Text>
                    )}
                </CollapsibleContent>
            </Section>
        </Container>
    );
}

export default RandomCallManagement;
