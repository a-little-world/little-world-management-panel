import { apiFetch } from './helpers';

export interface TrackingCookieRow {
  name: string;
  value: string;
}

export interface ShortLinkSourceOption {
  label: string;
  value: string;
}

export interface AdminShortLink {
  id: number;
  tag: string;
  url: string;
  tracking_cookies_enabled: boolean;
  tracking_cookies: TrackingCookieRow[] | null;
  register_at_app_root: boolean;
  created_at: string;
  updated_at: string;
  archived_at: string | null;
  click_count: number;
}

export type AdminShortLinkCreatePayload = {
  tag: string;
  url: string;
  tracking_cookies_enabled: boolean;
  tracking_cookies: TrackingCookieRow[];
  register_at_app_root: boolean;
};

export type AdminShortLinkUpdatePayload = Omit<
  AdminShortLinkCreatePayload,
  'tag'
>;

export const ADMIN_SHORT_LINKS_ENDPOINT = '/api/admin/short_links/';
export const ADMIN_SHORT_LINK_CLICKS_ENDPOINT = '/api/admin/short_link_clicks/';

export interface AdminShortLinkClick {
  id: number;
  tag: string;
  user: string;
  created_at: string;
  source: string;
}

export interface AdminShortLinkClickList {
  count: number;
  page: number;
  next?: string | null;
  previous?: string | null;
  results: AdminShortLinkClick[];
  page_size: number;
  pages_total: number;
  next_page: number | null;
  previous_page: number | null;
  last_page: number;
  first_page: number;
  items_total: number;
  results_total: number;
  source_options: ShortLinkSourceOption[];
}

export const fetchAdminShortLinks = (search: string) => {
  const q = search.trim();
  const url =
    q ?
      `${ADMIN_SHORT_LINKS_ENDPOINT}?search=${encodeURIComponent(q)}`
    : ADMIN_SHORT_LINKS_ENDPOINT;
  return apiFetch<AdminShortLink[]>(url, { method: 'GET' });
};

export const createAdminShortLink = (body: AdminShortLinkCreatePayload) =>
  apiFetch<AdminShortLink>(ADMIN_SHORT_LINKS_ENDPOINT, {
    method: 'POST',
    body,
  });

export const updateAdminShortLink = (
  id: number,
  body: AdminShortLinkUpdatePayload,
) =>
  apiFetch<AdminShortLink>(`${ADMIN_SHORT_LINKS_ENDPOINT}${id}/`, {
    method: 'PATCH',
    body,
  });

export const archiveAdminShortLink = (id: number) =>
  apiFetch<AdminShortLink>(`${ADMIN_SHORT_LINKS_ENDPOINT}${id}/archive/`, {
    method: 'POST',
  });

export const fetchAdminShortLinkClicks = (queryString: string) =>
  apiFetch<AdminShortLinkClickList>(
    queryString ?
      `${ADMIN_SHORT_LINK_CLICKS_ENDPOINT}?${queryString}`
    : ADMIN_SHORT_LINK_CLICKS_ENDPOINT,
    {
      method: 'GET',
    },
  );
