import { apiFetch } from './helpers';
import type { CompanyRef } from './index';

export const ADMIN_PARTNER_EVENT_REGISTRATIONS_ENDPOINT =
  '/api/admin/partner-event-registrations/';
export const ADMIN_EXTERNAL_SESSIONS_ENDPOINT = '/api/admin/external-sessions/';

export type RegistrationRole = 'partner' | 'learner';

export interface PartnerEventRegistration {
  id: number;
  email: string;
  role: RegistrationRole;
  company: CompanyRef | null;
  lobby_name: string | null;
  appointment_starts_at: string | null;
  newsletter_subscribed: boolean;
  registered_at: string;
  /** A landing signup whose confirmation mail was opened. Learner bookings are always confirmed. */
  confirmed: boolean;
}

export interface PartnerEventRegistrationList {
  results: PartnerEventRegistration[];
  appointment_times: string[];
}

export interface ExternalSessionCompanyOption {
  id: number;
  slug: string;
  name: string;
}

export interface ExternalSession {
  uuid: string;
  name: string;
  company: CompanyRef | null;
  company_id: number | null;
  start_time: string;
  end_time: string;
  enforce_email_domain: boolean;
  live_support_url: string;
  landing_path: string;
  /** Confirmed landing signups: the ones that add learner seats. */
  registration_count: number;
  /** Landing signups whose confirmation mail was never opened. A record only. */
  unconfirmed_registration_count: number;
  learner_registration_count: number;
}

export interface ExternalSessionList {
  results: ExternalSession[];
  companies: ExternalSessionCompanyOption[];
}

export interface ExternalSessionWrite {
  name: string;
  company_id: number | null;
  start_time: string;
  end_time: string;
  enforce_email_domain: boolean;
  live_support_url: string;
}

/** Landing pages are served by the main frontend on the same origin. */
export const externalSessionLandingUrl = (landingPath: string) =>
  `${window.location.origin}${landingPath}`;

export const fetchPartnerEventRegistrations = (queryString = '') => {
  const suffix = queryString ? `?${queryString}` : '';
  return apiFetch<PartnerEventRegistrationList>(
    `${ADMIN_PARTNER_EVENT_REGISTRATIONS_ENDPOINT}${suffix}`,
    { method: 'GET' },
  );
};

export const fetchExternalSessions = () =>
  apiFetch<ExternalSessionList>(ADMIN_EXTERNAL_SESSIONS_ENDPOINT, {
    method: 'GET',
  });

export const createExternalSession = (body: ExternalSessionWrite) =>
  apiFetch<ExternalSession>(ADMIN_EXTERNAL_SESSIONS_ENDPOINT, {
    method: 'POST',
    body,
  });

export const updateExternalSession = (
  uuid: string,
  body: ExternalSessionWrite,
) =>
  apiFetch<ExternalSession>(`${ADMIN_EXTERNAL_SESSIONS_ENDPOINT}${uuid}/`, {
    method: 'PATCH',
    body,
  });
