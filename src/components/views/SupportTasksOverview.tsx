import {
  Button,
  ButtonAppearance,
  ButtonSizes,
  ButtonVariations,
  Loading,
  LoadingSizes,
  Text,
  TextTypes,
} from '@a-little-world/little-world-design-system';
import {
  ActivityIcon,
  CheckIcon,
  ChevronDownIcon,
  ClockIcon,
  EyeIcon,
  MoreHorizontalIcon,
  PlusIcon,
  RefreshCwIcon,
  Settings2Icon,
} from 'lucide-react';
import React, { useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import styled, { css } from 'styled-components';
import useSWR from 'swr';

import {
  TaskPriority,
  TaskStatus,
  fetchStaffUsers,
  fetchSupportTasks,
} from '../../api/supportTasks';
import { formatTimeDistance } from '../../helpers/date';
import { getSupportTaskDetailRoute } from '../../routes';

// ─── Layout ───────────────────────────────────────────────────────────────────

const PageWrapper = styled.div`
  flex: 1;
  overflow-y: auto;
  background: ${({ theme }) => theme.color.surface.primary};
`;

const PageTitleBar = styled.div`
  padding: 22px 40px 18px;
  border-bottom: 1px solid ${({ theme }) => theme.color.border.subtle};
  display: flex;
  align-items: center;
  gap: 12px;
`;

const PageTitleActions = styled.div`
  margin-left: auto;
  display: flex;
  align-items: center;
  gap: 10px;
`;

const PageSubCount = styled(Text)`
  color: ${({ theme }) => theme.color.text.tertiary};
`;

// ─── Summary tiles ────────────────────────────────────────────────────────────

const SummaryGrid = styled.div`
  padding: 24px 40px 0;
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 16px;
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
  margin-bottom: 8px;
  font-weight: 500;
`;

const TileValue = styled.div`
  font-weight: 700;
  font-size: 36px;
  line-height: 1;
  color: ${({ theme }) => theme.color.text.title};
`;

const TileSub = styled.div`
  font-size: 13px;
  color: ${({ theme }) => theme.color.text.tertiary};
  margin-top: 8px;
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

// ─── Tabs ─────────────────────────────────────────────────────────────────────

const TabsBar = styled.nav`
  padding: 28px 40px 0;
  display: flex;
  gap: 4px;
  border-bottom: 1px solid ${({ theme }) => theme.color.border.subtle};
`;

const TabButton = styled.button<{ $active: boolean }>`
  padding: 12px 18px 14px;
  border: none;
  border-bottom: 3px solid
    ${({ $active, theme }) =>
      $active ? theme.color.border.selected : 'transparent'};
  margin-bottom: -1px;
  cursor: pointer;
  font-size: 15px;
  font-weight: ${({ $active }) => ($active ? 600 : 500)};
  color: ${({ $active, theme }) =>
    $active ? theme.color.text.title : theme.color.text.tertiary};
  background: transparent;
  display: inline-flex;
  align-items: center;
  gap: 8px;
`;

const TabCount = styled.span<{ $active: boolean }>`
  display: inline-flex;
  align-items: center;
  justify-content: center;
  min-width: 22px;
  height: 20px;
  padding: 0 6px;
  border-radius: ${({ theme }) => theme.radius.massive};
  font-size: 12px;
  font-weight: 600;
  background: ${({ $active, theme }) =>
    $active ? theme.color.surface.selected : theme.color.surface.secondary};
  color: ${({ $active, theme }) =>
    $active ? theme.color.text.button : theme.color.text.tertiary};
`;

// ─── Toolbar ──────────────────────────────────────────────────────────────────

const Toolbar = styled.div`
  padding: 20px 40px 0;
  display: flex;
  align-items: center;
  gap: 14px;
  flex-wrap: wrap;
`;

const SearchInput = styled.input`
  flex: 1;
  min-width: 280px;
  height: 48px;
  padding: 0 18px;
  background: ${({ theme }) => theme.color.surface.primary};
  border: 1px solid ${({ theme }) => theme.color.border.subtle};
  border-radius: ${({ theme }) => theme.radius.xsmall};
  font-size: 15px;
  outline: none;

  &:focus {
    border-color: ${({ theme }) => theme.color.border.bold};
  }

  &::placeholder {
    color: ${({ theme }) => theme.color.text.quaternary};
  }
`;

const FiltersButton = styled(Button)`
  background: ${({ theme }) => theme.color.surface.contrast};
  color: ${({ theme }) => theme.color.text.reversed};
  height: 48px;
  padding: 0 20px;
  border-radius: ${({ theme }) => theme.radius.massive};
  display: inline-flex;
  align-items: center;
  gap: 8px;
  border: none;
`;

const RefreshButton = styled.button`
  width: 40px;
  height: 40px;
  border-radius: ${({ theme }) => theme.radius.half};
  background: ${({ theme }) => theme.color.surface.primary};
  border: 1px solid ${({ theme }) => theme.color.border.subtle};
  cursor: pointer;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  color: ${({ theme }) => theme.color.text.tertiary};

  &:hover {
    background: ${({ theme }) => theme.color.surface.secondary};
  }
`;

const SortButton = styled.button`
  height: 48px;
  padding: 0 18px;
  border-radius: ${({ theme }) => theme.radius.xsmall};
  background: ${({ theme }) => theme.color.surface.primary};
  border: 1px solid ${({ theme }) => theme.color.border.subtle};
  font-size: 14px;
  display: inline-flex;
  align-items: center;
  gap: 10px;
  cursor: pointer;
  color: ${({ theme }) => theme.color.text.primary};
`;

const SortLabel = styled.span`
  color: ${({ theme }) => theme.color.text.tertiary};
`;

// ─── Pagination row ───────────────────────────────────────────────────────────

const PaginationRow = styled.div`
  padding: 18px 40px 0;
  display: flex;
  justify-content: space-between;
  align-items: center;
`;

const PaginationRight = styled.div`
  display: flex;
  align-items: center;
  gap: 14px;
`;

const PageSizeRow = styled.div`
  display: inline-flex;
  align-items: center;
  gap: 8px;
  font-size: 14px;
  color: ${({ theme }) => theme.color.text.secondary};
`;

const PageSizeSelect = styled.select`
  height: 36px;
  padding: 0 10px;
  border-radius: ${({ theme }) => theme.radius.xxsmall};
  border: 1px solid ${({ theme }) => theme.color.border.subtle};
  background: ${({ theme }) => theme.color.surface.primary};
  font-size: 14px;
`;

const PageButtons = styled.div`
  display: inline-flex;
  align-items: center;
  gap: 6px;
`;

const PageBtn = styled.button<{ $active?: boolean }>`
  height: 36px;
  min-width: 36px;
  padding: 0 10px;
  border-radius: ${({ theme }) => theme.radius.xxsmall};
  font-size: 14px;
  cursor: pointer;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  border: 1px solid
    ${({ $active, theme }) =>
      $active ? theme.color.border.selected : theme.color.border.subtle};
  background: ${({ $active, theme }) =>
    $active ? theme.color.surface.selected : theme.color.surface.primary};
  color: ${({ $active, theme }) =>
    $active ? theme.color.text.button : theme.color.text.primary};
  font-weight: ${({ $active }) => ($active ? 700 : 400)};

  &:disabled {
    opacity: 0.45;
    cursor: not-allowed;
  }
`;

// ─── Table ────────────────────────────────────────────────────────────────────

const TableWrapper = styled.div`
  padding: 16px 40px 60px;
`;

const StyledTable = styled.table`
  width: 100%;
  border-collapse: separate;
  border-spacing: 0;
`;

const Th = styled.th<{ $first?: boolean; $last?: boolean; $width?: string }>`
  text-align: left;
  font-weight: 700;
  font-size: 12px;
  color: ${({ theme }) => theme.color.text.primary};
  padding: 14px 16px;
  background: ${({ theme }) => theme.color.surface.secondary};
  border-top: 1px solid ${({ theme }) => theme.color.border.subtle};
  border-bottom: 1px solid ${({ theme }) => theme.color.border.subtle};
  white-space: nowrap;
  text-transform: uppercase;
  letter-spacing: 0.04em;

  ${({ $first, theme }) =>
    $first &&
    css`
      border-top-left-radius: ${theme.radius.xsmall};
      border-bottom-left-radius: ${theme.radius.xsmall};
      padding-left: 22px;
    `}

  ${({ $last, theme }) =>
    $last &&
    css`
      border-top-right-radius: ${theme.radius.xsmall};
      border-bottom-right-radius: ${theme.radius.xsmall};
      padding-right: 22px;
    `}

  ${({ $width }) =>
    $width &&
    css`
      width: ${$width};
    `}
`;

const Td = styled.td<{ $first?: boolean; $last?: boolean }>`
  padding: 18px 16px;
  border-bottom: 1px solid ${({ theme }) => theme.color.border.subtle};
  font-size: 14px;
  color: ${({ theme }) => theme.color.text.primary};
  vertical-align: middle;

  ${({ $first }) =>
    $first &&
    css`
      padding-left: 22px;
    `}

  ${({ $last }) =>
    $last &&
    css`
      padding-right: 22px;
    `}
`;

const TableRow = styled.tr`
  cursor: pointer;
  transition: background 0.15s;

  &:hover td {
    background: ${({ theme }) => theme.color.surface.accent};
  }
`;

// ─── Cell sub-components ──────────────────────────────────────────────────────

const TaskCell = styled.div`
  display: flex;
  flex-direction: column;
  gap: 3px;
  min-width: 240px;
  max-width: 340px;
`;

const TaskTitle = styled.span`
  font-size: 14.5px;
  font-weight: 600;
`;

const TaskDesc = styled.span`
  font-size: 12.5px;
  color: ${({ theme }) => theme.color.text.tertiary};
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
  max-width: 320px;
`;

const MonoId = styled.span`
  font-size: 12px;
  color: ${({ theme }) => theme.color.text.tertiary};
`;

const UnassignedText = styled.span`
  color: ${({ theme }) => theme.color.text.quaternary};
`;

const AgeText = styled.span<{ $warn?: boolean }>`
  white-space: nowrap;
  font-size: 13px;
  font-variant-numeric: tabular-nums;
  color: ${({ $warn, theme }) =>
    $warn ? theme.color.text.title : theme.color.text.secondary};
  font-weight: ${({ $warn }) => ($warn ? 600 : 400)};
`;

// Status pill

const StatusPillWrap = styled.span<{ $color: string }>`
  display: inline-flex;
  align-items: center;
  gap: 8px;
  height: 28px;
  padding: 0 12px;
  border-radius: ${({ theme }) => theme.radius.massive};
  font-weight: 600;
  font-size: 13px;
  border: 2px solid ${({ $color }) => $color};
  background: ${({ theme }) => theme.color.surface.primary};
  color: ${({ $color }) => $color};
  white-space: nowrap;
  filter: drop-shadow(0 1px 3px rgba(0, 0, 0, 0.1));
`;

const PillDot = styled.span<{ $color?: string }>`
  width: 8px;
  height: 8px;
  border-radius: ${({ theme }) => theme.radius.half};
  background: ${({ $color }) => $color ?? 'currentColor'};
  display: inline-block;
  flex-shrink: 0;
`;

// Priority badge

const PriorityBadgeWrap = styled.span<{
  $bg: string;
  $color: string;
  $border: string;
}>`
  display: inline-flex;
  align-items: center;
  height: 22px;
  padding: 0 8px;
  border-radius: ${({ theme }) => theme.radius.massive};
  font-size: 11px;
  font-weight: 700;
  letter-spacing: 0.04em;
  text-transform: uppercase;
  background: ${({ $bg }) => $bg};
  color: ${({ $color }) => $color};
  border: 1px solid ${({ $border }) => $border};
`;

// Action type pill

const ActionPillWrap = styled.span<{
  $bg: string;
  $color: string;
  $border: string;
}>`
  display: inline-flex;
  align-items: center;
  gap: 8px;
  height: 28px;
  padding: 0 12px 0 10px;
  border-radius: ${({ theme }) => theme.radius.massive};
  font-size: 13px;
  font-weight: 600;
  white-space: nowrap;
  background: ${({ $bg }) => $bg};
  color: ${({ $color }) => $color};
  border: 1px solid ${({ $border }) => $border};
`;

// User cell

const UserCellWrap = styled.div`
  display: flex;
  align-items: center;
  gap: 10px;
  min-width: 0;
`;

const AvatarCircle = styled.div<{ $gradient: string; $size: number }>`
  width: ${({ $size }) => $size}px;
  height: ${({ $size }) => $size}px;
  border-radius: ${({ theme }) => theme.radius.half};
  background: ${({ $gradient }) => $gradient};
  color: #fff;
  font-weight: 700;
  font-size: ${({ $size }) => Math.round($size * 0.36)}px;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
`;

const UserName = styled.div`
  font-size: 14px;
  font-weight: 600;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  max-width: 160px;
`;

const UserEmail = styled.div`
  font-size: 12px;
  color: ${({ theme }) => theme.color.text.tertiary};
  margin-top: 2px;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  max-width: 180px;
`;

// Row action buttons

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
  transition: all 0.15s;
  text-decoration: none;

  &:hover {
    background: ${({ theme }) => theme.color.surface.primary};
    border-color: ${({ theme }) => theme.color.border.subtle};
  }
`;

const EmptyState = styled.div`
  text-align: center;
  padding: 60px 0;
  color: ${({ theme }) => theme.color.text.tertiary};
`;

const LoadingWrapper = styled.div`
  display: flex;
  justify-content: center;
  padding: 60px 0;
`;

// ─── Color constants (design tokens not in theme) ─────────────────────────────

const BLUE_40 = '#0063af';
const ORANGE_40 = '#db590b';
const GREEN_40 = '#045e45';
const BLUE_10 = '#f3fbff';
const ORANGE_10 = '#fde5cf';
const GREEN_10 = '#c7ebd1';
const YELLOW_10 = '#fef9d9';
const GRAY_10 = '#f4f5f7';
const GRAY_20 = '#e6e8ec';
const GRAY_50 = '#4b4c4f';

const AVATAR_GRADIENTS = [
  'linear-gradient(50deg,#36a9e0,#0367b2)',
  'linear-gradient(43deg,#db590b,#f39224)',
  'linear-gradient(43deg,#5c9e5e,#92d050)',
  'linear-gradient(43deg,#6c4ab6,#a98bd8)',
  'linear-gradient(43deg,#c93333,#e07070)',
];

// ─── Small presentational components ─────────────────────────────────────────

function Avatar({
  id,
  name,
  size = 36,
}: {
  id: number;
  name: string;
  size?: number;
}) {
  const gradient = AVATAR_GRADIENTS[id % AVATAR_GRADIENTS.length];
  const ini = name
    .split(' ')
    .map(p => p[0])
    .join('')
    .slice(0, 2)
    .toUpperCase();
  return (
    <AvatarCircle $gradient={gradient} $size={size}>
      {ini}
    </AvatarCircle>
  );
}

function StatusPill({ status }: { status: TaskStatus }) {
  const cfg: Record<TaskStatus, { label: string; color: string }> = {
    NEW: { label: 'New', color: BLUE_40 },
    IN_PROGRESS: { label: 'In progress', color: ORANGE_40 },
    COMPLETED: { label: 'Completed', color: GREEN_40 },
  };
  const { label, color } = cfg[status];
  return (
    <StatusPillWrap $color={color}>
      <PillDot $color={color} />
      {label}
    </StatusPillWrap>
  );
}

function PriorityBadge({ priority }: { priority: TaskPriority }) {
  const cfg: Record<
    TaskPriority,
    { label: string; bg: string; color: string; border: string }
  > = {
    LOW: { label: 'Low', bg: GRAY_10, color: GRAY_50, border: GRAY_20 },
    MEDIUM: {
      label: 'Medium',
      bg: BLUE_10,
      color: BLUE_40,
      border: 'rgba(0,99,175,0.18)',
    },
    HIGH: {
      label: 'High',
      bg: ORANGE_10,
      color: ORANGE_40,
      border: 'rgba(219,89,11,0.20)',
    },
    URGENT: {
      label: 'Urgent',
      bg: '#ffdde1',
      color: '#c93333',
      border: 'rgba(201,51,51,0.22)',
    },
  };
  const { label, bg, color, border } = cfg[priority];
  return (
    <PriorityBadgeWrap $bg={bg} $color={color} $border={border}>
      {label}
    </PriorityBadgeWrap>
  );
}

function ActionTypePill({ actionType }: { actionType: string }) {
  type S = { label: string; bg: string; color: string; border: string };
  const map: Record<string, S> = {
    support_reply: {
      label: 'Support reply',
      color: BLUE_40,
      bg: BLUE_10,
      border: 'rgba(0,99,175,0.18)',
    },
    message_action_remove_match: {
      label: 'Remove match',
      color: '#8a2a2a',
      bg: '#fbe7e3',
      border: 'rgba(201,51,51,0.20)',
    },
    profile_change_action_country_of_residence: {
      label: 'Country change',
      color: '#7a4a00',
      bg: '#fdecc8',
      border: 'rgba(243,146,36,0.25)',
    },
    message_action_change_user_type: {
      label: 'Change user type',
      color: ORANGE_40,
      bg: ORANGE_10,
      border: 'rgba(219,89,11,0.20)',
    },
    profile_action_suspicious_profile: {
      label: 'Suspicious profile',
      color: '#4a1f1f',
      bg: '#f6d9d4',
      border: 'rgba(120,30,30,0.22)',
    },
    profile_action_too_empty_profile: {
      label: 'Incomplete profile',
      color: '#5b2c87',
      bg: '#ece4f7',
      border: 'rgba(108,74,182,0.20)',
    },
  };
  const s: S = map[actionType] ?? {
    label: actionType.replace(/_/g, ' '),
    color: GRAY_50,
    bg: GRAY_10,
    border: GRAY_20,
  };
  return (
    <ActionPillWrap $bg={s.bg} $color={s.color} $border={s.border}>
      <PillDot $color={s.color} />
      {s.label}
    </ActionPillWrap>
  );
}

function UserCell({
  userId,
  name,
  email,
}: {
  userId: number;
  name: string;
  email?: string;
}) {
  return (
    <UserCellWrap>
      <Avatar id={userId} name={name} />
      <div>
        <UserName>{name}</UserName>
        {email && <UserEmail>{email}</UserEmail>}
      </div>
    </UserCellWrap>
  );
}

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

// ─── Data & config ────────────────────────────────────────────────────────────

const TABS: { key: string; label: string; statusFilter?: TaskStatus }[] = [
  { key: 'open', label: 'All open' },
  { key: 'NEW', label: 'New', statusFilter: 'NEW' },
  { key: 'IN_PROGRESS', label: 'In progress', statusFilter: 'IN_PROGRESS' },
  { key: 'COMPLETED', label: 'Completed', statusFilter: 'COMPLETED' },
];

const PAGE_SIZES = [10, 25, 50, 100];

const TABLE_HEADERS = [
  { label: 'ID', width: '90px' },
  { label: 'Task' },
  { label: 'Status' },
  { label: 'Priority' },
  { label: 'Action type' },
  { label: 'Related user' },
  { label: 'Assigned to' },
  { label: 'Created' },
  { label: 'Updated' },
  { label: '', width: '80px' },
];

// ─── Main component ───────────────────────────────────────────────────────────

export default function SupportTasksOverview() {
  const [activeTab, setActiveTab] = useState('open');
  const [search, setSearch] = useState('');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc');
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);

  const statusFilter = TABS.find(t => t.key === activeTab)?.statusFilter;

  const {
    data: tasks = [],
    isLoading,
    mutate,
  } = useSWR(['support_tasks', statusFilter, sortOrder], () =>
    fetchSupportTasks({
      status: statusFilter,
      sort_by: 'created_at',
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

  const filtered = useMemo(() => {
    if (!search.trim()) return tasks;
    const q = search.toLowerCase();
    return tasks.filter(
      t => t.title.toLowerCase().includes(q) || String(t.id).includes(q),
    );
  }, [tasks, search]);

  const totalPages = Math.max(1, Math.ceil(filtered.length / pageSize));
  const paged = filtered.slice((page - 1) * pageSize, page * pageSize);

  const counts = useMemo(
    () => ({
      open: tasks.filter(t => t.status !== 'COMPLETED').length,
      NEW: tasks.filter(t => t.status === 'NEW').length,
      IN_PROGRESS: tasks.filter(t => t.status === 'IN_PROGRESS').length,
      COMPLETED: tasks.filter(t => t.status === 'COMPLETED').length,
    }),
    [tasks],
  );

  const sortLabel = sortOrder === 'desc' ? 'Newest first' : 'Oldest first';

  const handleTabChange = (key: string) => {
    setActiveTab(key);
    setPage(1);
  };

  return (
    <PageWrapper>
      {/* Title bar */}
      <PageTitleBar>
        <Text tag="h2" type={TextTypes.Heading4}>
          Support Tasks
        </Text>
        <PageSubCount tag="span" type={TextTypes.Body6}>
          {filtered.length} total
        </PageSubCount>
        <PageTitleActions>
          <RefreshButton onClick={() => mutate()} title="Refresh">
            <RefreshCwIcon size={16} />
          </RefreshButton>
          <Button
            appearance={ButtonAppearance.Primary}
            size={ButtonSizes.Small}
          >
            <PlusIcon size={14} />
            New task
          </Button>
        </PageTitleActions>
      </PageTitleBar>

      {/* Summary tiles */}
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

      {/* Tabs */}
      <TabsBar>
        {TABS.map(tab => {
          const count = counts[tab.key as keyof typeof counts] ?? 0;
          const isActive = activeTab === tab.key;
          return (
            <TabButton
              key={tab.key}
              $active={isActive}
              onClick={() => handleTabChange(tab.key)}
            >
              {tab.label}
              <TabCount $active={isActive}>{count}</TabCount>
            </TabButton>
          );
        })}
      </TabsBar>

      {/* Toolbar */}
      <Toolbar>
        <SearchInput
          value={search}
          onChange={e => {
            setSearch(e.target.value);
            setPage(1);
          }}
          placeholder="Search by title or task ID…"
        />
        <FiltersButton variation={ButtonVariations.Basic}>
          <Settings2Icon size={15} />
          Filters
        </FiltersButton>
        <RefreshButton onClick={() => mutate()} title="Refresh">
          <RefreshCwIcon size={16} />
        </RefreshButton>
        <SortButton
          onClick={() => setSortOrder(o => (o === 'desc' ? 'asc' : 'desc'))}
        >
          <SortLabel>Sort by</SortLabel>
          <strong>{sortLabel}</strong>
          <ChevronDownIcon size={12} />
        </SortButton>
      </Toolbar>

      {/* Pagination row */}
      <PaginationRow>
        <Text tag="span" type={TextTypes.Body6}>
          Showing{' '}
          <strong>
            {Math.min((page - 1) * pageSize + 1, filtered.length)}–
            {Math.min(page * pageSize, filtered.length)}
          </strong>{' '}
          of <strong>{filtered.length}</strong> tasks
        </Text>
        <PaginationRight>
          <PageSizeRow>
            Show
            <PageSizeSelect
              value={pageSize}
              onChange={e => {
                setPageSize(Number(e.target.value));
                setPage(1);
              }}
            >
              {PAGE_SIZES.map(n => (
                <option key={n} value={n}>
                  {n}
                </option>
              ))}
            </PageSizeSelect>
            per page
          </PageSizeRow>
          <PageButtons>
            <PageBtn disabled={page === 1} onClick={() => setPage(p => p - 1)}>
              ‹ Prev
            </PageBtn>
            {Array.from(
              { length: Math.min(totalPages, 5) },
              (_, i) => i + 1,
            ).map(n => (
              <PageBtn key={n} $active={page === n} onClick={() => setPage(n)}>
                {n}
              </PageBtn>
            ))}
            <PageBtn
              disabled={page === totalPages}
              onClick={() => setPage(p => p + 1)}
            >
              Next ›
            </PageBtn>
          </PageButtons>
        </PaginationRight>
      </PaginationRow>

      {/* Table */}
      <TableWrapper>
        {isLoading ? (
          <LoadingWrapper>
            <Loading size={LoadingSizes.Medium} />
          </LoadingWrapper>
        ) : paged.length === 0 ? (
          <EmptyState>
            <Text type={TextTypes.Body5}>No tasks found.</Text>
          </EmptyState>
        ) : (
          <StyledTable>
            <thead>
              <tr>
                {TABLE_HEADERS.map((h, i) => (
                  <Th
                    key={i}
                    $first={i === 0}
                    $last={i === TABLE_HEADERS.length - 1}
                    $width={h.width}
                  >
                    {h.label}
                  </Th>
                ))}
              </tr>
            </thead>
            <tbody>
              {paged.map(task => {
                const assignee = task.assigned_to_id
                  ? staffById[task.assigned_to_id]
                  : null;
                const isOld =
                  Date.now() - new Date(task.created_at).getTime() >
                  2 * 60 * 60 * 1000;
                return (
                  <TableRow key={task.id}>
                    <Td $first>
                      <MonoId>#{task.id}</MonoId>
                    </Td>
                    <Td>
                      <TaskCell>
                        <TaskTitle>{task.title}</TaskTitle>
                        <TaskDesc>{task.description}</TaskDesc>
                      </TaskCell>
                    </Td>
                    <Td>
                      <StatusPill status={task.status} />
                    </Td>
                    <Td>
                      <PriorityBadge priority={task.priority} />
                    </Td>
                    <Td>
                      <ActionTypePill
                        actionType={task.action?.action_type ?? ''}
                      />
                    </Td>
                    <Td>
                      <UserCell
                        userId={task.related_user_id}
                        name={`User #${task.related_user_id}`}
                      />
                    </Td>
                    <Td>
                      {assignee ? (
                        <UserCell
                          userId={assignee.id}
                          name={`${assignee.first_name} ${assignee.last_name}`}
                          email={assignee.email}
                        />
                      ) : (
                        <UnassignedText>— Unassigned</UnassignedText>
                      )}
                    </Td>
                    <Td>
                      <AgeText $warn={isOld}>
                        {formatTimeDistance(task.created_at, new Date())}
                      </AgeText>
                    </Td>
                    <Td>
                      <AgeText>
                        {formatTimeDistance(task.updated_at, new Date())}
                      </AgeText>
                    </Td>
                    <Td $last>
                      <RowActions>
                        <RowActionLink
                          to={getSupportTaskDetailRoute(task.id)}
                          onClick={e => e.stopPropagation()}
                        >
                          <EyeIcon size={16} />
                        </RowActionLink>
                        <RowActionBtn>
                          <MoreHorizontalIcon size={16} />
                        </RowActionBtn>
                      </RowActions>
                    </Td>
                  </TableRow>
                );
              })}
            </tbody>
          </StyledTable>
        )}
      </TableWrapper>
    </PageWrapper>
  );
}
