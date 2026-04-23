import { apiFetch } from './helpers';

export interface BannerApiOptionItem {
  tag: string;
  value: string;
}

export interface Banner {
  id: number;
  name: string;
  active: boolean;
  title: string;
  text: string;
  text_color: string;
  background: string;
  cta_1_url: string;
  cta_1_text: string;
  cta_2_url: string;
  cta_2_text: string;
  type: 'small' | 'large';
  image: string | null;
  image_alt: string;
  activation_time: string | null;
  expiration_time: string | null;
  custom_filter: string;
  filter_priority: number;
  created_at: string;
  updated_at: string;
  options?: Record<string, BannerApiOptionItem[]>;
}

export interface BannerPayload {
  name: string;
  active: boolean;
  title: string;
  text: string;
  text_color: string;
  background: string;
  cta_1_url: string;
  cta_1_text: string;
  cta_2_url: string;
  cta_2_text: string;
  type: Banner['type'];
  image_alt: string;
  activation_time: string | null;
  expiration_time: string | null;
  custom_filter: string;
  filter_priority: number;
}

export const ADMIN_BANNERS_ENDPOINT = '/api/admin/banners/';

export function resolveBannerImageUrl(
  url: string | null | undefined,
): string | null {
  if (!url) return null;
  if (url.startsWith('http://') || url.startsWith('https://')) return url;
  if (typeof window === 'undefined') return url;
  return url.startsWith('/') ?
      `${window.location.origin}${url}` :
      `${window.location.origin}/${url}`;
}

function buildBannerFormData(payload: BannerPayload, image?: File): FormData {
  const fd = new FormData();
  fd.append('name', payload.name);
  fd.append('active', payload.active ? 'true' : 'false');
  fd.append('title', payload.title);
  fd.append('text', payload.text);
  fd.append('text_color', payload.text_color);
  fd.append('background', payload.background);
  fd.append('cta_1_url', payload.cta_1_url);
  fd.append('cta_1_text', payload.cta_1_text);
  fd.append('cta_2_url', payload.cta_2_url);
  fd.append('cta_2_text', payload.cta_2_text);
  fd.append('type', payload.type);
  fd.append('image_alt', payload.image_alt);
  fd.append('activation_time', payload.activation_time ?? '');
  fd.append('expiration_time', payload.expiration_time ?? '');
  fd.append('custom_filter', payload.custom_filter);
  fd.append('filter_priority', String(payload.filter_priority));
  if (image) fd.append('image', image);
  return fd;
}

export const fetchAdminBanners = () =>
  apiFetch<Banner[]>(ADMIN_BANNERS_ENDPOINT, { method: 'GET' });

export const fetchAdminBanner = (id: number) =>
  apiFetch<Banner>(`${ADMIN_BANNERS_ENDPOINT}${id}/`, { method: 'GET' });

export const createBanner = (payload: BannerPayload, imageFile?: File) =>
  apiFetch<Banner>(ADMIN_BANNERS_ENDPOINT, {
    method: 'POST',
    body: imageFile ? buildBannerFormData(payload, imageFile) : payload,
  });

export const updateBanner = (
  id: number,
  payload: BannerPayload,
  imageFile?: File,
) =>
  apiFetch<Banner>(`${ADMIN_BANNERS_ENDPOINT}${id}/`, {
    method: 'PUT',
    body: imageFile ? buildBannerFormData(payload, imageFile) : payload,
  });
