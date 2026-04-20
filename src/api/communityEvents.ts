import { apiFetch } from './helpers';

/** Turn API image paths into a browser-usable URL (same-origin relative paths supported). */
export function resolveCommunityEventImageUrl(
  url: string | null | undefined,
): string | null {
  if (!url) return null;
  if (url.startsWith('http://') || url.startsWith('https://')) return url;
  if (typeof window === 'undefined') return url;
  return url.startsWith('/') ? `${window.location.origin}${url}` : `${window.location.origin}/${url}`;
}

function buildCommunityEventFormData(
  payload: CommunityEventPayload,
  image: File,
): FormData {
  const fd = new FormData();
  fd.append('title', payload.title);
  fd.append('description', payload.description);
  fd.append('time', payload.time);
  fd.append('end_time', payload.end_time ?? '');
  fd.append('group_id', payload.group_id ?? '');
  fd.append('frequency', payload.frequency);
  fd.append('link', payload.link);
  fd.append('custom_filter', payload.custom_filter);
  fd.append('active', payload.active ? 'true' : 'false');
  fd.append('image', image);
  return fd;
}

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
  options?: Record<string, Array<{ tag: string; value: string }>>;
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

export const fetchCommunityEvents = () =>
  apiFetch<CommunityEvent[]>(ADMIN_EVENTS_ENDPOINT, { method: 'GET' });

export const createCommunityEvent = (
  payload: CommunityEventPayload,
  imageFile?: File,
) =>
  apiFetch<CommunityEvent>(ADMIN_EVENTS_ENDPOINT, {
    method: 'POST',
    body: imageFile ? buildCommunityEventFormData(payload, imageFile) : payload,
  });

export const updateCommunityEvent = (
  id: number,
  payload: CommunityEventPayload,
  imageFile?: File,
) =>
  apiFetch<CommunityEvent>(`${ADMIN_EVENTS_ENDPOINT}${id}/`, {
    method: 'PUT',
    body: imageFile ? buildCommunityEventFormData(payload, imageFile) : payload,
  });
