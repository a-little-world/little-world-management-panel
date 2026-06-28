import {
  Checkbox,
  Button as DSButton,
  Select,
  Tag,
  TagAppearance,
  TagSizes,
  Text,
  TextTypes,
} from '@a-little-world/little-world-design-system';
import { ArrowsUpDownIcon } from '@heroicons/react/20/solid';
import { ColumnDef, createColumnHelper } from '@tanstack/react-table';
import {
  ActivityIcon,
  CheckIcon,
  ChevronDownIcon,
  ChevronUpIcon,
  ClockIcon,
} from 'lucide-react';
import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import styled from 'styled-components';
import useSWR from 'swr';

import {
  PaginatedSupportTaskList,
  STATUS_CONFIG,
  SupportTask,
  SupportTaskListParams,
  TaskPriority,
  TaskStatus,
  BulkSupportTaskAction,
  bulkSupportTasks,
  fetchStaffUsers,
  fetchSupportTaskStats,
  fetchSupportTasks,
  getActionTypeConfig,
} from '../../api/supportTasks';
import {
  BLUE_10,
  BLUE_40,
  GREEN_10,
  GREEN_40,
  ORANGE_10,
  ORANGE_40,
} from '../../constants';
import { formatTimeDistance } from '../../helpers/date';
import {
  PriorityConfig,
  useTaskPriorities,
} from '../../hooks/useTaskPriorities';
import { getSupportTaskDetailRoute } from '../../router/routes';
import { useCurrentUserId } from '../../store';
import { Button } from '../atoms/Button';
import SelectBox from '../atoms/SelectBox';
import UserImage from '../atoms/UserImage';
import CreateSupportTaskModal from '../blocks/CreateSupportTaskModal';
import { DataTable } from '../blocks/DataTable';
import {
  DownloadSettingsModal,
  ExportDownloadFormat,
} from '../blocks/DownloadSettingsModal';
import FiltersToolbar from '../blocks/FiltersToolbar';
import SupportTaskFilters, {
  TaskFilterKeys,
  containsTaskFilterKey,
} from '../blocks/SupportTaskFilters';

// ─── Styled components ────────────────────────────────────────────────────────

const PageWrapper = styled.div`
  flex: 1;
  overflow-y: auto;
  background: ${({ theme }) => theme.color.surface.primary};
  display: flex;
  flex-direction: column;
`;

const SummaryGrid = styled.div`
  padding: ${({ theme }) => theme.spacing.medium}
    ${({ theme }) => theme.spacing.xlarge} 0;
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: ${({ theme }) => theme.spacing.small};
`;

const TileCard = styled.div`
  background: ${({ theme }) => theme.color.surface.primary};
  border: 1px solid ${({ theme }) => theme.color.border.subtle};
  border-radius: ${({ theme }) => theme.radius.large};
  padding: 20px 22px;
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: ${({ theme }) => theme.spacing.xsmall};
  box-shadow: 0 1px 25px 1px rgba(0, 0, 0, 0.04);
`;

const TileLabel = styled.div`
  font-size: 12px;
  color: ${({ theme }) => theme.color.text.tertiary};
  text-transform: uppercase;
  letter-spacing: 0.08em;
  margin-bottom: ${({ theme }) => theme.spacing.xxsmall};
  font-weight: 500;
`;

const TileValue = styled.div`
  font-family: 'Work Sans', system-ui, sans-serif;
  font-weight: 700;
  font-size: 36px;
  line-height: 1;
  color: ${({ theme }) => theme.color.text.title};
`;

const TileIcon = styled.div<{ $bg: string; $color: string }>`
  width: 52px;
  height: 52px;
  border-radius: ${({ theme }) => theme.radius.small};
  flex-shrink: 0;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  background: ${({ $bg }) => $bg};
  color: ${({ $color }) => $color};
`;

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

const TaskIdPrefix = styled(Text).attrs({
  type: TextTypes.Body7,
  tag: 'span' as const,
})`
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

const AgeText = styled.span<{ $warn?: boolean }>`
  white-space: nowrap;
  font-size: 13px;
  font-variant-numeric: tabular-nums;
  color: ${({ $warn, theme }) =>
    $warn ? theme.color.text.title : theme.color.text.secondary};
  font-weight: ${({ $warn }) => ($warn ? 600 : 400)};
