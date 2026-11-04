import { apiFetch } from './helpers';
import type { CompanyRef } from './index';

export const ADMIN_PARTNER_LANDING_SIGNUPS_ENDPOINT =
  '/api/admin/partner-landing-signups/';

export interface PartnerLandingSignup {
  id: number;
  email: string;
  company: CompanyRef | null;
  appointment_starts_at: string;
  newsletter_subscribed: boolean;
  registered_at: string;
}

export interface PartnerLandingSignupList {
  results: PartnerLandingSignup[];
  appointment_times: string[];
}

export const fetchPartnerLandingSignups = (queryString = '') => {
  const suffix = queryString ? `?${queryString}` : '';
  return apiFetch<PartnerLandingSignupList>(
    `${ADMIN_PARTNER_LANDING_SIGNUPS_ENDPOINT}${suffix}`,
    { method: 'GET' },
  );
};
