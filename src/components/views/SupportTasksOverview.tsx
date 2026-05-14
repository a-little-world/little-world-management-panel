import {
  Checkbox,
  Dropdown,
  Tag,
  TagAppearance,
  TagSizes,
  Text,
} from '@a-little-world/little-world-design-system';
import { ArrowsUpDownIcon } from '@heroicons/react/20/solid';
import { ColumnDef, createColumnHelper } from '@tanstack/react-table';
import {
  ActivityIcon,
  CheckIcon,
  ChevronDownIcon,
  ChevronUpIcon,
  ClockIcon,
  EyeIcon,
  MoreHorizontalIcon,
} from 'lucide-react';
import React, { useCallback, useMemo, useState } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import styled from 'styled-components';
import useSWR from 'swr';

import {
  SupportTask,
  TaskPriority,
  TaskStatus,
  fetchStaffUsers,
  fetchSupportTasks,
} from '../../api/supportTasks';
import { formatTimeDistance } from '../../helpers/date';
import { getSupportTaskDetailRoute } from '../../routes';
import { useCurrentUserId } from '../../store';
import { Button } from '../atoms/Button';
import UserImage from '../atoms/UserImage';
import { DataTable } from '../blocks/DataTable';
import { DownloadSettingsModal } from '../blocks/DownloadSettingsModal';
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
  gap: 12px;
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

const TileSub = styled.div`
  font-size: 13px;
  color: ${({ theme }) => theme.color.text.tertiary};
  margin-top: ${({ theme }) => theme.spacing.xxsmall};
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

const TaskTitle = styled.span`
  font-size: 14px;
  font-weight: 600;
`;

const TaskDesc = styled.span`
  font-size: 12px;
  color: ${({ theme }) => theme.color.text.tertiary};
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
  max-width: 300px;
`;

const MonoId = styled.span`
  font-family: source-code-pro, Menlo, Monaco, monospace;
  font-size: 12px;
  color: ${({ theme }) => theme.color.text.tertiary};
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

const RowActions = styled.div`
  display: inline-flex;
  gap: 4px;
`;

const RowActionBtn = styled.button`
  width: 32px;
  height: 32px;
  border-radius: ${({ theme }) => theme.radius.xxsmall};
  background: transparent;
  border: 1px solid transparent;
  cursor: pointer;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  color: ${({ theme }) => theme.color.text.tertiary};
  transition: all 0.15s;

  &:hover {
    background: ${({ theme }) => theme.color.surface.primary};
    border-color: ${({ theme }) => theme.color.border.subtle};
  }
`;

const RowActionLink = styled(Link)`
  width: 32px;
  height: 32px;
  border-radius: ${({ theme }) => theme.radius.xxsmall};
  background: transparent;
  border: 1px solid transparent;
  cursor: pointer;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  color: ${({ theme }) => theme.color.text.tertiary};
  text-decoration: none;
  transition: all 0.15s;

  &:hover {
    background: ${({ theme }) => theme.color.surface.secondary};
    border-color: ${({ theme }) => theme.color.border.subtle};
  }
`;

const QuickFilters = styled.div`
  display: inline-flex;
  align-items: center;
  gap: ${({ theme }) => theme.spacing.medium};
`;

// ─── Design token constants ───────────────────────────────────────────────────

const BLUE_10 = '#f3fbff';
const BLUE_40 = '#0063af';
const ORANGE_10 = '#fde5cf';
const ORANGE_40 = '#db590b';
const GREEN_10 = '#c7ebd1';
const GREEN_40 = '#045e45';
const YELLOW_10 = '#fef9d9';

// ─── Helpers ──────────────────────────────────────────────────────────────────

const STATUS_CONFIG: Record<TaskStatus, { label: string; color: string }> = {
  NEW: { label: 'New', color: BLUE_40 },
  IN_PROGRESS: { label: 'In progress', color: ORANGE_40 },
  COMPLETED: { label: 'Completed', color: GREEN_40 },
};

