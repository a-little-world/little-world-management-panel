import {
  Button,
  ButtonAppearance,
  ButtonSizes,
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardSizes,
  Loading,
  LoadingSizes,
  Modal,
  Tag,
  TagAppearance,
  TagSizes,
  Text,
  Toast,
} from '@a-little-world/little-world-design-system';
import { isEmpty } from 'lodash';
import React, { useState } from 'react';
import useSWR, { mutate } from 'swr';

import {
  clearDanglingRandomCallMatches,
  clearUserRandomCallProposals,
  endLobby,
  getLobbyOverviewEndpoint,
  getUpcomingLobbiesEndpoint,
  MatchProposal,
  resetLobby,
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
  CollapsibleContent,
  Header,
  ScheduleDate,
  ScheduleItem,
  ScheduleItemInfo,
  ScheduleStatus,
  ScheduleTime,
  Section,
  SectionHeaderRow,
  SectionTitle,
  SectionTitleClickable,
  SectionTitleFlush,
  TaskDetailLabel,
  TaskDetailRow,
  TaskDetailSection,
  TitleWithFlex as Title,
} from './RandomCalls.styles';

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
    user_uuid: string;
    user_name: string;
    user_type: string;
    is_active: boolean;
    last_status_checked_at: string | null;
    has_pending_match: boolean;
  }>;
  match_proposals: {
    pending: MatchProposal[];
    accepted: MatchProposal[];
    rejected: MatchProposal[];
    expired: MatchProposal[];
    dangling: MatchProposal[];
  };
  lobby_participants: Array<{
    user_id: number;
    user_uuid: string;
    user_name: string;
    user_type: string;
    is_active: boolean;
    completed_calls: number;
    unsuccessful_proposals: number;
    accepted_proposals: number;
    longest_call_duration_seconds: number;
    profile: {
      first_name: string;
      image_type: string;
      avatar_config: Record<string, unknown>;
      image: string | null;
    };
  }>;
  statistics: {
    total_matches: number;
    pending_count: number;
    accepted_count: number;
    rejected_count: number;
    expired_count: number;
    dangling_count: number;
    first_time_count: number;
    returning_count: number;
  };
  schedule: Array<{
    uuid: string;
    name: string;
    start_time: string;
    end_time: string;
    status: boolean;
    active_users_count: number;
  }>;
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

