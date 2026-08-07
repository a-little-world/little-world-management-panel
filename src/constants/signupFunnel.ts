import type { BucketDisplayMeta, FunnelMergeGroup } from '../helpers/stats';

/**
 * Frontend mirror of ``management.analytics.user_journey.funnels.SIGNUP_FUNNEL``.
 *
 * Labels and descriptions are owned by ``management.analytics.user_journey.catalog``.
 * This mirror exists until the server emits ``FunnelDefinition.display_meta()``;
 * keep it in sync with the catalog until then.
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
  'funnel__all',
  'funnel__active_adjusted',
  'funnel__email_verified',
  'funnel__form_completed',
  'funnel__eligible_for_onboarding',
  'funnel__onboarding_started',
  'funnel__onboarded',
];

/** Stage funnel has no merge groups — onboarding started is one stage query. */
export const SIGNUP_FUNNEL_MERGE_GROUPS: FunnelMergeGroup[] = [];

export const USER_SIGNUP_FUNNEL_BUCKET_META: Record<string, BucketDisplayMeta> =
  {
    funnel__all: {
      label: 'Total registered users',
      description: 'All users in the pre-filtered cohort (ordered by date joined).',
    },
    funnel__active_adjusted: {
      label: 'Adjusted registered users',
      description:
        'Active accounts that are not deleted (may still be unverified).',
    },
    funnel__email_verified: {
      label: 'Email verified',
      description: 'Active, non-deleted users who verified their email.',
    },
    funnel__form_completed: {
      label: 'Form completed',
      description:
        'Users who completed the registration form (includes A0 German / outside-DE).',
    },
    funnel__eligible_for_onboarding: {
      label: 'Eligible for onboarding',
      description:
        'Form-complete users not blocked by an active ineligibility reason (A0 German or residence outside DE, unless forced eligible).',
    },
    funnel__onboarding_started: {
      label: 'Onboarding started',
      description:
        'Users who booked a call or started self-onboarding (includes already onboarded).',
    },
    funnel__onboarded: {
      label: 'Onboarded',
      description: 'Users who completed onboarding.',
    },
  };
