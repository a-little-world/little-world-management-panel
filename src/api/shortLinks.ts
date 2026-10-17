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
  meta_conversion_enabled: boolean;
  meta_conversion_event: string;
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
  meta_conversion_enabled: boolean;
  meta_conversion_event: string;
};

export type AdminShortLinkUpdatePayload = Omit<
  AdminShortLinkCreatePayload,
  'tag'
>;

/**
 * Meta (Facebook) Conversions API events a short link can fire on click. Values are the
 * exact `event_name` strings the backend sends to Meta, so they must stay in sync with the
 * backend `MetaConversionEvent` choices.
 */
export const META_CONVERSION_EVENT_OPTIONS: { value: string; label: string }[] =
  [
    { value: 'Lead', label: 'Lead' },
    { value: 'CompleteRegistration', label: 'Complete registration' },
    { value: 'SubmitApplication', label: 'Submit application' },
    { value: 'Subscribe', label: 'Subscribe' },
    { value: 'StartTrial', label: 'Start free trial' },
    { value: 'Contact', label: 'Contact' },
    { value: 'Schedule', label: 'Schedule' },
    { value: 'SubmitLead', label: 'Submit lead' },
    { value: 'InitiateCheckout', label: 'Initiate checkout' },
    { value: 'AddToCart', label: 'Add to cart' },
    { value: 'Purchase', label: 'Purchase' },
    { value: 'ViewContent', label: 'View content' },
    { value: 'Donate', label: 'Donate' },
  ];

export const metaConversionEventLabel = (value: string) =>
  META_CONVERSION_EVENT_OPTIONS.find(option => option.value === value)?.label ??
  value;

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
