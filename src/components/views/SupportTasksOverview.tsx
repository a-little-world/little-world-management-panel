import {
  ActivityIcon,
  CheckIcon,
  ChevronDownIcon,
  ClockIcon,
  EyeIcon,
  MessageSquareIcon,
  MoreHorizontalIcon,
  PlusIcon,
  RefreshCwIcon,
  Settings2Icon,
  XIcon,
} from 'lucide-react';
import React, { useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import useSWR from 'swr';

import {
  SupportTask,
  TaskPriority,
  TaskStatus,
  fetchStaffUsers,
  fetchSupportTasks,
} from '../../api/supportTasks';
import { formatTimeDistance } from '../../helpers/date';
import { SUPPORT_TASK_DETAIL_ROUTE, getSupportTaskDetailRoute } from '../../routes';

// ─── Design tokens ────────────────────────────────────────────────────────────

const C = {
  orange10: '#fde5cf',
  orange30: '#f39224',
  orange40: '#db590b',
  blue10: '#f3fbff',
  blue40: '#0063af',
  green10: '#c7ebd1',
  green40: '#045e45',
  yellow10: '#fef9d9',
  gray10: '#f4f5f7',
  gray20: '#e6e8ec',
  gray40: '#a6a6a6',
  gray50: '#4b4c4f',
  gray65: '#18191b',
} as const;

// ─── Helpers ──────────────────────────────────────────────────────────────────

const AVATAR_GRADIENTS = [
  'linear-gradient(50deg,#36a9e0,#0367b2)',
  'linear-gradient(43deg,#db590b,#f39224)',
  'linear-gradient(43deg,#5c9e5e,#92d050)',
  'linear-gradient(43deg,#6c4ab6,#a98bd8)',
  'linear-gradient(43deg,#c93333,#e07070)',
];

function avatarGradient(id: number) {
  return AVATAR_GRADIENTS[id % AVATAR_GRADIENTS.length];
}

function initials(name: string) {
  return name
    .split(' ')
    .map(p => p[0])
    .join('')
    .slice(0, 2)
    .toUpperCase();
}

// ─── Sub-components ───────────────────────────────────────────────────────────

function Avatar({ id, name, size = 36 }: { id: number; name: string; size?: number }) {
  return (
    <div
      style={{
        width: size,
        height: size,
        borderRadius: '50%',
        background: avatarGradient(id),
        color: '#fff',
        fontFamily: "'Work Sans', sans-serif",
        fontWeight: 700,
        fontSize: size * 0.36,
        display: 'inline-flex',
        alignItems: 'center',
        justifyContent: 'center',
        flexShrink: 0,
      }}
    >
      {initials(name)}
    </div>
  );
}

function StatusPill({ status }: { status: TaskStatus }) {
  const cfg: Record<TaskStatus, { label: string; color: string }> = {
    NEW: { label: 'New', color: C.blue40 },
    IN_PROGRESS: { label: 'In progress', color: C.orange40 },
    COMPLETED: { label: 'Completed', color: C.green40 },
  };
  const { label, color } = cfg[status];
  return (
    <span
      style={{
        display: 'inline-flex',
        alignItems: 'center',
        gap: 8,
        height: 28,
        padding: '0 12px',
        borderRadius: 90,
        fontWeight: 600,
        fontSize: 13,
        border: `2px solid ${color}`,
        background: '#fff',
        color,
        whiteSpace: 'nowrap',
        filter: 'drop-shadow(0 1px 3px rgba(0,0,0,0.10))',
      }}
    >
      <span style={{ width: 8, height: 8, borderRadius: '50%', background: color, display: 'inline-block' }} />
      {label}
    </span>
  );
}

function PriorityBadge({ priority }: { priority: TaskPriority }) {
  const cfg: Record<TaskPriority, { label: string; bg: string; color: string; border: string }> = {
    LOW:    { label: 'Low',    bg: C.gray10,    color: C.gray50,    border: C.gray20 },
    MEDIUM: { label: 'Medium', bg: C.blue10,    color: C.blue40,    border: 'rgba(0,99,175,0.18)' },
    HIGH:   { label: 'High',   bg: C.orange10,  color: C.orange40,  border: 'rgba(219,89,11,0.20)' },
    URGENT: { label: 'Urgent', bg: '#ffdde1',   color: '#c93333',   border: 'rgba(201,51,51,0.22)' },
  };
  const { label, bg, color, border } = cfg[priority];
  return (
    <span
      style={{
        display: 'inline-flex',
        alignItems: 'center',
        height: 22,
        padding: '0 8px',
        borderRadius: 90,
        fontSize: 11,
        fontWeight: 700,
        background: bg,
        color,
        border: `1px solid ${border}`,
        letterSpacing: '0.04em',
        textTransform: 'uppercase',
      }}
    >
      {label}
    </span>
  );
}

function ActionTypePill({ actionType }: { actionType: string }) {
  type StyleDef = { label: string; color: string; bg: string; border: string };
  const map: Record<string, StyleDef> = {
    support_reply:                          { label: 'Support reply',    color: C.blue40,       bg: C.blue10,    border: 'rgba(0,99,175,0.18)' },
    message_action_remove_match:            { label: 'Remove match',     color: '#8a2a2a',      bg: '#fbe7e3',   border: 'rgba(201,51,51,0.20)' },
    profile_change_action_country_of_residence: { label: 'Country change', color: '#7a4a00',   bg: '#fdecc8',   border: 'rgba(243,146,36,0.25)' },
    message_action_change_user_type:        { label: 'Change user type', color: C.orange40,    bg: C.orange10,  border: 'rgba(219,89,11,0.20)' },
    profile_action_suspicious_profile:      { label: 'Suspicious profile', color: '#4a1f1f',   bg: '#f6d9d4',   border: 'rgba(120,30,30,0.22)' },
    profile_action_too_empty_profile:       { label: 'Incomplete profile', color: '#5b2c87',   bg: '#ece4f7',   border: 'rgba(108,74,182,0.20)' },
    scoring_profile_assessment:             { label: 'Profile review',   color: '#2f6b3a',     bg: C.green10,   border: 'rgba(92,158,94,0.30)' },
  };
  const style: StyleDef = map[actionType] ?? {
    label: actionType.replace(/_/g, ' '),
    color: C.gray50,
    bg: C.gray10,
    border: C.gray20,
  };
  return (
    <span
      style={{
        display: 'inline-flex',
        alignItems: 'center',
        gap: 8,
        height: 28,
        padding: '0 12px 0 10px',
        borderRadius: 90,
        fontSize: 13,
        fontWeight: 600,
        whiteSpace: 'nowrap',
        border: `1px solid ${style.border}`,
        background: style.bg,
        color: style.color,
      }}
    >
      <span style={{ width: 8, height: 8, borderRadius: '50%', background: style.color, flexShrink: 0 }} />
      {style.label}
    </span>
  );
}

function UserCell({ userId, name, email }: { userId: number; name: string; email?: string }) {
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 10, minWidth: 0 }}>
      <Avatar id={userId} name={name} size={36} />
      <div style={{ minWidth: 0 }}>
        <div style={{ fontSize: 14, fontWeight: 600, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis', maxWidth: 160 }}>{name}</div>
        {email && (
          <div style={{ fontSize: 12, color: C.gray50, marginTop: 2, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis', maxWidth: 180 }}>{email}</div>
        )}
      </div>
    </div>
  );
}

function SummaryTile({
  label, value, sub, icon, accentBg, accentColor,
}: {
  label: string; value: number; sub: string;
  icon: React.ReactNode; accentBg: string; accentColor: string;
}) {
  return (
    <div style={{
      background: '#fff',
      border: `1px solid ${C.gray20}`,
      borderRadius: 24,
      padding: '20px 22px',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'space-between',
      gap: 12,
      boxShadow: '0 1px 25px 1px rgba(0,0,0,0.04)',
    }}>
      <div>
        <div style={{ fontSize: 12, color: C.gray50, textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: 8, fontWeight: 500 }}>{label}</div>
        <div style={{ fontFamily: "'Work Sans',sans-serif", fontWeight: 700, fontSize: 36, lineHeight: 1, color: C.orange40 }}>{value}</div>
        <div style={{ fontSize: 13, color: C.gray50, marginTop: 8 }}>{sub}</div>
      </div>
      <div style={{ width: 52, height: 52, borderRadius: 16, background: accentBg, color: accentColor, display: 'inline-flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
        {icon}
      </div>
    </div>
  );
}

// ─── Main view ────────────────────────────────────────────────────────────────

const TABS: { key: string; label: string; statusFilter?: TaskStatus }[] = [
  { key: 'open',        label: 'All open' },
  { key: 'NEW',         label: 'New',           statusFilter: 'NEW' },
  { key: 'IN_PROGRESS', label: 'In progress',   statusFilter: 'IN_PROGRESS' },
  { key: 'COMPLETED',   label: 'Completed',     statusFilter: 'COMPLETED' },
];

const PAGE_SIZE_OPTIONS = [10, 25, 50, 100];

export default function SupportTasksOverview() {
  const [activeTab, setActiveTab] = useState('open');
  const [search, setSearch]       = useState('');
  const [sortBy, setSortBy]       = useState<'created_at' | 'status' | 'title'>('created_at');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc');
  const [page, setPage]           = useState(1);
  const [pageSize, setPageSize]   = useState(10);

  const statusFilter = TABS.find(t => t.key === activeTab)?.statusFilter;

  const { data: tasks = [], isLoading, mutate } = useSWR(
    ['support_tasks', statusFilter, sortBy, sortOrder],
    () => fetchSupportTasks({ status: statusFilter, sort_by: sortBy, sort_order: sortOrder }),
  );

  const { data: staffUsers = [] } = useSWR('staff_users', fetchStaffUsers);

  const staffById = useMemo(() => {
    const m: Record<number, typeof staffUsers[0]> = {};
    staffUsers.forEach(u => { m[u.id] = u; });
    return m;
  }, [staffUsers]);

  const filtered = useMemo(() => {
    if (!search.trim()) return tasks;
    const q = search.toLowerCase();
    return tasks.filter(t =>
      t.title.toLowerCase().includes(q) ||
      String(t.id).includes(q),
    );
  }, [tasks, search]);

  const totalPages = Math.max(1, Math.ceil(filtered.length / pageSize));
  const paged = filtered.slice((page - 1) * pageSize, page * pageSize);

  const counts = useMemo(() => ({
    open:        tasks.filter(t => t.status !== 'COMPLETED').length,
    NEW:         tasks.filter(t => t.status === 'NEW').length,
    IN_PROGRESS: tasks.filter(t => t.status === 'IN_PROGRESS').length,
    COMPLETED:   tasks.filter(t => t.status === 'COMPLETED').length,
  }), [tasks]);

  function handleTabChange(key: string) {
    setActiveTab(key);
    setPage(1);
  }

  const sortLabel = sortOrder === 'desc'
    ? `${sortBy === 'created_at' ? 'Newest' : sortBy === 'status' ? 'Status' : 'Title'} first`
    : `${sortBy === 'created_at' ? 'Oldest' : sortBy === 'status' ? 'Status' : 'Title'} first`;

  return (
    <div style={{ flex: 1, overflowY: 'auto', background: '#fff', fontFamily: "'Signika Negative', system-ui, sans-serif" }}>

      {/* Page title bar */}
      <div style={{ padding: '22px 40px 0', borderBottom: `1px solid ${C.gray20}`, display: 'flex', alignItems: 'baseline', gap: 12, paddingBottom: 18 }}>
        <h2 style={{ fontFamily: "'Work Sans', sans-serif", fontWeight: 700, fontSize: 26, color: C.blue40, margin: 0 }}>
          Support Tasks
        </h2>
        <span style={{ fontSize: 14, color: C.gray50 }}>{filtered.length} total</span>
        <div style={{ marginLeft: 'auto', display: 'flex', alignItems: 'center', gap: 10 }}>
          <button
            onClick={() => mutate()}
            style={{ width: 40, height: 40, borderRadius: '50%', background: '#fff', border: `1px solid ${C.gray20}`, cursor: 'pointer', display: 'inline-flex', alignItems: 'center', justifyContent: 'center', color: C.gray50 }}
            title="Refresh"
          >
            <RefreshCwIcon size={16} />
          </button>
          <button
            style={{ height: 40, padding: '0 18px', borderRadius: 90, border: 'none', cursor: 'pointer', background: 'linear-gradient(43deg,#db590b,#f39224)', color: '#fff', fontFamily: 'inherit', fontWeight: 600, fontSize: 14, display: 'inline-flex', alignItems: 'center', gap: 8 }}
          >
            <PlusIcon size={14} />
            New task
          </button>
        </div>
      </div>

      {/* Summary tiles */}
      <div style={{ padding: '24px 40px 0', display: 'grid', gridTemplateColumns: 'repeat(4,1fr)', gap: 16 }}>
        <SummaryTile
          label="New"
          value={counts.NEW}
          sub="Open, unassigned"
          accentBg={C.blue10}
          accentColor={C.blue40}
          icon={<ActivityIcon size={24} />}
        />
        <SummaryTile
          label="In progress"
          value={counts.IN_PROGRESS}
          sub="Being worked on"
          accentBg={C.orange10}
          accentColor={C.orange40}
          icon={<ClockIcon size={24} />}
        />
        <SummaryTile
          label="Awaiting action"
          value={tasks.filter(t => t.action?.status === 'OPEN' && t.status !== 'COMPLETED').length}
          sub="Action pending review"
          accentBg={C.yellow10}
          accentColor="#7a5b00"
          icon={<MessageSquareIcon size={24} />}
        />
        <SummaryTile
          label="Completed"
          value={counts.COMPLETED}
          sub="All time"
          accentBg={C.green10}
          accentColor={C.green40}
          icon={<CheckIcon size={24} />}
        />
      </div>

      {/* Tabs */}
      <nav style={{ padding: '28px 40px 0', display: 'flex', gap: 4, borderBottom: `1px solid ${C.gray20}` }}>
        {TABS.map(tab => {
          const count = counts[tab.key as keyof typeof counts] ?? 0;
          const isActive = activeTab === tab.key;
          return (
            <button
              key={tab.key}
              onClick={() => handleTabChange(tab.key)}
              style={{
                padding: '12px 18px 14px',
                borderBottom: `3px solid ${isActive ? C.orange30 : 'transparent'}`,
                cursor: 'pointer',
                fontSize: 15,
                color: isActive ? C.orange40 : C.gray50,
                fontWeight: isActive ? 600 : 500,
                marginBottom: -1,
                display: 'inline-flex',
                alignItems: 'center',
                gap: 8,
                background: 'none',
                border: 'none',
                borderBottomWidth: 3,
                borderBottomStyle: 'solid',
                borderBottomColor: isActive ? C.orange30 : 'transparent',
                fontFamily: 'inherit',
              }}
            >
              {tab.label}
              <span style={{
                display: 'inline-flex',
                alignItems: 'center',
                justifyContent: 'center',
                minWidth: 22,
                height: 20,
                padding: '0 6px',
                borderRadius: 10,
                background: isActive ? C.orange30 : C.gray10,
                fontSize: 12,
                fontWeight: 600,
                color: isActive ? '#fff' : C.gray50,
              }}>
                {count}
              </span>
            </button>
          );
        })}
      </nav>

      {/* Toolbar */}
      <div style={{ padding: '20px 40px 0', display: 'flex', alignItems: 'center', gap: 14, flexWrap: 'wrap' }}>
        <input
          value={search}
          onChange={e => { setSearch(e.target.value); setPage(1); }}
          placeholder="Search by title or task ID…"
          style={{ flex: 1, minWidth: 280, height: 48, padding: '0 18px', background: '#fff', border: `1px solid ${C.gray20}`, borderRadius: 12, fontSize: 15, outline: 'none', fontFamily: 'inherit' }}
        />
        <button style={{ height: 48, padding: '0 20px', borderRadius: 90, background: '#000', color: '#fff', border: 'none', cursor: 'pointer', fontFamily: 'inherit', fontWeight: 600, fontSize: 14, display: 'inline-flex', alignItems: 'center', gap: 8 }}>
          <Settings2Icon size={15} />
          Filters
        </button>
        {/* Sort */}
        <button
          onClick={() => setSortOrder(o => o === 'desc' ? 'asc' : 'desc')}
          style={{ height: 48, padding: '0 18px', borderRadius: 12, background: '#fff', border: `1px solid ${C.gray20}`, fontSize: 14, display: 'inline-flex', alignItems: 'center', gap: 10, cursor: 'pointer', fontFamily: 'inherit' }}
        >
          <span style={{ color: C.gray50 }}>Sort by</span>
          <strong>{sortLabel}</strong>
          <ChevronDownIcon size={12} />
        </button>
      </div>

      {/* Pagination row */}
      <div style={{ padding: '18px 40px 0', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div style={{ fontSize: 14, color: C.gray50 }}>
          Showing <strong>{Math.min((page - 1) * pageSize + 1, filtered.length)}–{Math.min(page * pageSize, filtered.length)}</strong> of <strong>{filtered.length}</strong> tasks
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
          <div style={{ display: 'inline-flex', alignItems: 'center', gap: 8, fontSize: 14, color: C.gray50 }}>
            Show
            <select
              value={pageSize}
              onChange={e => { setPageSize(Number(e.target.value)); setPage(1); }}
              style={{ height: 36, padding: '0 10px', borderRadius: 8, border: `1px solid ${C.gray20}`, background: '#fff', fontFamily: 'inherit', fontSize: 14 }}
            >
              {PAGE_SIZE_OPTIONS.map(n => <option key={n} value={n}>{n}</option>)}
            </select>
            per page
          </div>
          <div style={{ display: 'inline-flex', alignItems: 'center', gap: 6 }}>
            <button
              disabled={page === 1}
              onClick={() => setPage(p => p - 1)}
              style={{ height: 36, minWidth: 36, padding: '0 10px', borderRadius: 8, background: '#fff', border: `1px solid ${C.gray20}`, fontSize: 14, cursor: page === 1 ? 'not-allowed' : 'pointer', opacity: page === 1 ? 0.45 : 1, fontFamily: 'inherit' }}
            >
              ‹ Prev
            </button>
            {Array.from({ length: Math.min(totalPages, 5) }, (_, i) => i + 1).map(n => (
              <button
                key={n}
                onClick={() => setPage(n)}
                style={{ height: 36, minWidth: 36, padding: '0 10px', borderRadius: 8, background: page === n ? C.orange30 : '#fff', border: `1px solid ${page === n ? C.orange30 : C.gray20}`, fontSize: 14, cursor: 'pointer', color: page === n ? '#fff' : 'inherit', fontWeight: page === n ? 700 : 400, fontFamily: 'inherit' }}
              >
                {n}
              </button>
            ))}
            <button
              disabled={page === totalPages}
              onClick={() => setPage(p => p + 1)}
              style={{ height: 36, minWidth: 36, padding: '0 10px', borderRadius: 8, background: '#fff', border: `1px solid ${C.gray20}`, fontSize: 14, cursor: page === totalPages ? 'not-allowed' : 'pointer', opacity: page === totalPages ? 0.45 : 1, fontFamily: 'inherit' }}
            >
              Next ›
            </button>
          </div>
        </div>
      </div>

      {/* Table */}
      <div style={{ padding: '16px 40px 60px' }}>
        {isLoading ? (
          <div style={{ textAlign: 'center', padding: '60px 0', color: C.gray50 }}>Loading…</div>
        ) : paged.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '60px 0', color: C.gray50 }}>No tasks found.</div>
        ) : (
          <table style={{ width: '100%', borderCollapse: 'separate', borderSpacing: 0 }}>
            <thead>
              <tr>
                {['ID', 'Task', 'Status', 'Priority', 'Action type', 'Related user', 'Assigned to', 'Created', 'Updated', ''].map((h, i) => (
                  <th
                    key={i}
                    style={{
                      textAlign: 'left',
                      fontFamily: "'Work Sans', sans-serif",
                      fontWeight: 700,
                      fontSize: 12,
                      color: C.gray65,
                      padding: '14px 16px',
                      background: C.gray10,
                      borderTop: `1px solid ${C.gray20}`,
                      borderBottom: `1px solid ${C.gray20}`,
                      whiteSpace: 'nowrap',
                      textTransform: 'uppercase',
                      letterSpacing: '0.04em',
                      ...(i === 0 ? { borderTopLeftRadius: 14, borderBottomLeftRadius: 14, paddingLeft: 22, width: 90 } : {}),
                      ...(i === 9 ? { borderTopRightRadius: 14, borderBottomRightRadius: 14, paddingRight: 22, width: 80 } : {}),
                    }}
                  >
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {paged.map(task => {
                const assignee = task.assigned_to_id ? staffById[task.assigned_to_id] : null;
                const isOld = Date.now() - new Date(task.created_at).getTime() > 2 * 60 * 60 * 1000;
                return (
                  <tr
                    key={task.id}
                    style={{ cursor: 'pointer', transition: 'background 0.15s' }}
                    onMouseEnter={e => (e.currentTarget.style.background = C.orange10)}
                    onMouseLeave={e => (e.currentTarget.style.background = '')}
                  >
                    {/* ID */}
                    <td style={tdStyle}>
                      <span style={{ fontFamily: 'monospace', fontSize: 12, color: C.gray50 }}>#{task.id}</span>
                    </td>
                    {/* Task */}
                    <td style={{ ...tdStyle, minWidth: 240, maxWidth: 340 }}>
                      <div style={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
                        <span style={{ fontSize: 14.5, fontWeight: 600 }}>{task.title}</span>
                        <span style={{ fontSize: 12.5, color: C.gray50, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', maxWidth: 320 }}>{task.description}</span>
                      </div>
                    </td>
                    {/* Status */}
                    <td style={tdStyle}><StatusPill status={task.status} /></td>
                    {/* Priority */}
                    <td style={tdStyle}><PriorityBadge priority={task.priority} /></td>
                    {/* Action type */}
                    <td style={tdStyle}><ActionTypePill actionType={task.action?.action_type ?? ''} /></td>
                    {/* Related user */}
                    <td style={tdStyle}>
                      <UserCell
                        userId={task.related_user_id}
                        name={`User #${task.related_user_id}`}
                      />
                    </td>
                    {/* Assigned to */}
                    <td style={tdStyle}>
                      {assignee ? (
                        <UserCell
                          userId={assignee.id}
                          name={`${assignee.first_name} ${assignee.last_name}`}
                          email={assignee.email}
                        />
                      ) : (
                        <span style={{ color: C.gray40 }}>— Unassigned</span>
                      )}
                    </td>
                    {/* Created */}
                    <td style={tdStyle}>
                      <span style={{ whiteSpace: 'nowrap', fontSize: 13, color: isOld ? C.orange40 : C.gray50, fontWeight: isOld ? 600 : 400 }}>
                        {formatTimeDistance(task.created_at, new Date())}
                      </span>
                    </td>
                    {/* Updated */}
                    <td style={tdStyle}>
                      <span style={{ whiteSpace: 'nowrap', fontSize: 13, color: C.gray50 }}>
                        {formatTimeDistance(task.updated_at, new Date())}
                      </span>
                    </td>
                    {/* Actions */}
                    <td style={{ ...tdStyle, paddingRight: 22 }}>
                      <div style={{ display: 'inline-flex', gap: 4 }}>
                        <Link
                          to={getSupportTaskDetailRoute(task.id)}
                          onClick={e => e.stopPropagation()}
                          style={{ width: 32, height: 32, borderRadius: 8, background: 'transparent', border: '1px solid transparent', cursor: 'pointer', display: 'inline-flex', alignItems: 'center', justifyContent: 'center', color: C.gray50, textDecoration: 'none' }}
                          onMouseEnter={e => { (e.currentTarget as HTMLElement).style.background = '#fff'; (e.currentTarget as HTMLElement).style.borderColor = C.gray20; }}
                          onMouseLeave={e => { (e.currentTarget as HTMLElement).style.background = 'transparent'; (e.currentTarget as HTMLElement).style.borderColor = 'transparent'; }}
                        >
                          <EyeIcon size={16} />
                        </Link>
                        <button
                          style={{ width: 32, height: 32, borderRadius: 8, background: 'transparent', border: '1px solid transparent', cursor: 'pointer', display: 'inline-flex', alignItems: 'center', justifyContent: 'center', color: C.gray50 }}
                          onMouseEnter={e => { e.currentTarget.style.background = '#fff'; e.currentTarget.style.borderColor = C.gray20; }}
                          onMouseLeave={e => { e.currentTarget.style.background = 'transparent'; e.currentTarget.style.borderColor = 'transparent'; }}
                        >
                          <MoreHorizontalIcon size={16} />
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}

const tdStyle: React.CSSProperties = {
  padding: '18px 16px',
  borderBottom: '1px solid #e6e8ec',
  fontSize: 14,
  verticalAlign: 'middle',
};
