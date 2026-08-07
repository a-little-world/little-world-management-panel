import { apiFetch } from './helpers';

export type PartitionBucket = {
  list_id: string;
  label: string;
  description: string;
};

export type PartitionPhase = {
  id: string;
  title: string;
  buckets: PartitionBucket[];
};

export type PartitionRollup = {
  list_id: string;
  label: string;
  description: string;
  members: string[];
};

export type PartitionDefinitionPayload = {
  id: string;
  title: string;
  description: string;
  baseline_list_id: string;
  phases: PartitionPhase[];
  rollups: PartitionRollup[];
};

export type UserJourneyV5Response = {
  definition: PartitionDefinitionPayload;
  start_date: string;
  end_date: string;
  partition_id: string;
  baseline_list_id: string;
  baseline_count: number;
  counts: Record<string, number>;
  rollup_counts: Record<string, number>;
  summed_count: number;
  balanced: boolean;
  uncovered_count: number;
  uncovered_ids: number[];
  outside_baseline_count: number;
  outside_baseline_ids: number[];
  overlap_counts: Record<string, number>;
  overlap_ids: Record<string, number[]>;
};

export type UserJourneyV5Request = {
  start_date?: string;
  end_date?: string;
  volunteers_only?: boolean;
};

export function fetchUserJourneyV5(
  body: UserJourneyV5Request = {},
): Promise<UserJourneyV5Response> {
  return apiFetch<UserJourneyV5Response>(
    '/api/matching/users/statistics/user_journey_v5/',
    {
      method: 'POST',
      body,
    },
  );
}
