import { apiFetch } from './helpers';

const DEFAULT_LOBBY_NAME = 'default';

export interface MatchProposal {
  uuid: string;
  u1_uuid: string;
  u1_name: string;
  u1_user_type?: string;
  u2_uuid: string;
  u2_name: string;
  u2_user_type?: string;
  u1_accepted: boolean;
  u2_accepted: boolean;
  u1_status?: string;
  u2_status?: string;
  accepted: boolean;
  rejected: boolean;
  expired?: boolean;
  completed?: boolean;
  in_session: boolean;
  created_at?: string | null;
}

export interface LobbyParticipant {
  user_id: number;
  user_uuid: string;
  user_name: string;
  user_type?: string;
  is_active: boolean;
  first_joined_at: string | null;
  completed_calls: number;
  unsuccessful_proposals: number;
  accepted_proposals: number;
  longest_call_duration_seconds: number;
  profile: {
    first_name: string;
    image_type: string;
    avatar_config: Record<string, unknown>;
    image: string | null;
  };
}

export interface LobbyListItem {
  uuid: string;
  name: string;
  start_time: string;
  end_time: string;
  status: boolean;
  active_users_count: number;
}

export interface LobbyInstanceSnapshot {
  lobby_uuid: string;
  lobby_name: string;
  start_time: string | null;
  end_time: string | null;
  day: string | null;
  date: string | null;
  total_users: number;
  first_time_users: number;
  returning_users: number;
  proposals_total: number;
  proposals_accepted: number;
  proposals_rejected: number;
  proposals_expired: number;
  proposals_pending: number;
  proposals_dangling: number;
  completed_calls: number;
  users_with_successful_calls: number;
  learner_count: number;
  volunteer_count: number;
  bucket_mismatch: number;
  /** False while lobby end_time is still in the future — persisted buckets may lag operational counts. */
  proposals_are_final: boolean;
}

type SnapshotProposalBucketFields = Pick<
  LobbyInstanceSnapshot,
  | 'proposals_accepted'
  | 'proposals_rejected'
  | 'proposals_expired'
  | 'proposals_pending'
  | 'proposals_dangling'
>;

/** Sum of mutually exclusive proposal buckets (always consistent on screen). */
export function snapshotProposalPartsTotal(
  snapshot: SnapshotProposalBucketFields,
): number {
  return (
    snapshot.proposals_accepted +
    snapshot.proposals_rejected +
    snapshot.proposals_expired +
    snapshot.proposals_pending +
    snapshot.proposals_dangling
  );
}

/** Use bucket sum when persisted total does not reconcile (bucket_mismatch ≠ 0). */
export function displaySnapshotProposalsTotal(
  snapshot: SnapshotProposalBucketFields & {
    proposals_total: number;
    bucket_mismatch: number;
  },
): number {
  if (snapshot.bucket_mismatch) {
    return snapshotProposalPartsTotal(snapshot);
  }
  return snapshot.proposals_total;
}

export interface LobbyInstanceData {
  snapshot: LobbyInstanceSnapshot | null;
  lobby: {
    name: string;
    uuid: string;
    is_active: boolean;
    start_time: string | null;
    end_time: string | null;
    active_users_count: number;
    total_users_count: number;
  };
  active_users: Array<{
    uuid: string;
    user_uuid: string;
    user_name: string;
    user_type?: string;
    is_active: boolean;
    last_status_checked_at: string | null;
    has_pending_match: boolean;
  }>;
  lobby_participants: LobbyParticipant[];
  match_proposals: {
    pending: MatchProposal[];
    accepted: MatchProposal[];
    rejected: MatchProposal[];
    expired: MatchProposal[];
    dangling: MatchProposal[];
  };
  proposal_statistics: {
    total_matches: number;
    pending_count: number;
    accepted_count: number;
    rejected_count: number;
    expired_count: number;
    dangling_count: number;
  };
}

export interface TasksData {
  tasks: Array<{
    task_id: string;
    task_name: string;
    status: string;
    date_created: string | null;
    date_done: string | null;
    result: string | null;
    traceback: string | null;
    worker: string | null;
  }>;
  statistics: {
    total: number;
    success: number;
    failure: number;
    pending: number;
  };
  task_statistics: Record<
    string,
    {
      total: number;
      success: number;
      failure: number;
      pending: number;
    }
  >;
}

