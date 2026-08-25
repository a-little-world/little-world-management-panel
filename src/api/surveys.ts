import { apiFetch } from './helpers';

/**
 * Survey campaigns are configuration: audience, window, cadence, questions and copy all live
 * on the row, so launching a survey is a form here rather than a deploy.
 */

export const ADMIN_SURVEY_CAMPAIGNS_ENDPOINT = '/api/admin/survey_campaigns/';

/** German is required; English falls back to it, so a German-only campaign is complete. */
export type LocalizedText = {
  de?: string;
  en?: string;
};

export type SurveyQuestionType = 'rating' | 'text' | 'choice';

export interface SurveyChoiceOption {
  value: string;
  label: LocalizedText;
}

export interface SurveyQuestion {
  id: string;
  type: SurveyQuestionType;
  required: boolean;
  label: LocalizedText;
  placeholder?: LocalizedText;
  options?: SurveyChoiceOption[];
}

export interface SurveyCampaignCopy {
  title: LocalizedText;
  description: LocalizedText;
  submit_button: LocalizedText;
}

export type SurveyAudienceType = 'all' | 'company' | 'filter';
export type SurveyTrigger = 'on_session' | 'event:call_ended';
export type SurveyEligibleAfterEvent =
  | ''
  | 'onboarded'
  | 'first_qualifying_call'
  | 'match_created'
  | 'match_success';
export type SurveyRepeatScope = 'user' | 'context';
export type SurveyContextType = '' | 'live_session' | 'match';

export interface SurveyAudienceFilterOption {
  value: string;
  label: string;
}

export interface SurveyAudienceOptions {
  companies: string[];
  filters: SurveyAudienceFilterOption[];
}

export interface SurveyCampaignPayload {
  slug: string;
  name: string;
  copy: SurveyCampaignCopy;
  scale: number;
  questions: SurveyQuestion[];
  audience_type: SurveyAudienceType;
  audience_value: string;
  trigger: SurveyTrigger;
  eligible_after_event: SurveyEligibleAfterEvent;
  eligible_after_since: string | null;
  repeat_scope: SurveyRepeatScope;
  context_type: SurveyContextType;
  active: boolean;
  starts_at: string | null;
  ends_at: string | null;
  max_shows: number;
}

export interface SurveyCampaign extends SurveyCampaignPayload {
  id: number;
  created_at: string;
  updated_at: string;
  /** Offers created. */
  offered: number;
  /** Offers the user answered. */
  answered: number;
  /** Offers the client confirmed it displayed — flat at 0 means delivery is broken. */
  rendered: number;
  mean_rating: number | null;
  /** What still blocks activation. Empty means the campaign can go live. */
  missing_copy: string[];
  /** Question ids with answers: their id and type are frozen. */
  locked_questions?: string[];
  /** True once a rating has been submitted — scale must not change. */
  scale_locked?: boolean;
  audience_label?: string;
}

export const fetchSurveyCampaigns = () =>
  apiFetch<SurveyCampaign[]>(ADMIN_SURVEY_CAMPAIGNS_ENDPOINT, {
    method: 'GET',
  });

export const fetchSurveyAudienceOptions = () =>
  apiFetch<SurveyAudienceOptions>(
    `${ADMIN_SURVEY_CAMPAIGNS_ENDPOINT}options/`,
    { method: 'GET' },
  );

export const fetchSurveyCampaign = (id: number) =>
  apiFetch<SurveyCampaign>(`${ADMIN_SURVEY_CAMPAIGNS_ENDPOINT}${id}/`, {
    method: 'GET',
  });

export const createSurveyCampaign = (payload: SurveyCampaignPayload) =>
  apiFetch<SurveyCampaign>(ADMIN_SURVEY_CAMPAIGNS_ENDPOINT, {
    method: 'POST',
    body: payload,
  });

export const updateSurveyCampaign = (
  id: number,
  payload: SurveyCampaignPayload,
) =>
  apiFetch<SurveyCampaign>(`${ADMIN_SURVEY_CAMPAIGNS_ENDPOINT}${id}/`, {
    method: 'PATCH',
    body: payload,
  });

export const deleteSurveyCampaign = (id: number) =>
  apiFetch<void>(`${ADMIN_SURVEY_CAMPAIGNS_ENDPOINT}${id}/`, {
    method: 'DELETE',
  });

export const ADMIN_SURVEY_RESPONSES_ENDPOINT = '/api/admin/survey_responses/';

export interface SurveyFilterOption {
  label: string;
  value: string;
}

export type SurveyResponseStatus =
  | 'shown'
  | 'submitted'
  | 'dismissed'
  | 'expired';

export interface AdminSurveyResponse {
  id: number;
  campaign_id: number;
  campaign_name: string;
  user_id: number;
  user_email: string;
  status: SurveyResponseStatus;
  rating: number | null;
  comment: string;
  shown_count: number;
  created_at: string;
  submitted_at: string | null;
}

export interface AdminSurveyResponseList {
  count: number;
  page: number;
  next?: string | null;
  previous?: string | null;
  results: AdminSurveyResponse[];
  page_size: number;
  pages_total: number;
  next_page: number | null;
  previous_page: number | null;
  last_page: number;
  first_page: number;
  items_total: number;
  results_total: number;
  campaign_options: SurveyFilterOption[];
  status_options: SurveyFilterOption[];
}

export const fetchSurveyResponses = (queryString: string) =>
  apiFetch<AdminSurveyResponseList>(
    queryString
      ? `${ADMIN_SURVEY_RESPONSES_ENDPOINT}?${queryString}`
      : ADMIN_SURVEY_RESPONSES_ENDPOINT,
    { method: 'GET' },
  );
