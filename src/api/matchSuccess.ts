export type MatchSuccessTokenBand = {
  min_minutes: number;
  tokens: number;
};

export type MatchSuccessVersionDetails = {
  token_bands?: MatchSuccessTokenBand[];
  success_minutes?: number;
  minutes_per_token_after_success?: number;
  min_mutual_messages?: number;
  min_mutual_video_calls?: number;
  contact_span_days?: number;
  days_since_last_interaction?: number;
  [key: string]: unknown;
};

export type MatchSuccessVersionDocs = {
  id: string;
  title: string;
  description: string;
  can_be_active: boolean;
  uses_tokens: boolean;
  success_token_threshold: number | null;
  is_active: boolean;
  details: MatchSuccessVersionDetails;
};

export type MatchSuccessDocumentation = {
  overview: string;
  qualifying_call_rule: string;
  active_version_id: string;
  versions: MatchSuccessVersionDocs[];
};

export const MATCH_SUCCESS_DOCS_URL = '/api/matching/match_success/';

export function activeSuccessTokenThreshold(
  payload: MatchSuccessDocumentation | undefined,
): number | null {
  return (
    payload?.versions.find(version => version.is_active)
      ?.success_token_threshold ?? null
  );
}
