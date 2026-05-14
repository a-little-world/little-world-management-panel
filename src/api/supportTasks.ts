import { apiFetch } from './helpers';

export type TaskStatus = 'NEW' | 'IN_PROGRESS' | 'COMPLETED';
export type TaskPriority = 'LOW' | 'MEDIUM' | 'HIGH' | 'URGENT';
export type ActionStatus = 'OPEN' | 'EXECUTED' | 'CANCELLED';

export interface SupportTaskAction {
  id: number;
  action_type: string;
  static_parameters: Record<string, unknown>;
  parameters: Record<string, unknown>;
  status: ActionStatus;
  reviewed_by_id: number | null;
  reviewed_at: string | null;
  history?: ObjectHistory[];
}

export interface UserProfile {
  id: number;
  first_name: string;
  second_name: string;
  image: string | null;
  avatar_config: Record<string, unknown>;
  image_type: 'image' | 'avatar';
}

export type ObjectHistoryType = 'CREATE' | 'UPDATE';

export interface ObjectHistory {
  id: number;
  model_type: string;
  changed_by_profile: UserProfile | null;
  changed_at: string;
  type: ObjectHistoryType;
  field: string;
  old_value: unknown;
  new_value: unknown;
}

export interface SupportTask {
  id: number;
  title: string;
  description: string;
  status: TaskStatus;
  priority: TaskPriority;
  related_user_profile: UserProfile | null;
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
  data: Partial<Pick<SupportTask, 'status' | 'priority'> & { assigned_to_id: number | null }>,
): Promise<SupportTask> =>
  apiFetch(`/api/support_task/${id}/update/`, { method: 'PATCH', body: data });

export const fetchStaffUsers = (): Promise<StaffUser[]> =>
  apiFetch('/api/support_task/staff_users/');

export interface SupportTaskStats {
  NEW: number;
  IN_PROGRESS: number;
  COMPLETED: number;
}

export const fetchSupportTaskStats = (): Promise<SupportTaskStats> =>
  apiFetch('/api/support_task/stats/');