export interface PaginatedLobbyAnalytics {
  count: number;
  page: number;
  next: string | null;
  previous: string | null;
  results: LobbyInstanceSnapshot[];
  page_size: number;
  pages_total: number;
  next_page: number | null;
  previous_page: number | null;
  last_page: number;
  first_page: number;
  items_total: number;
  results_total: number;
}

/** Share of lobby participants who completed at least one call. */
export function formatSuccessfulCallUserPct(snapshot: {
  total_users: number;
  users_with_successful_calls: number;
}): string {
  if (!snapshot.total_users) return '—';
  const pct = Math.round(
    (100 * snapshot.users_with_successful_calls) / snapshot.total_users,
  );
  return `${pct}%`;
}

export function usersWithoutSuccessfulCall(snapshot: {
  total_users: number;
  users_with_successful_calls: number;
}): number {
  return snapshot.total_users - snapshot.users_with_successful_calls;
}

export interface LobbyTrendsResponse {
  count: number;
  results: LobbyInstanceSnapshot[];
}

export const RANDOM_CALL_LOBBY_ANALYTICS_ENDPOINT =
  '/api/random_calls/analytics/lobbies';

export const RANDOM_CALL_LOBBY_TRENDS_ENDPOINT =
  '/api/random_calls/analytics/lobbies/trends';

export const getLobbyInstanceEndpoint = (
  lobbyName = DEFAULT_LOBBY_NAME,
  lobbyUuid?: string,
) => {
  const base = `/api/random_calls/analytics/lobby/${lobbyName}/instance`;
  if (!lobbyUuid) return base;
  return `${base}?lobby_uuid=${encodeURIComponent(lobbyUuid)}`;
};

export const getUpcomingLobbiesEndpoint = (lobbyName = DEFAULT_LOBBY_NAME) =>
  `/api/random_calls/upcoming?name=${encodeURIComponent(lobbyName)}`;

export const fetchLobbyAnalytics = (queryString: string) =>
  apiFetch<PaginatedLobbyAnalytics>(
    `${RANDOM_CALL_LOBBY_ANALYTICS_ENDPOINT}?${queryString}`,
    { method: 'GET' },
  );

export const fetchLobbyTrends = (queryString: string) =>
  apiFetch<LobbyTrendsResponse>(
    `${RANDOM_CALL_LOBBY_TRENDS_ENDPOINT}?${queryString}`,
    { method: 'GET' },
  );

export const getLobbyInstance = async ({
  lobbyName = DEFAULT_LOBBY_NAME,
  lobbyUuid,
  onError,
  onSuccess,
}: {
  lobbyName?: string;
  lobbyUuid?: string;
  onError: (error: unknown) => void;
  onSuccess: (result: LobbyInstanceData) => void;
}) => {
  try {
    const result = await apiFetch<LobbyInstanceData>(
      getLobbyInstanceEndpoint(lobbyName, lobbyUuid),
      { method: 'GET' },
    );
    onSuccess(result);
  } catch (error) {
    onError(error);
  }
};

export const getAllLobbies = async ({
  onError,
  onSuccess,
}: {
  onError: (error: unknown) => void;
  onSuccess: (result: LobbyListItem[]) => void;
}) => {
  try {
    const result = await apiFetch<LobbyListItem[]>('/api/random_calls/', {
      method: 'GET',
    });
    onSuccess(result);
  } catch (error) {
    onError(error);
  }
};

export const getLobbyByUuid = async ({
  lobbyUuid,
  onError,
  onSuccess,
}: {
  lobbyUuid: string;
  onError: (error: unknown) => void;
  onSuccess: (result: LobbyInstanceData) => void;
}) => {
  try {
    const lobby = await apiFetch<LobbyListItem>(
      `/api/random_calls/lobby/${lobbyUuid}/`,
      { method: 'GET' },
    );
    const result = await apiFetch<LobbyInstanceData>(
      getLobbyInstanceEndpoint(lobby.name, lobbyUuid),
      { method: 'GET' },
    );
    onSuccess(result);
  } catch (error) {
    onError(error);
  }
};

