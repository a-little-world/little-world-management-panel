import { ObjectHistory, UserProfile } from '../components/blocks/ObjectHistory';
import {
  AMBER_40,
  BLUE_40,
  CRIMSON_40,
  GRAY_40,
  GREEN_40,
  MAROON_40,
  ORANGE_40,
  PURPLE_40,
} from '../constants';
import { apiFetch } from './helpers';

export type {
  ObjectHistory,
  ObjectHistoryType,
  UserProfile,
} from '../components/blocks/ObjectHistory';

export type TaskStatus = 'NEW' | 'IN_PROGRESS' | 'COMPLETED';
export type TaskPriority = 'LOW' | 'MEDIUM' | 'HIGH' | 'URGENT';
export type ActionStatus = 'OPEN' | 'EXECUTED' | 'CANCELLED';

export interface SupportTaskAction {
  id: number;
  task_id: number;
  action_type: string;
  static_parameters: Record<string, unknown>;
  parameters: Record<string, unknown>;
  status: ActionStatus;
  reviewed_by_id: number | null;
  reviewed_at: string | null;
  history?: ObjectHistory[];
}

export interface RelatedUserProfile extends UserProfile {
  email: string;
  date_joined: string;
  last_active: string | null;
  past_tickets: number;
  user_type: string | null;
}

export interface SupportTask {
  id: number;
  title: string;
  description: string;
  status: TaskStatus;
  priority: TaskPriority;
  related_user_profile: RelatedUserProfile | null;
  assignee_profiles: UserProfile[];
  created_by_profile: UserProfile | null;
  created_at: string;
  updated_at: string;
  action: SupportTaskAction;
  history?: ObjectHistory[];
}

export interface AssigneeUser {
  id: number;
  email: string;
  first_name: string;
  last_name: string;
}

export interface PaginatedSupportTaskList {
  results: SupportTask[];
  count: number;
  page: number;
  page_size: number;
  next_page: number | null;
  previous_page: number | null;
  last_page: number;
}

export interface SupportTaskListParams {
  status?: string | string[];
  priority?: string | string[];
  action_type?: string | string[];
  assigned_to?: string;
  related_user?: string;
  sort_by?: string;
  sort_order?: 'asc' | 'desc';
  search?: string;
  page?: number;
  page_size?: number;
}

export enum TaskFilterKeys {
  Priority = 'priority',
  ActionType = 'action_type',
  AssignedTo = 'assigned_to',
}

export const DEFAULT_STATUS_FILTERS: TaskStatus[] = ['NEW', 'IN_PROGRESS'];

export const buildSupportTaskListParams = (
  searchParams: URLSearchParams,
): SupportTaskListParams => {
  const statusFilters = searchParams.getAll('status');
  return {
    status: (statusFilters.length
      ? statusFilters
      : DEFAULT_STATUS_FILTERS) as TaskStatus[],
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
  };
};

export const fetchSupportTasks = (
  params: SupportTaskListParams = {},
): Promise<PaginatedSupportTaskList> => {
  const query = new URLSearchParams();
  const appendList = (key: string, val: string | string[] | undefined) => {
    if (!val) return;
    (Array.isArray(val) ? val : [val]).forEach(v => query.append(key, v));
  };
  appendList('status', params.status);
  appendList('priority', params.priority);
  appendList('action_type', params.action_type);
  if (params.assigned_to) query.set('assigned_to', params.assigned_to);
  if (params.related_user) query.set('related_user', params.related_user);
  if (params.sort_by) query.set('sort_by', params.sort_by);
  if (params.sort_order) query.set('sort_order', params.sort_order);
  if (params.search) query.set('search', params.search);
  if (params.page) query.set('page', String(params.page));
  if (params.page_size) query.set('page_size', String(params.page_size));
  const qs = query.toString();
  return apiFetch(`/api/support_task/${qs ? `?${qs}` : ''}`);
};

export const fetchSupportTask = (id: number): Promise<SupportTask> =>
  apiFetch(`/api/support_task/${id}/`);

export const patchSupportTask = (
  id: number,
  data: Partial<
    Pick<SupportTask, 'status' | 'priority'> & { assignee_ids: number[] }
  >,
): Promise<SupportTask> =>
  apiFetch(`/api/support_task/${id}/update/`, { method: 'PATCH', body: data });

export const fetchAssigneeUsers = (): Promise<AssigneeUser[]> =>
  apiFetch('/api/support_task/assignee_users/');

export const patchAction = (
  taskId: number,
  parameters: Record<string, unknown>,
): Promise<SupportTaskAction> =>
  apiFetch(`/api/support_task/${taskId}/action/`, {
    method: 'PATCH',
    body: { parameters },
  });

export const executeAction = (taskId: number): Promise<SupportTaskAction> =>
  apiFetch(`/api/support_task/${taskId}/action/execute/`, { method: 'POST' });

export const cancelAction = (taskId: number): Promise<SupportTaskAction> =>
  apiFetch(`/api/support_task/${taskId}/action/cancel/`, { method: 'POST' });

export type BulkSupportTaskAction = 'delete' | 'complete' | 'cancel';

export interface BulkSupportTaskResult {
  succeeded: number[];
  failed: { id: number; error: string }[];
}

export const bulkSupportTasks = (
  taskIds: number[],
  action: BulkSupportTaskAction,
): Promise<BulkSupportTaskResult> =>
  apiFetch('/api/support_task/bulk/', {
    method: 'POST',
    body: { task_ids: taskIds, action },
  });

export interface SupportTaskStats {
  NEW: number;
  IN_PROGRESS: number;
  COMPLETED: number;
}

export const fetchSupportTaskStats = (): Promise<SupportTaskStats> =>
  apiFetch('/api/support_task/stats/');

export interface CreateManualTaskPayload {
  title: string;
  description?: string;
  priority: TaskPriority;
  related_user_id?: number | null;
  assignee_ids?: number[];
}

export const createManualSupportTask = (
  data: CreateManualTaskPayload,
): Promise<SupportTask> =>
  apiFetch('/api/support_task/create_manual/', { method: 'POST', body: data });

export interface UserSearchResult {
  id: number;
  email: string;
  first_name: string;
  second_name: string;
}

export const searchUsers = (q: string): Promise<UserSearchResult[]> =>
  apiFetch(`/api/support_task/user_search/?q=${encodeURIComponent(q)}`);

export const STATUS_CONFIG: Record<
  TaskStatus,
  { label: string; color: string }
> = {
  NEW: { label: 'New', color: BLUE_40 },
  IN_PROGRESS: { label: 'In progress', color: ORANGE_40 },
  COMPLETED: { label: 'Completed', color: GREEN_40 },
};

export const ACTION_TYPE_CONFIG: Record<
  string,
  { label: string; color: string }
> = {
  support_reply: { label: 'Support reply', color: BLUE_40 },
  message_action_remove_match: { label: 'Remove match', color: CRIMSON_40 },
  profile_change_action_country_of_residence: {
    label: 'Country change',
    color: AMBER_40,
  },
  message_action_change_user_type: {
    label: 'Change user type',
    color: ORANGE_40,
  },
  profile_action_suspicious_profile: {
    label: 'Suspicious profile',
    color: MAROON_40,
  },
  profile_action_too_empty_profile: {
    label: 'Incomplete profile',
    color: PURPLE_40,
  },
};

export function getActionTypeConfig(actionType: string): {
  label: string;
  color: string;
} {
  return (
    ACTION_TYPE_CONFIG[actionType] ?? {
      label: actionType.replace(/_/g, ' '),
      color: GRAY_40,
    }
  );
}
