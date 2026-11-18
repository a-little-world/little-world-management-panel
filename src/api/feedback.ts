import { UserProfile } from '../components/blocks/ObjectHistory';
import { apiFetch } from './helpers';
import { TaskStatus } from './supportTasks';

export const ADMIN_FEEDBACK_ENDPOINT = '/api/admin/feedback/';

export type FeedbackKind = 'general' | 'bug';

export const FEEDBACK_KIND_LABELS: Record<FeedbackKind, string> = {
  general: 'General',
  bug: 'Bug',
};

export const FEEDBACK_AREA_LABELS: Record<string, string> = {
  calls: 'Video calls',
  chat: 'Chat',
  matching: 'Matching',
  profile: 'Profile & settings',
};

export interface AdminFeedback {
  id: number;
  kind: FeedbackKind;
  rating: number | null;
  area: string;
  area_other: string;
  message: string;
  platform: string;
  device: Record<string, string | number | boolean | null>;
  status: TaskStatus;
  github_issue_url: string;
  created_at: string;
  user_profile: UserProfile | null;
  attachments: string[];
}

export interface AdminFeedbackList {
  results: AdminFeedback[];
  page: number;
  page_size: number;
  pages_total: number;
  results_total: number;
  next_page: number | null;
  previous_page: number | null;
  first_page: number;
  last_page: number;
}

export const fetchFeedback = (queryString: string) =>
  apiFetch<AdminFeedbackList>(
    queryString
      ? `${ADMIN_FEEDBACK_ENDPOINT}?${queryString}`
      : ADMIN_FEEDBACK_ENDPOINT,
    { method: 'GET' },
  );

export const updateFeedback = (
  id: number,
  payload: Pick<AdminFeedback, 'status' | 'github_issue_url'>,
) =>
  apiFetch<AdminFeedback>(`${ADMIN_FEEDBACK_ENDPOINT}${id}/`, {
    method: 'PATCH',
    body: payload,
  });

export const feedbackAreaLabel = (feedback: AdminFeedback) =>
  feedback.area === 'other'
    ? feedback.area_other
    : (FEEDBACK_AREA_LABELS[feedback.area] ?? feedback.area);
