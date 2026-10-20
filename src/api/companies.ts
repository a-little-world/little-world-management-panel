import { BLUE_40, GRAY_40, ORANGE_40, PURPLE_40, RED_40 } from '../constants';
import type { CompanyRef } from './index';
import { apiFetch } from './helpers';

/**
 * Partner companies and their cohorts. The flags on a company are defaults for every user in
 * it; a user can still override match priority and force-match eligibility individually.
 *
 * Nothing is deleted: users reference companies, so retiring one means `is_active: false`.
 */

export const ADMIN_COMPANIES_ENDPOINT = '/api/admin/companies/';

export interface CompanyCohort {
  id: number;
  slug: string;
  name: string;
  is_active: boolean;
  created_at: string;
  user_count: number;
}

/** Must match `COMPANY_FLAG_FIELDS` on the backend. */
export type CompanyFlag =
  | 'custom_onboarding'
  | 'force_match_eligible'
  | 'match_priority'
  | 'skip_email_verification'
  | 'disable_time_overlap_score';

export type CompanyFlags = Record<CompanyFlag, boolean>;

/** The short link partners share so signups land in the company (sets `lw-company`). */
export interface CompanySignupLink {
  id: number;
  tag: string;
  /** Where the short link redirects to. */
  url: string;
  archived: boolean;
  /** False when the link is archived or its `lw-company` cookie no longer names the company. */
  sets_company: boolean;
  /** The cohort the link assigns, or null when it signs users up to the whole company. */
  cohort: CompanyRef | null;
}

export interface Company extends CompanyFlags {
  id: number;
  slug: string;
  name: string;
  description: string;
  /**
   * e.g. `little-world.com`. New users with an email at exactly this domain join the company,
   * ahead of any company cookie. Null when unset.
   */
  email_domain: string | null;
  /** Relative or absolute URL of the logo, or null if none. Set via `uploadCompanyLogo`. */
  logo: string | null;
  is_active: boolean;
  created_at: string;
  updated_at: string;
  user_count: number;
  /** Created with the company; null only if it was never set up. */
  signup_link: CompanySignupLink | null;
  /** Newest first. */
  cohorts: CompanyCohort[];
}

/** Slug is only accepted on create — the backend refuses to change it afterwards. */
export type CompanyPayload = Pick<
  Company,
  'slug' | 'name' | 'description' | 'email_domain' | 'is_active'
> &
  CompanyFlags;

/**
 * Labels and helper copy for each flag, shared by the list tags and the edit form so the
 * two cannot drift. Order is the order they are shown in.
 */
export const COMPANY_FLAG_CONFIG: Record<
  CompanyFlag,
  { label: string; description: string; color: string }
> = {
  custom_onboarding: {
    color: BLUE_40,
    label: 'Custom onboarding',
    description:
      'Users skip the onboarding call when they complete their profile.',
  },
  force_match_eligible: {
    color: PURPLE_40,
    label: 'Force match eligible',
    description:
      'Default for bypassing the A0 language level and outside-Germany checks. Can be overridden per user.',
  },
  match_priority: {
    color: ORANGE_40,
    label: 'Match priority',
    description:
      'Default match priority for its users (can be overridden per user). Also allows international SMS for all of its users; the per-user override does not change SMS.',
  },
  skip_email_verification: {
    color: RED_40,
    label: 'Skip email verification',
    description:
      'New signups skip email verification. Security sensitive: their email address is never confirmed.',
  },
  disable_time_overlap_score: {
    color: GRAY_40,
    label: 'Ignore time overlap',
    description:
      'Scoring ignores availability overlap when both users are in a company with this flag.',
  },
};

export const COMPANY_FLAGS = Object.keys(COMPANY_FLAG_CONFIG) as CompanyFlag[];

export const fetchCompanies = () =>
  apiFetch<Company[]>(ADMIN_COMPANIES_ENDPOINT, { method: 'GET' });

export const fetchCompany = (id: number) =>
  apiFetch<Company>(`${ADMIN_COMPANIES_ENDPOINT}${id}/`, { method: 'GET' });

export const createCompany = (payload: CompanyPayload) =>
  apiFetch<Company>(ADMIN_COMPANIES_ENDPOINT, {
    method: 'POST',
    body: payload,
  });

export const updateCompany = (
  id: number,
  payload: Partial<Omit<CompanyPayload, 'slug'>>,
) =>
  apiFetch<Company>(`${ADMIN_COMPANIES_ENDPOINT}${id}/`, {
    method: 'PATCH',
    body: payload,
  });

/** Upload a new logo (multipart PATCH to the dedicated logo endpoint). */
export const uploadCompanyLogo = (id: number, file: File) => {
  const fd = new FormData();
  fd.append('logo', file);
  return apiFetch<Company>(`${ADMIN_COMPANIES_ENDPOINT}${id}/logo/`, {
    method: 'PATCH',
    body: fd,
  });
};

export const removeCompanyLogo = (id: number) =>
  apiFetch<Company>(`${ADMIN_COMPANIES_ENDPOINT}${id}/logo/`, {
    method: 'DELETE',
  });

/** Give the company a working sign-up link again (adopts or creates one). */
export const ensureCompanySignupLink = (id: number) =>
  apiFetch<Company>(`${ADMIN_COMPANIES_ENDPOINT}${id}/signup_link/`, {
    method: 'POST',
  });

/** Cohort writes return the whole company, so callers can drop the result straight into SWR. */
export const createCompanyCohort = (
  companyId: number,
  payload: Pick<CompanyCohort, 'slug' | 'name'>,
) =>
  apiFetch<Company>(`${ADMIN_COMPANIES_ENDPOINT}${companyId}/cohorts/`, {
    method: 'POST',
    body: payload,
  });

export const updateCompanyCohort = (
  companyId: number,
  cohortId: number,
  payload: Partial<Pick<CompanyCohort, 'name' | 'is_active'>>,
) =>
  apiFetch<Company>(
    `${ADMIN_COMPANIES_ENDPOINT}${companyId}/cohorts/${cohortId}/`,
    { method: 'PATCH', body: payload },
  );

/** "FH Aachen · SoSe 26" — the company name, plus the cohort when there is one. */
export const formatCompanyLabel = (
  company: CompanyRef | null | undefined,
  cohort?: CompanyRef | null,
) => {
  if (!company) return '';
  return cohort ? `${company.name} · ${cohort.name}` : company.name;
};