function ActiveUsersTable({
  users,
  onClearProposals,
}: {
  users: LobbyData['active_users'];
  onClearProposals: (userUuid: string) => Promise<number>;
}) {
  const [loadingUserIds, setLoadingUserIds] = useState<Record<string, boolean>>(
    {},
  );

  const handleClearProposals = async (userUuid: string) => {
    setLoadingUserIds(prev => ({ ...prev, [userUuid]: true }));
    try {
      await onClearProposals(userUuid);
    } finally {
      setLoadingUserIds(prev => ({ ...prev, [userUuid]: false }));
    }
  };

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
          <TableHead>User UUID</TableHead>
          <TableHead>Name</TableHead>
          <TableHead>Type</TableHead>
          <TableHead>Status</TableHead>
          <TableHead>Last Check-in</TableHead>
          <TableHead>Pending Match</TableHead>
          <TableHead>Actions</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {users.map(user => (
          <TableRow key={user.uuid}>
            <TableCell>{user.user_uuid}</TableCell>
            <TableCell>{user.user_name}</TableCell>
            <TableCell>{user.user_type}</TableCell>
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
            <TableCell>
              <Button
                appearance={ButtonAppearance.Secondary}
                size={ButtonSizes.Small}
                onClick={() => handleClearProposals(user.user_uuid)}
                loading={loadingUserIds[user.user_uuid]}
                disabled={loadingUserIds[user.user_uuid]}
              >
                Clear Proposals
              </Button>
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
                <TableCell>{isExpanded ? '▼' : '▶'}</TableCell>
                <TableCell>{formatTaskName(task.task_name)}</TableCell>
                <TableCell>{getStatusTag(task.status)}</TableCell>
                <TableCell>{formatTimeAgo(task.date_created)}</TableCell>
                <TableCell>
                  {task.date_done ? formatTimeAgo(task.date_done) : '-'}
                </TableCell>
                <TableCell>{task.worker || '-'}</TableCell>
                <TableCell
                  style={{ fontFamily: 'monospace', fontSize: '0.75rem' }}
                >
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
                          <div>
                            {new Date(task.date_created).toLocaleString()}
                          </div>
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

function DanglingMatchesTable({ matches }: { matches: MatchProposal[] }) {
  return (
    <MatchProposalsTable
      matches={matches}
      emptyMessage="No dangling match proposals."
    />
  );
}

const isDevelopmentOrStaging = () => {
  if (typeof window === 'undefined') return false;
  const hostname = window.location.hostname;
  // Check if localhost, staging, or development environment
  return (
    hostname === 'localhost' ||
    hostname === '127.0.0.1' ||
    hostname.includes('staging') ||
    hostname.includes('dev') ||
    hostname.includes('local')
  );
};

function RandomCallManagement() {
  const [autoRefresh, setAutoRefresh] = useState(true);
  const [showResetConfirm, setShowResetConfirm] = useState(false);
  const [isResetting, setIsResetting] = useState(false);
  const [tasksSectionOpen, setTasksSectionOpen] = useState(true);
  const [isEndingLobby, setIsEndingLobby] = useState(false);
  const [showEndConfirm, setShowEndConfirm] = useState(false);
  const [isClearingDangling, setIsClearingDangling] = useState(false);
  const [clearMatchesToast, setClearMatchesToast] = useState<{
    id: number;
    title: string;
  } | null>(null);
  const showResetButton = isDevelopmentOrStaging();

  const shouldPoll = autoRefresh;

  const { data, error, isValidating } = useSWR<LobbyData>(
    getLobbyOverviewEndpoint(),
    dataFetcher,
    {
      refreshInterval: shouldPoll ? 3000 : 0,
      revalidateOnFocus: true,
      revalidateOnMount: true,
    },
  );

  const {
    data: tasksData,
    error: tasksError,
    isValidating: tasksValidating,
  } = useSWR<TasksData>(
    `/api/random_calls/lobby/default/management/tasks`,
    dataFetcher,
    {
      refreshInterval: shouldPoll ? 5000 : 0,
      revalidateOnFocus: true,
      revalidateOnMount: true,
    },
  );

  // When current lobby is not active, fetch next upcoming lobby for display
  const { data: upcomingLobbies } = useSWR<
    Array<{
      uuid: string;
      name: string;
      start_time: string;
      end_time: string;
      status: boolean;
      active_users_count: number;
    }>
  >(
    data && !data.lobby.is_active ? getUpcomingLobbiesEndpoint() : null,
    dataFetcher,
    { revalidateOnFocus: true, revalidateOnMount: true },
  );
  const nextUpcomingLobby = upcomingLobbies?.[0] ?? null;

  const handleResetLobby = async () => {
    setIsResetting(true);
    resetLobby({
      onSuccess: () => {
        // Refresh the data
        mutate(getLobbyOverviewEndpoint());
        setShowResetConfirm(false);
        setIsResetting(false);
      },
      onError: (error: any) => {
        console.error('Error resetting lobby:', error);
        const errorMessage =
          error?.message ||
          error?.data?.message ||
          'Failed to reset lobby. Please try again.';
        alert(errorMessage);
        setIsResetting(false);
      },
    });
  };

  const handleEndLobby = async () => {
    setIsEndingLobby(true);
    endLobby({
      onSuccess: () => {
        mutate(getLobbyOverviewEndpoint());
        mutate(getUpcomingLobbiesEndpoint());
        setShowEndConfirm(false);
        alert('Lobby ended successfully!');
        setIsEndingLobby(false);
      },
      onError: (error: any) => {
        console.error('Error ending lobby:', error);
        const errorMessage =
          error?.message ||
          error?.data?.message ||
          'Failed to end lobby. Please try again.';
        alert(errorMessage);
        setIsEndingLobby(false);
      },
    });
  };

  const handleClearProposals = async (userUuid: string) => {
    return new Promise<number>((resolve, reject) => {
      clearUserRandomCallProposals({
        userUuid,
        onSuccess: result => {
          mutate(getLobbyOverviewEndpoint());
          setClearMatchesToast({
            id: Date.now(),
            title:
              result.updated_count === 0
                ? 'No pending random call matches were cleared.'
                : `Cleared ${result.updated_count} pending random call match${result.updated_count === 1 ? '' : 'es'}.`,
          });
          resolve(result.updated_count);
        },
        onError: (error: any) => {
          console.error('Error clearing proposals:', error);
          const errorMessage =
            error?.message ||
            error?.data?.message ||
            'Failed to clear proposals. Please try again.';
          alert(errorMessage);
          reject(error);
        },
      });
    });
  };

  const handleClearAllDangling = () => {
    setIsClearingDangling(true);
    clearDanglingRandomCallMatches({
      onSuccess: result => {
        mutate(getLobbyOverviewEndpoint());
        setClearMatchesToast({
          id: Date.now(),
          title:
            result.updated_count === 0
              ? 'No dangling match proposals to clear.'
              : `Cleared ${result.updated_count} dangling match proposal${result.updated_count === 1 ? '' : 's'}.`,
        });
        setIsClearingDangling(false);
      },
      onError: (error: any) => {
        console.error('Error clearing dangling matches:', error);
        const errorMessage =
          error?.message ||
          error?.data?.message ||
          'Failed to clear dangling matches. Please try again.';
        alert(errorMessage);
        setIsClearingDangling(false);
      },
    });
  };

  if (error) {
    return (
      <PageContainer>
        <Text>Error loading lobby data: {error.message}</Text>
      </PageContainer>
    );
  }

  if (!data) {
    return (
      <PageContainer>
        <Text>Loading lobby data...</Text>
      </PageContainer>
    );
  }

  const {
    lobby,
    active_users,
    match_proposals,
    lobby_participants,
    statistics,
  } = data;
  const danglingMatches = match_proposals.dangling ?? [];
  const danglingCount = statistics.dangling_count ?? 0;

  const lobbyPeriodLabel =
    lobby.start_time && lobby.end_time
      ? `${formatDate(new Date(lobby.start_time), 'EEEE, d MMMM yyyy', 'de')} · ${formatEventTime(new Date(lobby.start_time), new Date(lobby.end_time))}`
      : null;

  return (
    <>
      <PageContainer>
        <Header>
          <Title>
            Current Lobby
            <Tag
              appearance={
                lobby.is_active ? TagAppearance.success : TagAppearance.error
              }
            >
              {lobby.is_active ? 'Active' : 'Expired'}
            </Tag>
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
              color="red"
              size={ButtonSizes.Small}
              onClick={() => setShowEndConfirm(true)}
              disabled={!lobby.is_active || isEndingLobby}
            >
              End Lobby
            </Button>
            {showResetButton && (
              <Button
                appearance={ButtonAppearance.Primary}
                backgroundColor="red"
                size={ButtonSizes.Small}
                onClick={() => setShowResetConfirm(true)}
                disabled={!lobby.is_active}
              >
                Reset Lobby
              </Button>
            )}
          </div>
        </Header>

        {/* Reset Confirmation Modal */}
        <Modal
          open={showResetConfirm}
          onClose={() => setShowResetConfirm(false)}
        >
          <Card width={CardSizes.Medium}>
            <CardHeader>Reset Random Call Lobby</CardHeader>
            <CardContent>
              <Text>
                Are you sure you want to reset the "default" lobby? This will:
              </Text>
              <ul
                style={{
                  marginTop: '1rem',
                  marginBottom: '1rem',
                  paddingLeft: '1.5rem',
                }}
              >
                <li>Delete all lobby users</li>
                <li>Delete all match proposals</li>
                <li>Recreate the lobby with current time</li>
              </ul>
              <Text bold>This action cannot be undone.</Text>
              <CardFooter align="space-between">
                <Button
                  appearance={ButtonAppearance.Secondary}
                  size={ButtonSizes.Medium}
                  onClick={() => setShowResetConfirm(false)}
                  disabled={isResetting}
                >
                  Cancel
                </Button>
                <Button
                  backgroundColor="red"
                  appearance={ButtonAppearance.Primary}
                  size={ButtonSizes.Medium}
                  onClick={handleResetLobby}
                  disabled={isResetting}
                >
                  {isResetting ? 'Resetting...' : 'Reset Lobby'}
                </Button>
              </CardFooter>
            </CardContent>
          </Card>
        </Modal>

        {/* End Lobby Confirmation Modal */}
        <Modal open={showEndConfirm} onClose={() => setShowEndConfirm(false)}>
          <Card width={CardSizes.Medium}>
            <CardHeader>End Random Call Lobby</CardHeader>
            <CardContent>
              <Text>
                Are you sure you want to end the "default" lobby? This will:
              </Text>
              <ul
                style={{
                  marginTop: '1rem',
                  marginBottom: '1rem',
                  paddingLeft: '1.5rem',
                }}
              >
                <li>Set the lobby end time to the current time</li>
                <li>Mark the lobby as inactive</li>
                <li>Prevent new users from joining the lobby</li>
                <li>Allow existing users to continue their current sessions</li>
              </ul>
              <Text bold>This action cannot be undone.</Text>
              <CardFooter align="space-between">
                <Button
                  appearance={ButtonAppearance.Secondary}
                  size={ButtonSizes.Medium}
                  onClick={() => setShowEndConfirm(false)}
                  disabled={isEndingLobby}
                >
                  Cancel
                </Button>
                <Button
                  backgroundColor="red"
                  appearance={ButtonAppearance.Primary}
                  size={ButtonSizes.Medium}
                  onClick={handleEndLobby}
                  disabled={isEndingLobby}
                >
                  {isEndingLobby ? 'Ending...' : 'End Lobby'}
                </Button>
              </CardFooter>
            </CardContent>
          </Card>
        </Modal>

        {/* Next upcoming lobby (only when current lobby is not active) */}
        {!lobby.is_active && nextUpcomingLobby && (
          <Section>
            <SectionTitle>Next upcoming lobby</SectionTitle>
            <ScheduleItem>
              <ScheduleItemInfo>
                <ScheduleDate>
                  {formatDate(
                    new Date(nextUpcomingLobby.start_time),
                    'EEEE, d MMMM yyyy',
                    'de',
                  )}
                </ScheduleDate>
                <ScheduleTime>
                  {formatEventTime(
                    new Date(nextUpcomingLobby.start_time),
                    new Date(nextUpcomingLobby.end_time),
                  )}
                </ScheduleTime>
              </ScheduleItemInfo>
              <ScheduleStatus>
                <Tag
                  appearance={
                    nextUpcomingLobby.status
                      ? TagAppearance.success
                      : TagAppearance.outline
                  }
                  size={TagSizes.small}
                >
                  {nextUpcomingLobby.status ? 'Active' : 'Upcoming'}
                </Tag>
                <Text>{nextUpcomingLobby.active_users_count} users</Text>
              </ScheduleStatus>
            </ScheduleItem>
          </Section>
        )}

        {/* Lobby Status */}
        <Section>
          <SectionTitle>{lobbyPeriodLabel}</SectionTitle>
          <StatCards>
            <StatCard>
              <StatValue>{lobby.active_users_count}</StatValue>
              <StatLabel>Active Users</StatLabel>
            </StatCard>
            <StatCard>
              <StatValue>{lobby.total_users_count}</StatValue>
              <StatLabel>Total Users</StatLabel>
              <BreakdownList>
                <BreakdownRow>
                  <BreakdownLabel>First time</BreakdownLabel>
                  <BreakdownValue>{statistics.first_time_count}</BreakdownValue>
                </BreakdownRow>
                <BreakdownRow>
                  <BreakdownLabel>Returning</BreakdownLabel>
                  <BreakdownValue>{statistics.returning_count}</BreakdownValue>
                </BreakdownRow>
              </BreakdownList>
            </StatCard>
            <StatCard>
              <StatValue>{statistics.total_matches}</StatValue>
              <StatLabel>Total Matches</StatLabel>
            </StatCard>
          </StatCards>
        </Section>

        {/* Proposal Statistics */}
        <Section>
          <SectionTitle>Proposal Statistics</SectionTitle>
          <StatCards>
            <StatCard>
              <StatValue>{statistics.pending_count}</StatValue>
              <StatLabel>Pending Proposals</StatLabel>
            </StatCard>
            <StatCard>
              <StatValue>{statistics.accepted_count}</StatValue>
              <StatLabel>Accepted Proposals</StatLabel>
            </StatCard>
            <StatCard>
              <StatValue>{statistics.rejected_count}</StatValue>
              <StatLabel>Rejected Proposals</StatLabel>
            </StatCard>
            <StatCard>
              <StatValue>{statistics.expired_count}</StatValue>
              <StatLabel>Expired Proposals</StatLabel>
            </StatCard>
            <StatCard>
              <StatValue>{danglingCount}</StatValue>
              <StatLabel>Dangling proposals</StatLabel>
            </StatCard>
          </StatCards>
        </Section>

        {/* Active Users */}
        <Section>
          <SectionTitle>Active Users</SectionTitle>
          <ActiveUsersTable
            users={active_users}
            onClearProposals={handleClearProposals}
          />
        </Section>

        {/* Dangling proposals */}
        <Section>
          <SectionHeaderRow>
            <SectionTitleFlush>Dangling Proposals</SectionTitleFlush>
            <Button
              appearance={ButtonAppearance.Secondary}
              color="red"
              size={ButtonSizes.Small}
              onClick={handleClearAllDangling}
              disabled={danglingCount === 0 || isClearingDangling}
            >
              {isClearingDangling ? 'Clearing…' : 'Clear all dangling'}
            </Button>
          </SectionHeaderRow>
          <DanglingMatchesTable matches={danglingMatches} />
        </Section>

        {/* Proposals */}
        <Section>
          <SectionTitle>Proposals</SectionTitle>
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

        <Section>
          <SectionTitle>Lobby Participants</SectionTitle>
          <LobbyParticipantsTable participants={lobby_participants ?? []} />
        </Section>

        {/* Celery Tasks */}
        <Section>
          <SectionTitleClickable
            onClick={() => setTasksSectionOpen(!tasksSectionOpen)}
          >
            {tasksSectionOpen ? '▼' : '▶'} Celery Tasks
            {tasksValidating && <Loading size={LoadingSizes.Small} inline />}
          </SectionTitleClickable>
          <CollapsibleContent $isOpen={tasksSectionOpen}>
            {tasksError ? (
              <Text>Error loading tasks: {tasksError.message}</Text>
            ) : tasksData ? (
              <>
                <StatCards>
                  <StatCard>
                    <StatValue>{tasksData.statistics.total}</StatValue>
                    <StatLabel>Total Tasks</StatLabel>
                  </StatCard>
                  <StatCard>
                    <StatValue>
                      <Tag
                        appearance={TagAppearance.success}
                        size={TagSizes.small}
                      >
                        {tasksData.statistics.success}
                      </Tag>
                    </StatValue>
                    <StatLabel>Successful</StatLabel>
                  </StatCard>
                  <StatCard>
                    <StatValue>
                      <Tag
                        appearance={TagAppearance.error}
                        size={TagSizes.small}
                      >
                        {tasksData.statistics.failure}
                      </Tag>
                    </StatValue>
                    <StatLabel>Failed</StatLabel>
                  </StatCard>
                  <StatCard>
                    <StatValue>
                      <Tag
                        appearance={TagAppearance.error}
                        size={TagSizes.small}
                      >
                        {tasksData.statistics.pending}
                      </Tag>
                    </StatValue>
                    <StatLabel>Pending</StatLabel>
                  </StatCard>
                </StatCards>
                <div style={{ marginTop: '1.5rem' }}>
                  <TasksTable tasks={tasksData.tasks} />
                </div>
              </>
            ) : (
              <Text>Loading tasks...</Text>
            )}
          </CollapsibleContent>
        </Section>
      </PageContainer>
      {clearMatchesToast && (
        <Toast
          key={clearMatchesToast.id}
          headline="Success"
          title={clearMatchesToast.title}
          onClose={() => setClearMatchesToast(null)}
        />
      )}
    </>
  );
}

export default RandomCallManagement;
