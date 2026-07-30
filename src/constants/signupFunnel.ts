import type { BucketDisplayMeta, FunnelMergeGroup } from '../helpers/stats';

/**
 * Frontend mirror of ``management.analytics.funnels.SIGNUP_FUNNEL``.
 *
 * Stage semantics: each bar is the membership count of that stage
 * (users who reached it). No subtraction.
 *
 * Snapshot: signup-date cohort classified by current state.
 */
export const SIGNUP_FUNNEL_ID = 'user-signup-funnel';
export const SIGNUP_FUNNEL_TITLE = 'User Signup Funnel';
export const SIGNUP_FUNNEL_MODE = 'stage' as const;

export const SIGNUP_FUNNEL_FILTERS: string[] = [
  'all',
  'signup__stage_active_adjusted',
  'signup__stage_email_verified',
  'signup__stage_form_completed',
  'signup__stage_eligible_for_onboarding',
  'signup__stage_onboarding_started',
  'signup__stage_onboarded',
];

/** Stage funnel has no merge groups — onboarding started is one stage query. */
export const SIGNUP_FUNNEL_MERGE_GROUPS: FunnelMergeGroup[] = [];

export const USER_SIGNUP_FUNNEL_BUCKET_META: Record<string, BucketDisplayMeta> =
  {
    all: {
      label: 'Total registered users',
    },
    signup__stage_active_adjusted: {
      label: 'Adjusted registered users',
      description: 'Excludes accounts that have been deleted or deactivated.',
    },
    signup__stage_email_verified: {
      label: 'Email verified',
      description: 'Non-deleted users who verified their email.',
    },
    signup__stage_form_completed: {
      label: 'Form completed',
      description:
        'Users who completed the registration form (incl. learners with A1/A2 / outside-DE).',
    },
    signup__stage_eligible_for_onboarding: {
      label: 'Eligible for onboarding',
      description:
        'Excludes learners that have A1/A2 or live outside DE (unless forced eligible).',
    },
    signup__stage_onboarding_started: {
      label: 'Onboarding started',
      description:
        'Users who booked a call, started self-onboarding, or finished onboarding.',
    },
    signup__stage_onboarded: {
      label: 'Onboarded',
    },
  };
