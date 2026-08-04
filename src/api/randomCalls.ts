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

export interface LobbySessionSnapshot {
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
  learner_count: number;
  volunteer_count: number;
}

/** @deprecated Use LobbySessionSnapshot */
export type LobbyOccurrenceSnapshot = LobbySessionSnapshot;

export interface LobbySessionData {
  snapshot: LobbySessionSnapshot | null;
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

/** @deprecated Use LobbySessionData */
export type LobbyOverviewData = LobbySessionData;

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
  results: LobbySessionSnapshot[];
  page_size: number;
  pages_total: number;
  next_page: number | null;
  previous_page: number | null;
  last_page: number;
  first_page: number;
  items_total: number;
  results_total: number;
}

export const RANDOM_CALL_LOBBY_ANALYTICS_ENDPOINT =
  '/api/random_calls/analytics/lobbies';

export const getLobbySessionEndpoint = (
  lobbyName = DEFAULT_LOBBY_NAME,
  lobbyUuid?: string,
) => {
  const base = `/api/random_calls/analytics/lobby/${lobbyName}/session`;
  if (!lobbyUuid) return base;
  return `${base}?lobby_uuid=${encodeURIComponent(lobbyUuid)}`;
};

/** @deprecated Use getLobbySessionEndpoint */
export const getLobbyOverviewEndpoint = (lobbyName = DEFAULT_LOBBY_NAME) =>
  getLobbySessionEndpoint(lobbyName);

export const getUpcomingLobbiesEndpoint = (lobbyName = DEFAULT_LOBBY_NAME) =>
  `/api/random_calls/upcoming?name=${encodeURIComponent(lobbyName)}`;

export const fetchLobbyAnalytics = (queryString: string) =>
  apiFetch<PaginatedLobbyAnalytics>(
    `${RANDOM_CALL_LOBBY_ANALYTICS_ENDPOINT}?${queryString}`,
    { method: 'GET' },
  );

export const getLobbySession = async ({
  lobbyName = DEFAULT_LOBBY_NAME,
  lobbyUuid,
  onError,
  onSuccess,
}: {
  lobbyName?: string;
  lobbyUuid?: string;
  onError: (error: unknown) => void;
  onSuccess: (result: LobbySessionData) => void;
}) => {
  try {
    const result = await apiFetch<LobbySessionData>(
      getLobbySessionEndpoint(lobbyName, lobbyUuid),
      { method: 'GET' },
    );
    onSuccess(result);
  } catch (error) {
    onError(error);
  }
};

/** @deprecated Use getLobbySession */
export const getLobbyOverview = getLobbySession;

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
  onSuccess: (result: LobbySessionData) => void;
}) => {
  try {
    const lobby = await apiFetch<LobbyListItem>(
      `/api/random_calls/lobby/${lobbyUuid}/`,
      { method: 'GET' },
    );
    const result = await apiFetch<LobbySessionData>(
      getLobbySessionEndpoint(lobby.name, lobbyUuid),
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