const PRIORITY_CONFIG: Record<TaskPriority, { label: string; color: string }> =
  {
    LOW: { label: 'Low', color: '#6d6d6d' },
    MEDIUM: { label: 'Medium', color: BLUE_40 },
    HIGH: { label: 'High', color: ORANGE_40 },
    URGENT: { label: 'Urgent', color: '#c93333' },
  };

const ACTION_TYPE_CONFIG: Record<string, { label: string; color: string }> = {
  support_reply: { label: 'Support reply', color: BLUE_40 },
  message_action_remove_match: { label: 'Remove match', color: '#8a2a2a' },
  profile_change_action_country_of_residence: {
    label: 'Country change',
    color: '#7a4a00',
  },
  message_action_change_user_type: {
    label: 'Change user type',
    color: ORANGE_40,
  },
  profile_action_suspicious_profile: {
    label: 'Suspicious profile',
    color: '#4a1f1f',
  },
  profile_action_too_empty_profile: {
    label: 'Incomplete profile',
    color: '#5b2c87',
  },
};

function getActionTypeConfig(actionType: string) {
  return (
    ACTION_TYPE_CONFIG[actionType] ?? {
      label: actionType.replace(/_/g, ' '),
      color: '#6d6d6d',
    }
  );
}

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

const ALL_STATUSES = 'ALL';

const STATUS_OPTIONS = [
  { value: ALL_STATUSES, label: 'All statuses' },
  { value: 'NEW', label: 'New' },
  { value: 'IN_PROGRESS', label: 'In progress' },
  { value: 'COMPLETED', label: 'Completed' },
];

const SORT_BY_OPTIONS = [
  { value: 'created_at', label: 'Created' },
  { value: 'updated_at', label: 'Updated' },
  { value: 'id', label: 'ID' },
  { value: 'title', label: 'Title' },
  { value: 'status', label: 'Status' },
  { value: 'priority', label: 'Priority' },
];

const SORT_ORDER_OPTIONS = [
  { value: 'desc', label: 'Descending' },
  { value: 'asc', label: 'Ascending' },
];

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
): ColumnDef<SupportTask, any>[] {
  return [
    columnHelper.accessor('id', {
      header: () => (
        <Button variant="ghost" onClick={() => onSort('id')}>
          ID <SortIcon field="id" sortBy={sortBy} sortOrder={sortOrder} />
        </Button>
      ),
      cell: ({ getValue }) => <MonoId>#{getValue()}</MonoId>,
    }),
    columnHelper.accessor('title', {
      header: () => (
        <Button variant="ghost" onClick={() => onSort('title')}>
          Task <SortIcon field="title" sortBy={sortBy} sortOrder={sortOrder} />
        </Button>
      ),
      cell: ({ row }) => (
        <TaskCell>
          <TaskTitle>{row.original.title}</TaskTitle>
          <TaskDesc>{row.original.description}</TaskDesc>
        </TaskCell>
      ),
    }),
    columnHelper.accessor('status', {
      header: () => (
        <Button variant="ghost" onClick={() => onSort('status')}>
          Status <SortIcon field="status" sortBy={sortBy} sortOrder={sortOrder} />
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
          Priority <SortIcon field="priority" sortBy={sortBy} sortOrder={sortOrder} />
        </Button>
      ),
      cell: ({ getValue }) => {
        const cfg = PRIORITY_CONFIG[getValue() as TaskPriority];
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
          Created <SortIcon field="created_at" sortBy={sortBy} sortOrder={sortOrder} />
        </Button>
      ),
      cell: ({ getValue }) => {
        const isOld =
          Date.now() - new Date(getValue()).getTime() > 2 * 60 * 60 * 1000;
        return (
          <AgeText $warn={isOld}>
            {formatTimeDistance(getValue(), new Date())}
          </AgeText>
        );
      },
    }),
    columnHelper.accessor('updated_at', {
      header: () => (
        <Button variant="ghost" onClick={() => onSort('updated_at')}>
          Updated <SortIcon field="updated_at" sortBy={sortBy} sortOrder={sortOrder} />
        </Button>
      ),
      cell: ({ getValue }) => (
        <AgeText>{formatTimeDistance(getValue(), new Date())}</AgeText>
      ),
    }),
    columnHelper.display({
      id: 'actions',
      header: '',
      cell: ({ row }) => (
        <RowActions>
          <RowActionLink
            to={getSupportTaskDetailRoute(row.original.id)}
            onClick={e => e.stopPropagation()}
          >
            <EyeIcon size={16} />
          </RowActionLink>
          <RowActionBtn>
            <MoreHorizontalIcon size={16} />
          </RowActionBtn>
        </RowActions>
      ),
    }),
  ];
}

