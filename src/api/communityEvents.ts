import { apiFetch } from './helpers';

export interface CommunityEvent {
  id: number;
  title: string;
  description: string;
  time: string;
  end_time: string | null;
  group_id: string | null;
  frequency: 'once' | 'weekly' | 'fortnightly' | 'monthly';
  link: string;
  image: string | null;
  custom_filter: string;
  active: boolean;
  options?: Record<string, any>;
}

export interface CommunityEventPayload {
  title: string;
  description: string;
  time: string;
  end_time: string | null;
  group_id: string | null;
  frequency: CommunityEvent['frequency'];
  link: string;
  custom_filter: string;
  active: boolean;
}

export const ADMIN_EVENTS_ENDPOINT = '/api/admin/community_events/';

export const fetchCommunityEvents = async (): Promise<CommunityEvent[]> => {
  return apiFetch<CommunityEvent[]>(ADMIN_EVENTS_ENDPOINT, {
    method: 'GET',
  });
};

export const createCommunityEvent = async (
  payload: CommunityEventPayload,
): Promise<CommunityEvent> => {
  return apiFetch<CommunityEvent>(ADMIN_EVENTS_ENDPOINT, {
    method: 'POST',
    body: payload,
  });
};

export const updateCommunityEvent = async (
  id: number,
  payload: CommunityEventPayload,
): Promise<CommunityEvent> => {
  return apiFetch<CommunityEvent>(`${ADMIN_EVENTS_ENDPOINT}${id}/`, {
    method: 'PUT',
    body: payload,
  });
};

