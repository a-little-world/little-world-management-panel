import { apiFetch } from './helpers';
import type {
  PartitionDefinitionPayload,
  UserJourneyV5Response,
} from './userJourney';

export type MatchJourneyV5DefinitionResponse = {
  definition: PartitionDefinitionPayload;
};

export type MatchJourneyV5Response = Omit<
  UserJourneyV5Response,
  'start_date' | 'end_date'
> & {
  start_date: string | null;
  end_date: string | null;
};

export type MatchJourneyV5Request = {
  start_date?: string | null;
  end_date?: string | null;
};

export function fetchMatchJourneyV5Definition(): Promise<MatchJourneyV5DefinitionResponse> {
  return apiFetch<MatchJourneyV5DefinitionResponse>(
    '/api/matching/users/statistics/match_journey_v5/definition/',
    { method: 'GET' },
  );
}

export function fetchMatchJourneyV5(
  body: MatchJourneyV5Request = {},
): Promise<MatchJourneyV5Response> {
  return apiFetch<MatchJourneyV5Response>(
    '/api/matching/users/statistics/match_journey_v5/',
    {
      method: 'POST',
      body,
    },
  );
}