`;

const CenteredCell = styled.div`
  display: flex;
  justify-content: center;
`;

const QuickFilters = styled.div`
  display: inline-flex;
  align-items: center;
  gap: ${({ theme }) => theme.spacing.medium};
`;

const BulkActions = styled.div`
  display: inline-flex;
  align-items: flex-end;
  gap: ${({ theme }) => theme.spacing.xsmall};
`;

const BulkActionSelect = styled.div`
  width: 11rem;
`;

const BULK_ACTION_OPTIONS: { value: BulkSupportTaskAction; label: string }[] =
  [
    { value: 'delete', label: 'Delete' },
    { value: 'complete', label: 'Complete' },
    { value: 'cancel', label: 'Cancel' },
  ];

// ─── Helpers ──────────────────────────────────────────────────────────────────

const TASK_EXPORT_HEADERS = [
  'id',
  'title',
  'description',
  'status',
  'priority',
  'related_user_profile.id',
  'related_user_profile.first_name',
  'related_user_profile.second_name',
  'assigned_to_profile.id',
  'assigned_to_profile.first_name',
  'assigned_to_profile.second_name',
  'created_by_profile.id',
  'created_by_profile.first_name',
  'created_by_profile.second_name',
  'created_at',
  'updated_at',
];

const DEFAULT_EXPORT_HEADERS = [
  'id',
  'title',
  'status',
  'priority',
  'created_at',
];

const DEFAULT_STATUS_FILTERS: TaskStatus[] = ['NEW', 'IN_PROGRESS'];

const EMPTY_TASKS: SupportTask[] = [];

function pruneSelectedRows(current: number[], tasks: SupportTask[]): number[] {
  if (!current.length || !tasks.length) {
    return current.length ? [] : current;
  }
  const next = current.filter(id => tasks.some(task => task.id === id));
  if (
    next.length === current.length &&
    next.every((id, index) => id === current[index])
  ) {
    return current;
  }
  return next;
}

// ─── Column definitions ───────────────────────────────────────────────────────

const columnHelper = createColumnHelper<SupportTask>();

function SortIcon({
  field,
  sortBy,
  sortOrder,
}: {
  field: string;
  sortBy: string;
  sortOrder: 'asc' | 'desc';
}) {
  if (sortBy !== field) return <ArrowsUpDownIcon className="ml-2 h-4 w-4" />;
  return sortOrder === 'asc' ? (
    <ChevronUpIcon size={14} className="ml-2" />
  ) : (
    <ChevronDownIcon size={14} className="ml-2" />
  );
}

function buildColumns(
  sortBy: string,
  sortOrder: 'asc' | 'desc',
  onSort: (field: string) => void,
  priorityConfig: Record<TaskPriority, PriorityConfig>,
  selectedRows: number[],
  onToggleRow: (id: number) => void,
): ColumnDef<SupportTask, any>[] {
  return [
    columnHelper.display({
      id: 'select',
      header: 'Selected',
      cell: ({ row }) => (
        <CenteredCell
          onClick={event => event.stopPropagation()}
          onMouseDown={event => event.stopPropagation()}
        >
          <SelectBox
            checked={selectedRows.includes(row.original.id)}
            onChange={() => onToggleRow(row.original.id)}
          />
        </CenteredCell>
      ),
    }),
    columnHelper.accessor('title', {
      header: () => (
        <Button variant="ghost" onClick={() => onSort('title')}>
          Task <SortIcon field="title" sortBy={sortBy} sortOrder={sortOrder} />
        </Button>
      ),
      cell: ({ row }) => (
        <TaskCell>
          <TaskTitleLine>
            <TaskIdPrefix>#{row.original.id}:</TaskIdPrefix>
            <Text type={TextTypes.Body6} bold tag="span">
              {row.original.title}
            </Text>
          </TaskTitleLine>
          <TaskDesc>{row.original.description}</TaskDesc>
        </TaskCell>
      ),
    }),
    columnHelper.accessor('status', {
      header: () => (
        <Button variant="ghost" onClick={() => onSort('status')}>
          Status{' '}
          <SortIcon field="status" sortBy={sortBy} sortOrder={sortOrder} />
        </Button>
      ),
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
      header: () => (
        <Button variant="ghost" onClick={() => onSort('priority')}>
          Priority{' '}
          <SortIcon field="priority" sortBy={sortBy} sortOrder={sortOrder} />
        </Button>
      ),
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
      id: 'created_by',
      header: 'Created by',
      cell: ({ row }) => {
        const profile = row.original.created_by_profile;
        if (!profile) return <UnassignedText>— System</UnassignedText>;
        return (
          <UserCell>
            <UserImage
              alt={`${profile.first_name} ${profile.second_name}`}
              user={profile}
              dimensions={{ width: 28, height: 28 }}
            />
            <UserName>
              {profile.first_name} {profile.second_name}
            </UserName>
          </UserCell>
        );
      },
    }),
    columnHelper.display({
      id: 'related_user',
      header: 'Related user',
      cell: ({ row }) => {
        const profile = row.original.related_user_profile;
        if (!profile) return <UnassignedText>—</UnassignedText>;
        return (
          <UserCell>
            <UserImage
              alt={`${profile.first_name} ${profile.second_name}`}
              user={profile}
              dimensions={{ width: 28, height: 28 }}
            />
            <UserName>
              {profile.first_name} {profile.second_name}
            </UserName>
          </UserCell>
        );
      },
    }),
    columnHelper.display({
      id: 'assigned_to',
      header: 'Assigned to',
      cell: ({ row }) => {
        const profile = row.original.assigned_to_profile;
        if (!profile) return <UnassignedText>— Unassigned</UnassignedText>;
        return (
          <UserCell>
            <UserImage
              alt={`${profile.first_name} ${profile.second_name}`}
              user={profile}
              dimensions={{ width: 28, height: 28 }}
            />
            <UserName>
              {profile.first_name} {profile.second_name}
            </UserName>
          </UserCell>
        );
      },
    }),
    columnHelper.accessor('created_at', {
      header: () => (
        <Button variant="ghost" onClick={() => onSort('created_at')}>
          Created{' '}
          <SortIcon field="created_at" sortBy={sortBy} sortOrder={sortOrder} />
        </Button>
      ),
      cell: ({ getValue }) => {
        return <Text>{formatTimeDistance(getValue(), new Date())}</Text>;
      },
    }),
    columnHelper.accessor('updated_at', {
      header: () => (
        <Button variant="ghost" onClick={() => onSort('updated_at')}>
          Updated{' '}
          <SortIcon field="updated_at" sortBy={sortBy} sortOrder={sortOrder} />
        </Button>
      ),
      cell: ({ getValue }) => (
        <Text>{formatTimeDistance(getValue(), new Date())}</Text>
      ),
    }),
  ];
}

// ─── Summary tile ─────────────────────────────────────────────────────────────

function SummaryTile({
  label,
  value,
  icon,
  accentBg,
  accentColor,
}: {
  label: string;
  value: number;
  icon: React.ReactNode;
  accentBg: string;
  accentColor: string;
}) {
  return (
    <TileCard>
      <div>
        <TileLabel>{label}</TileLabel>
        <TileValue>{value}</TileValue>
      </div>
      <TileIcon $bg={accentBg} $color={accentColor}>
        {icon}
      </TileIcon>
    </TileCard>
  );
}

// ─── Main component ───────────────────────────────────────────────────────────

export default function SupportTasksOverview() {
  const priorityConfig = useTaskPriorities();

  const [searchParams, setSearchParams] = useSearchParams();
  const currentUserId = useCurrentUserId();
  const [filtersOpen, setFiltersOpen] = useState(false);
  const [downloadSettingsOpen, setDownloadSettingsOpen] = useState(false);
  const [createOpen, setCreateOpen] = useState(false);
  const [downloadFormat, setDownloadFormat] =
    useState<ExportDownloadFormat>('csv');
  const [selectedHeaders, setSelectedHeaders] = useState<string[]>(
    DEFAULT_EXPORT_HEADERS,
  );
  const [availableHeaders, setAvailableHeaders] =
    useState<string[]>(TASK_EXPORT_HEADERS);
  const [selectedRows, setSelectedRows] = useState<number[]>([]);
  const [bulkAction, setBulkAction] = useState<BulkSupportTaskAction | ''>('');
  const [bulkRunning, setBulkRunning] = useState(false);
  const [bulkError, setBulkError] = useState<string | null>(null);

  const statusFilters = searchParams.getAll('status');
  const effectiveStatusFilters = (statusFilters.length
    ? statusFilters
    : DEFAULT_STATUS_FILTERS) as TaskStatus[];
  const sortBy = searchParams.get('sort_by') ?? 'created_at';
  const sortOrder = (searchParams.get('sort_order') ?? 'desc') as
    | 'asc'
    | 'desc';
  const search = searchParams.get('search') ?? '';
  const assignedToFilter = searchParams.get(TaskFilterKeys.AssignedTo) ?? '';

  const params = useMemo(
    (): SupportTaskListParams => ({
      status: effectiveStatusFilters,
      priority: searchParams.getAll(TaskFilterKeys.Priority),
      action_type: searchParams.getAll(TaskFilterKeys.ActionType),
      assigned_to: searchParams.get(TaskFilterKeys.AssignedTo) || undefined,
      sort_by: searchParams.get('sort_by') || undefined,
      sort_order: (searchParams.get('sort_order') || undefined) as
        | 'asc'
        | 'desc'
        | undefined,
      search: searchParams.get('search') || undefined,
      page: Number(searchParams.get('page')) || undefined,
      page_size: Number(searchParams.get('page_size')) || undefined,
    }),
    [searchParams, effectiveStatusFilters],
  );

  const {
    data: taskList,
    isLoading,
    mutate: mutateTasks,
  } = useSWR<PaginatedSupportTaskList>(params, fetchSupportTasks);

  const tasks = taskList?.results ?? EMPTY_TASKS;

  useEffect(() => {
    setSelectedRows(current => pruneSelectedRows(current, tasks));
  }, [tasks]);

  const toggleSelectedRow = useCallback((id: number) => {
    setSelectedRows(current =>
      current.includes(id)
        ? current.filter(rowId => rowId !== id)
        : [...current, id],
    );
  }, []);

  const { data: stats, mutate: mutateTaskStats } = useSWR(
    'support_task_stats',
    fetchSupportTaskStats,
  );

  const runBulkAction = async () => {
    if (!bulkAction || !selectedRows.length) return;

    if (
      bulkAction === 'delete' &&
      !window.confirm(
        `Delete ${selectedRows.length} selected task${selectedRows.length === 1 ? '' : 's'}? This cannot be undone.`,
      )
    ) {
      return;
    }

    setBulkRunning(true);
    setBulkError(null);
    try {
      const result = await bulkSupportTasks(selectedRows, bulkAction);
      if (result.failed.length) {
        const summary = result.failed
          .slice(0, 3)
          .map(item => `#${item.id}: ${item.error}`)
          .join('; ');
        setBulkError(
          result.succeeded.length
            ? `Completed ${result.succeeded.length}, failed ${result.failed.length}. ${summary}`
            : summary,
        );
      }
      if (result.succeeded.length) {
        setSelectedRows(current =>
          current.filter(id => !result.succeeded.includes(id)),
        );
        await Promise.all([mutateTasks(), mutateTaskStats()]);
      }
      if (!result.failed.length) {
        setBulkAction('');
      }
    } catch (error) {
      setBulkError(
        error instanceof Error ? error.message : 'Bulk action failed',
      );
    } finally {
      setBulkRunning(false);
    }
  };

  const counts = {
    NEW: stats?.NEW ?? 0,
    IN_PROGRESS: stats?.IN_PROGRESS ?? 0,
    COMPLETED: stats?.COMPLETED ?? 0,
  };

  const { data: staffUsers = [] } = useSWR('staff_users', fetchStaffUsers);

  const showNew = effectiveStatusFilters.includes('NEW');
  const showInProgress = effectiveStatusFilters.includes('IN_PROGRESS');
  const showCompleted = effectiveStatusFilters.includes('COMPLETED');
  const onlyMe =
    currentUserId !== null && assignedToFilter === String(currentUserId);

  const toggleStatusFilter = (s: string) => {
    const next = new URLSearchParams(searchParams);
    next.delete('page');
    const current = next.getAll('status').length
      ? next.getAll('status')
      : [...DEFAULT_STATUS_FILTERS];
    next.delete('status');
    if (current.includes(s)) {
      current.filter(v => v !== s).forEach(v => next.append('status', v));
    } else {
      [...current, s].forEach(v => next.append('status', v));
    }
    setSearchParams(next);
  };

  const toggleOnlyMe = () => {
    if (onlyMe) {
      removeSearchParam(TaskFilterKeys.AssignedTo);
    } else if (currentUserId !== null) {
      updateSearchParam(TaskFilterKeys.AssignedTo, String(currentUserId));
    }
  };

  const onSort = useCallback(
    (field: string) => {
      const next = new URLSearchParams(searchParams);
      next.delete('page');
      if (field === sortBy) {
        next.set('sort_order', sortOrder === 'asc' ? 'desc' : 'asc');
      } else {
        next.set('sort_by', field);
        next.set('sort_order', 'desc');
      }
      setSearchParams(next);
    },
    [sortBy, sortOrder, searchParams, setSearchParams],
  );

  const columns = useMemo(
    () =>
      buildColumns(
        sortBy,
        sortOrder,
        onSort,
        priorityConfig,
        selectedRows,
        toggleSelectedRow,
      ),
    [sortBy, sortOrder, onSort, priorityConfig, selectedRows, toggleSelectedRow],
  );

  const updateSearchParam = (key: string, value: string | string[]) => {
    const next = new URLSearchParams(searchParams);
    next.delete('page');
    if (!value || (Array.isArray(value) && !value.length)) {
      next.delete(key);
    } else if (Array.isArray(value)) {
      next.delete(key);
      value.forEach(v => next.append(key, v));
    } else {
      next.set(key, value);
    }
    setSearchParams(next);
  };

  const removeSearchParam = (key: string) => {
    const next = new URLSearchParams(searchParams);
    next.delete('page');
    next.delete(key);
    setSearchParams(next);
  };

  const currentFilters = useMemo(() => {
    const obj: Record<string, string> = {};
    searchParams.forEach((v, k) => {
      obj[k] = v;
    });
    return obj;
  }, [searchParams]);

  const handleDownload = () => {
    const headers = selectedHeaders.length
      ? selectedHeaders
      : TASK_EXPORT_HEADERS;
    const a = document.createElement('a');
    if (downloadFormat === 'json') {
      const jsonRows = tasks.map(task =>
        headers.reduce<Record<string, unknown>>((acc, header) => {
          acc[header] = (task as any)[header];
          return acc;
        }, {}),
      );
      a.href = URL.createObjectURL(
        new Blob([JSON.stringify(jsonRows, null, 2)], {
          type: 'application/json;charset=utf-8;',
        }),
      );
      a.download = `support-tasks-${new Date().toLocaleDateString('de')}.json`;
    } else {
      const rows = tasks.map(task =>
        headers
          .map(h => {
            const val = (task as any)[h];
            const str = val === null || val === undefined ? '' : String(val);
            return str.includes(',') || str.includes('"')
              ? `"${str.replace(/"/g, '""')}"`
              : str;
          })
          .join(','),
      );
      const csv = [headers.join(','), ...rows].join('\n');
      a.href = URL.createObjectURL(
        new Blob([csv], { type: 'text/csv;charset=utf-8;' }),
      );
      a.download = `support-tasks-${new Date().toLocaleDateString('de')}.csv`;
    }
    a.click();
  };

  return (
    <PageWrapper>
      <SummaryGrid>
        <SummaryTile
          label="New"
          value={counts.NEW}
          accentBg={BLUE_10}
          accentColor={BLUE_40}
          icon={<ActivityIcon size={24} />}
        />
        <SummaryTile
          label="In progress"
          value={counts.IN_PROGRESS}
          accentBg={ORANGE_10}
          accentColor={ORANGE_40}
          icon={<ClockIcon size={24} />}
        />
        <SummaryTile
          label="Completed"
          value={counts.COMPLETED}
          accentBg={GREEN_10}
          accentColor={GREEN_40}
          icon={<CheckIcon size={24} />}
        />
      </SummaryGrid>

      <FiltersToolbar
        showSearchBar
        searchPlaceholder="Search by title or task ID…"
        searchDefaultValue={search}
        onSearchSubmit={s => updateSearchParam('search', s)}
        showFiltersButton
        filtersActive={containsTaskFilterKey(currentFilters)}
        onFiltersClick={() => setFiltersOpen(true)}
        showDownloadButton
        downloadDisabled={isLoading || !taskList?.count}
        onDownloadClick={handleDownload}
        showSettingsButton
        settingsDisabled={isLoading}
        onSettingsClick={() => setDownloadSettingsOpen(true)}
        paginationList={taskList}
        isLoading={isLoading}
        loadingText="Loading tasks…"
      >
        <QuickFilters>
          <Checkbox
            id="show_new"
            name="show_new"
            label="New"
            checked={showNew}
            onCheckedChange={() => toggleStatusFilter('NEW')}
          />
          <Checkbox
            id="show_in_progress"
            name="show_in_progress"
            label="In progress"
            checked={showInProgress}
            onCheckedChange={() => toggleStatusFilter('IN_PROGRESS')}
          />
          <Checkbox
            id="show_completed"
            name="show_completed"
            label="Completed"
            checked={showCompleted}
            onCheckedChange={() => toggleStatusFilter('COMPLETED')}
          />
          {currentUserId !== null && (
            <Checkbox
              id="assigned_to_me"
              name="assigned_to_me"
              label="Assigned to me"
              checked={onlyMe}
              onCheckedChange={toggleOnlyMe}
            />
          )}
          {selectedRows.length > 0 && (
            <BulkActions>
              <BulkActionSelect>
                <Select
                  label={`Actions (${selectedRows.length} selected)`}
                  value={bulkAction}
                  options={BULK_ACTION_OPTIONS}
                  onValueChange={value =>
                    setBulkAction(value as BulkSupportTaskAction)
                  }
                  placeholder="Choose action"
                  cannotError
                />
              </BulkActionSelect>
              {bulkAction && (
                <DSButton
                  disabled={bulkRunning}
                  onClick={runBulkAction}
                >
                  {bulkRunning ? 'Running…' : 'Run'}
                </DSButton>
              )}
            </BulkActions>
          )}
          {bulkError && (
            <Text type={TextTypes.Body7} tag="span">
              {bulkError}
            </Text>
          )}
          <DSButton onClick={() => setCreateOpen(true)}>New task</DSButton>
        </QuickFilters>
      </FiltersToolbar>

      {isLoading ? (
        <Text center>Loading tasks…</Text>
      ) : (
        <DataTable
          columns={columns}
          data={tasks}
          getRowLink={task => getSupportTaskDetailRoute(task.id)}
        />
      )}

      <SupportTaskFilters
        open={filtersOpen}
        onClose={() => setFiltersOpen(false)}
        defaultValues={currentFilters}
        onUpdateFilters={updateSearchParam}
        onRemoveFilter={removeSearchParam}
        staffUsers={staffUsers}
      />

      <DownloadSettingsModal
        selectedFormat={downloadFormat}
        selectedHeaders={selectedHeaders}
        setSelectedFormat={setDownloadFormat}
        setSelectedHeaders={setSelectedHeaders}
        open={downloadSettingsOpen}
        onClose={() => setDownloadSettingsOpen(false)}
        onSave={headers => setSelectedHeaders(headers)}
        availableHeaders={availableHeaders}
        title="Task Export Settings"
        description="Choose which task fields to include in the CSV export."
      />

      {/* <SupportTaskModal
        open={createOpen}
        onClose={() => setCreateOpen(false)}
        staffUsers={staffUsers}
        onCreated={() => mutate}
      /> */}
      <CreateSupportTaskModal
        open={createOpen}
        onClose={() => setCreateOpen(false)}
        staffUsers={staffUsers}
        onCreated={() => {
          mutateTasks();
          mutateTaskStats();
        }}
      />
    </PageWrapper>
  );
}