// ─── Summary tile ─────────────────────────────────────────────────────────────

function SummaryTile({
  label,
  value,
  sub,
  icon,
  accentBg,
  accentColor,
}: {
  label: string;
  value: number;
  sub: string;
  icon: React.ReactNode;
  accentBg: string;
  accentColor: string;
}) {
  return (
    <TileCard>
      <div>
        <TileLabel>{label}</TileLabel>
        <TileValue>{value}</TileValue>
        <TileSub>{sub}</TileSub>
      </div>
      <TileIcon $bg={accentBg} $color={accentColor}>
        {icon}
      </TileIcon>
    </TileCard>
  );
}

// ─── Main component ───────────────────────────────────────────────────────────

export default function SupportTasksOverview() {
  const [searchParams, setSearchParams] = useSearchParams();
  const currentUserId = useCurrentUserId();
  const [filtersOpen, setFiltersOpen] = useState(false);
  const [downloadSettingsOpen, setDownloadSettingsOpen] = useState(false);
  const [selectedHeaders, setSelectedHeaders] = useState<string[]>(
    DEFAULT_EXPORT_HEADERS,
  );
  const [availableHeaders, setAvailableHeaders] =
    useState<string[]>(TASK_EXPORT_HEADERS);

  const statusParam = searchParams.get('status') ?? ALL_STATUSES;
  const statusFilter = statusParam === ALL_STATUSES ? '' : statusParam;
  const sortBy = searchParams.get('sort_by') ?? 'created_at';
  const sortOrder = (searchParams.get('sort_order') ?? 'desc') as
    | 'asc'
    | 'desc';
  const search = searchParams.get('search') ?? '';

  const {
    data: tasks = [],
    isLoading,
    mutate,
  } = useSWR(['support_tasks', statusFilter, sortBy, sortOrder], () =>
    fetchSupportTasks({
      status: statusFilter || undefined,
      sort_by: sortBy,
      sort_order: sortOrder,
    }),
  );

  const { data: staffUsers = [] } = useSWR('staff_users', fetchStaffUsers);

  const staffById = useMemo(() => {
    const m: Record<number, (typeof staffUsers)[0]> = {};
    staffUsers.forEach(u => {
      m[u.id] = u;
    });
    return m;
  }, [staffUsers]);

  const priorityFilter = searchParams.getAll(TaskFilterKeys.Priority);
  const actionTypeFilter = searchParams.getAll(TaskFilterKeys.ActionType);
  const assignedToFilter = searchParams.get(TaskFilterKeys.AssignedTo) ?? '';

  const onlyNew = statusParam === 'NEW';
  const onlyMe =
    currentUserId !== null && assignedToFilter === String(currentUserId);

  const toggleOnlyNew = () => {
    updateSearchParam('status', onlyNew ? ALL_STATUSES : 'NEW');
  };

  const toggleOnlyMe = () => {
    if (onlyMe) {
      removeSearchParam(TaskFilterKeys.AssignedTo);
    } else if (currentUserId !== null) {
      updateSearchParam(TaskFilterKeys.AssignedTo, String(currentUserId));
    }
  };

  const filtered = useMemo(() => {
    let result = tasks;
    if (search.trim()) {
      const q = search.toLowerCase();
      result = result.filter(
        t => t.title.toLowerCase().includes(q) || String(t.id).includes(q),
      );
    }
    if (priorityFilter.length) {
      result = result.filter(t => priorityFilter.includes(t.priority));
    }
    if (actionTypeFilter.length) {
      result = result.filter(t =>
        actionTypeFilter.includes(t.action?.action_type ?? ''),
      );
    }
    if (assignedToFilter === 'unassigned') {
      result = result.filter(t => !t.assigned_to_profile);
    } else if (assignedToFilter) {
      result = result.filter(
        t => String(t.assigned_to_profile?.id) === assignedToFilter,
      );
    }
    return result;
  }, [tasks, search, priorityFilter, actionTypeFilter, assignedToFilter]);

  const counts = useMemo(
    () => ({
      NEW: tasks.filter(t => t.status === 'NEW').length,
      IN_PROGRESS: tasks.filter(t => t.status === 'IN_PROGRESS').length,
      COMPLETED: tasks.filter(t => t.status === 'COMPLETED').length,
    }),
    [tasks],
  );

  const onSort = useCallback(
    (field: string) => {
      const next = new URLSearchParams(searchParams);
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
    () => buildColumns(sortBy, sortOrder, onSort),
    [sortBy, sortOrder, onSort],
  );

  const updateSearchParam = (key: string, value: string | string[]) => {
    const next = new URLSearchParams(searchParams);
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
    const rows = filtered.map(task =>
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
    const a = document.createElement('a');
    a.href = URL.createObjectURL(
      new Blob([csv], { type: 'text/csv;charset=utf-8;' }),
    );
    a.download = `support-tasks-${new Date().toLocaleDateString('de')}.csv`;
    a.click();
  };

  return (
    <PageWrapper>
      <SummaryGrid>
        <SummaryTile
          label="New"
          value={counts.NEW}
          sub="Open, unassigned"
          accentBg={BLUE_10}
          accentColor={BLUE_40}
          icon={<ActivityIcon size={24} />}
        />
        <SummaryTile
          label="In progress"
          value={counts.IN_PROGRESS}
          sub="Being worked on"
          accentBg={ORANGE_10}
          accentColor={ORANGE_40}
          icon={<ClockIcon size={24} />}
        />
        <SummaryTile
          label="Completed"
          value={counts.COMPLETED}
          sub="All time"
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
        downloadDisabled={isLoading || filtered.length === 0}
        onDownloadClick={handleDownload}
        showSettingsButton
        settingsDisabled={isLoading}
        onSettingsClick={() => setDownloadSettingsOpen(true)}
        showPagination={false}
        isLoading={isLoading}
        loadingText="Loading tasks…"
      >
        <QuickFilters>
          <Checkbox
            name="only_new"
            label="New"
            checked={onlyNew}
            onCheckedChange={toggleOnlyNew}
            inputRef={null}
          />
          {currentUserId !== null && (
            <Checkbox
              name="assigned_to_me"
              label="Assigned to me"
              checked={onlyMe}
              onCheckedChange={toggleOnlyMe}

            />
          )}
        </QuickFilters>
        <Dropdown
          label="Status"
          value={statusParam}
          options={STATUS_OPTIONS}
          onValueChange={v =>
            updateSearchParam('status', v === ALL_STATUSES ? '' : v)
          }
          placeholder="All statuses"
          cannotError
          maxWidth="160px"
        />
        <Dropdown
          label="Sort by"
          value={sortBy}
          options={SORT_BY_OPTIONS}
          onValueChange={v => updateSearchParam('sort_by', v)}
          placeholder="Sort by…"
          cannotError
          maxWidth="160px"
        />
        <Dropdown
          label="Order"
          value={sortOrder}
          options={SORT_ORDER_OPTIONS}
          onValueChange={v => updateSearchParam('sort_order', v)}
          placeholder="Order…"
          cannotError
          maxWidth="160px"
        />
      </FiltersToolbar>

      {isLoading ? (
        <Text center>Loading tasks…</Text>
      ) : (
        <DataTable columns={columns} data={filtered} />
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
        selectedHeaders={selectedHeaders}
        setSelectedHeaders={setSelectedHeaders}
        open={downloadSettingsOpen}
        onClose={() => setDownloadSettingsOpen(false)}
        onSave={headers => setSelectedHeaders(headers)}
        availableHeaders={availableHeaders}
        title="Task Export Settings"
        description="Choose which task fields to include in the CSV export."
      />
    </PageWrapper>
  );
}