export const getLobbyTasks = async ({
  lobbyName,
  lobbyUuid,
  onError,
  onSuccess,
}: {
  lobbyName: string;
  lobbyUuid?: string;
  onError: (error: unknown) => void;
  onSuccess: (result: TasksData) => void;
}) => {
  try {
    const query = lobbyUuid
      ? `?lobby_uuid=${encodeURIComponent(lobbyUuid)}`
      : '';
    const result = await apiFetch<TasksData>(
      `/api/random_calls/lobby/${lobbyName}/management/tasks${query}`,
      { method: 'GET' },
    );
    onSuccess(result);
  } catch (error) {
    onError(error);
  }
};

export const resetLobby = async ({
  lobbyName = DEFAULT_LOBBY_NAME,
  onError,
  onSuccess,
}: {
  lobbyName?: string;
  onError: (error: unknown) => void;
  onSuccess: (result: { success: boolean; message: string }) => void;
}) => {
  try {
    const result = await apiFetch<{ success: boolean; message: string }>(
      `/api/random_calls/lobby/${lobbyName}/management/reset`,
      { method: 'POST' },
    );
    onSuccess(result);
  } catch (error) {
    onError(error);
  }
};

export const createLobby = async ({
  lobbyName = DEFAULT_LOBBY_NAME,
  startTime,
  endTime,
  matchProposalTimeout = 60,
  onError,
  onSuccess,
}: {
  lobbyName?: string;
  startTime: string;
  endTime: string;
  matchProposalTimeout?: number;
  onError: (error: unknown) => void;
  onSuccess: (result: {
    success: boolean;
    message: string;
    lobby: LobbyListItem;
  }) => void;
}) => {
  try {
    const result = await apiFetch<{
      success: boolean;
      message: string;
      lobby: LobbyListItem;
    }>(`/api/random_calls/lobby/${lobbyName}/management/create`, {
      method: 'POST',
      body: {
        start_time: startTime,
        end_time: endTime,
        match_proposal_timeout: matchProposalTimeout,
      },
    });
    onSuccess(result);
  } catch (error) {
    onError(error);
  }
};

export const endLobby = async ({
  lobbyName = DEFAULT_LOBBY_NAME,
  onError,
  onSuccess,
}: {
  lobbyName?: string;
  onError: (error: unknown) => void;
  onSuccess: (result: { success: boolean; message: string }) => void;
}) => {
  try {
    const result = await apiFetch<{ success: boolean; message: string }>(
      `/api/random_calls/lobby/${lobbyName}/management/end`,
      { method: 'POST' },
    );
    onSuccess(result);
  } catch (error) {
    onError(error);
  }
};

export const clearUserRandomCallProposals = async ({
  userUuid,
  lobbyName = DEFAULT_LOBBY_NAME,
  onError,
  onSuccess,
}: {
  userUuid: string;
  lobbyName?: string;
  onError: (error: unknown) => void;
  onSuccess: (result: {
    success: boolean;
    message: string;
    updated_count: number;
    user_uuid: string;
  }) => void;
}) => {
  try {
    const result = await apiFetch<{
      success: boolean;
      message: string;
      updated_count: number;
      user_uuid: string;
    }>(
      `/api/random_calls/lobby/${lobbyName}/management/clear-user-proposals`,
      {
        method: 'POST',
        body: { user_uuid: userUuid },
      },
    );
    onSuccess(result);
  } catch (error) {
    onError(error);
  }
};

export const clearDanglingRandomCallMatches = async ({
  lobbyName = DEFAULT_LOBBY_NAME,
  onError,
  onSuccess,
}: {
  lobbyName?: string;
  onError: (error: unknown) => void;
  onSuccess: (result: {
    success: boolean;
    message: string;
    updated_count: number;
  }) => void;
}) => {
  try {
    const result = await apiFetch<{
      success: boolean;
      message: string;
      updated_count: number;
    }>(
      `/api/random_calls/lobby/${lobbyName}/management/clear-dangling-proposals`,
      { method: 'POST' },
    );
    onSuccess(result);
  } catch (error) {
    onError(error);
  }
};
