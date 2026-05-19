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
  assigned_to_profile: UserProfile | null;
  created_by_profile: UserProfile | null;
  created_at: string;
  updated_at: string;
  action: SupportTaskAction;
  history?: ObjectHistory[];
}

export interface StaffUser {
  id: number;
  email: string;
  first_name: string;
  last_name: string;
}

export interface SupportTaskListParams {
  status?: string;
  assigned_to?: number;
  sort_by?: string;
  sort_order?: 'asc' | 'desc';
}

export const fetchSupportTasks = (
  params: SupportTaskListParams = {},
): Promise<SupportTask[]> => {
  const query = new URLSearchParams();
  if (params.status) query.set('status', params.status);
  if (params.assigned_to) query.set('assigned_to', String(params.assigned_to));
  if (params.sort_by) query.set('sort_by', params.sort_by);
  if (params.sort_order) query.set('sort_order', params.sort_order);
  const qs = query.toString();
  return apiFetch(`/api/support_task/${qs ? `?${qs}` : ''}`);
};

export const fetchSupportTask = (id: number): Promise<SupportTask> =>
  apiFetch(`/api/support_task/${id}/`);

export const patchSupportTask = (
  id: number,
  data: Partial<
    Pick<SupportTask, 'status' | 'priority'> & { assigned_to_id: number | null }
  >,
): Promise<SupportTask> =>
  apiFetch(`/api/support_task/${id}/update/`, { method: 'PATCH', body: data });

export const fetchStaffUsers = (): Promise<StaffUser[]> =>
  apiFetch('/api/support_task/staff_users/');

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

export interface SupportTaskStats {
  NEW: number;
  IN_PROGRESS: number;
  COMPLETED: number;
}

export const fetchSupportTaskStats = (): Promise<SupportTaskStats> =>
  apiFetch('/api/support_task/stats/');

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
