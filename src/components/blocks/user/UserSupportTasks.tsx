import {
  Tag,
  TagAppearance,
  TagSizes,
  Text,
  TextTypes,
} from '@a-little-world/little-world-design-system';
import { ColumnDef, createColumnHelper } from '@tanstack/react-table';
import React, { useMemo } from 'react';
import styled from 'styled-components';
import useSWR from 'swr';

import {
  STATUS_CONFIG,
  SupportTask,
  TaskPriority,
  TaskStatus,
  fetchSupportTasks,
  getActionTypeConfig,
} from '../../../api/supportTasks';
import { resolveAttachmentWidgetText } from '../../../helpers/chat';
import { formatTimeDistance } from '../../../helpers/date';
import {
  PriorityConfig,
  useTaskPriorities,
} from '../../../hooks/useTaskPriorities';
import { getSupportTaskDetailRoute } from '../../../router/routes';
import UserImage from '../../atoms/UserImage';
import { DataTable } from '../DataTable';

const TaskCell = styled.div`
  display: flex;
  flex-direction: column;
  gap: 3px;
  min-width: 200px;
  max-width: 320px;
`;

const TaskTitleLine = styled.div`
  display: flex;
  align-items: baseline;
  gap: ${({ theme }) => theme.spacing.xxxsmall};
  min-width: 0;
`;

const TaskIdPrefix = styled(Text)`
  color: ${({ theme }) => theme.color.text.tertiary};
  flex-shrink: 0;
  font-variant-numeric: tabular-nums;
`;

const TaskDesc = styled.span`
  font-size: 12px;
  color: ${({ theme }) => theme.color.text.tertiary};
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
  max-width: 300px;
`;

const UserCell = styled.div`
  display: flex;
  align-items: center;
  gap: ${({ theme }) => theme.spacing.xxsmall};
  min-width: 0;
`;

const UserName = styled.span`
  font-size: 13px;
  font-weight: 600;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  max-width: 140px;
`;

const UnassignedText = styled.span`
  color: ${({ theme }) => theme.color.text.quaternary};
  font-size: 13px;
`;

const EmptyState = styled.div`
  padding: ${({ theme }) => theme.spacing.medium};
`;

const columnHelper = createColumnHelper<SupportTask>();

function buildColumns(
  priorityConfig: Record<TaskPriority, PriorityConfig>,
): ColumnDef<SupportTask, any>[] {
  return [
    columnHelper.accessor('title', {
      header: 'Task',
      cell: ({ row }) => (
        <TaskCell>
          <TaskTitleLine>
            <TaskIdPrefix type={TextTypes.Body7} tag="span">
              #{row.original.id}:
            </TaskIdPrefix>
            <Text type={TextTypes.Body6} bold tag="span">
              {row.original.title}
            </Text>
          </TaskTitleLine>
          <TaskDesc>
            {resolveAttachmentWidgetText(row.original.description)}
          </TaskDesc>
        </TaskCell>
      ),
    }),
    columnHelper.accessor('status', {
      header: 'Status',
      cell: ({ getValue }) => {
        const cfg = STATUS_CONFIG[getValue() as TaskStatus];
        return (
          <Tag
            bold
            size={TagSizes.small}
            appearance={TagAppearance.outline}
            color={cfg.color}
          >
            {cfg.label}
          </Tag>
        );
      },
    }),
    columnHelper.accessor('priority', {
      header: 'Priority',
      cell: ({ getValue }) => {
        const cfg = priorityConfig[getValue() as TaskPriority];
        return (
          <Tag
            bold
            size={TagSizes.small}
            appearance={TagAppearance.outline}
            color={cfg.color}
          >
            {cfg.label}
          </Tag>
        );
      },
    }),
    columnHelper.display({
      id: 'type',
      header: 'Type',
      cell: ({ row }) => {
        const cfg = getActionTypeConfig(row.original.action?.action_type ?? '');
        return (
          <Tag
            bold
            size={TagSizes.small}
            appearance={TagAppearance.outline}
            color={cfg.color}
          >
            {cfg.label}
          </Tag>
        );
      },
    }),
    columnHelper.display({
      id: 'assigned_to',
      header: 'Assigned to',
      cell: ({ row }) => {
        const profiles = row.original.assignee_profiles;
        if (!profiles.length)
          return <UnassignedText>— Unassigned</UnassignedText>;
        const profile = profiles[0];
        return (
          <UserCell>
            <UserImage
              alt={`${profile.first_name} ${profile.second_name}`}
              user={profile}
              dimensions={{ width: 28, height: 28 }}
            />
            <UserName>
              {profile.first_name} {profile.second_name}
              {profiles.length > 1 ? ` +${profiles.length - 1}` : ''}
            </UserName>
          </UserCell>
        );
      },
    }),
    columnHelper.accessor('updated_at', {
      header: 'Updated',
      cell: ({ getValue }) => (
        <Text>{formatTimeDistance(getValue(), new Date())}</Text>
      ),
    }),
  ];
}

const UserSupportTasks = ({ user }: { user: any }) => {
  const priorityConfig = useTaskPriorities();
  const { data, isLoading } = useSWR(
    user?.id ? ['user_support_tasks', user.id] : null,
    () =>
      fetchSupportTasks({
        related_user: String(user.id),
        sort_by: 'updated_at',
        sort_order: 'desc',
        page_size: 50,
      }),
  );

  const columns = useMemo(() => buildColumns(priorityConfig), [priorityConfig]);

  if (isLoading)
    return (
      <EmptyState>
        <Text>Loading tasks…</Text>
      </EmptyState>
    );

  if (!data?.results.length)
    return (
      <EmptyState>
        <Text>No support tasks for this user.</Text>
      </EmptyState>
    );

  return (
    <DataTable
      columns={columns}
      data={data.results}
      getRowLink={task => getSupportTaskDetailRoute(task.id)}
    />
  );
};

export default UserSupportTasks;
