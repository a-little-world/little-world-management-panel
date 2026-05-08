import { apiFetch } from './helpers';

const DEFAULT_LOBBY_NAME = 'default';

interface Lobby {
  name: string;
  uuid: string;
  start_time: string | null;
  end_time: string;
}

interface LobbyResponse {
  success: boolean;
  message: string;
  lobby: Lobby;
}

export interface MatchProposal {
  uuid: string;
  u1_hash: string;
  u1_name: string;
  u1_user_type?: string;
  u2_hash: string;
  u2_name: string;
  u2_user_type?: string;
  u1_accepted: boolean;
  u2_accepted: boolean;
  accepted: boolean;
  rejected: boolean;
  expired?: boolean;
  completed?: boolean;
  in_session: boolean;
  created_at?: string | null;
}

export interface LobbyOverviewData {
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
    user_hash: string;
    user_name: string;
    is_active: boolean;
    last_status_checked_at: string | null;
    has_pending_match: boolean;
  }>;
  match_proposals: {
    pending: MatchProposal[];
    accepted: MatchProposal[];
    rejected: MatchProposal[];
    expired: MatchProposal[];
    dangling: MatchProposal[];
  };
  statistics: {
    total_matches: number;
    pending_count: number;
    accepted_count: number;
    rejected_count: number;
    expired_count: number;
    dangling_count: number;
  };
}

type ResetLobbyResponse = LobbyResponse;
type CreateLobbyResponse = LobbyResponse;
type EndLobbyResponse = LobbyResponse;
type ClearUserProposalsResponse = {
  success: boolean;
  message: string;
  updated_count: number;
  user_hash: string;
};

type ClearDanglingMatchesResponse = {
  success: boolean;
  message: string;
  updated_count: number;
};

export const getLobbyOverviewEndpoint = () =>
  `/api/random_calls/lobby/${DEFAULT_LOBBY_NAME}/management/overview`;

/** Upcoming lobbies (active or future). Used by Schedule tab and by Manage for next-upcoming. */
export const getUpcomingLobbiesEndpoint = () =>
  `/api/random_calls/upcoming?name=${DEFAULT_LOBBY_NAME}`;

export const getLobbyOverview = async ({
  onError,
  onSuccess,
}: {
  onError: (error: any) => void;
  onSuccess: (result: LobbyOverviewData) => void;
}) => {
  try {
    const result = await apiFetch<LobbyOverviewData>(
      getLobbyOverviewEndpoint(),
      {
        method: 'GET',
      },
    );
    onSuccess(result);
  } catch (error) {
    onError(error);
  }
};

export const resetLobby = async ({
  onError,
  onSuccess,
}: {
  onError: (error: any) => void;
  onSuccess: (result: ResetLobbyResponse) => void;
}) => {
  try {
    const result = await apiFetch<ResetLobbyResponse>(
      `/api/random_calls/lobby/${DEFAULT_LOBBY_NAME}/management/reset`,
      {
        method: 'POST',
      },
    );
    onSuccess(result);
  } catch (error) {
    onError(error);
  }
};

export const createLobby = async ({
  startTime,
  endTime,
  matchProposalTimeout = 60,
  onError,
  onSuccess,
}: {
  startTime: string;
  endTime: string;
  matchProposalTimeout?: number;
  onError: (error: any) => void;
  onSuccess: (result: CreateLobbyResponse) => void;
}) => {
  try {
    const result = await apiFetch<CreateLobbyResponse>(
      `/api/random_calls/lobby/${DEFAULT_LOBBY_NAME}/management/create`,
      {
        method: 'POST',
        body: {
          start_time: startTime,
          end_time: endTime,
          match_proposal_timeout: matchProposalTimeout,
        },
      },
    );
    onSuccess(result);
  } catch (error) {
    onError(error);
  }
};

export const endLobby = async ({
  onError,
  onSuccess,
}: {
  onError: (error: any) => void;
  onSuccess: (result: EndLobbyResponse) => void;
}) => {
  try {
    const result = await apiFetch<EndLobbyResponse>(
      `/api/random_calls/lobby/${DEFAULT_LOBBY_NAME}/management/end`,
      {
        method: 'POST',
      },
    );
    onSuccess(result);
  } catch (error) {
    onError(error);
  }
};

export const clearUserRandomCallProposals = async ({
  userHash,
  onError,
  onSuccess,
}: {
  userHash: string;
  onError: (error: any) => void;
  onSuccess: (result: ClearUserProposalsResponse) => void;
}) => {
  try {
    const result = await apiFetch<ClearUserProposalsResponse>(
      `/api/random_calls/lobby/${DEFAULT_LOBBY_NAME}/management/clear-user-proposals`,
      {
        method: 'POST',
        body: {
          user_hash: userHash,
        },
      },
    );
    onSuccess(result);
  } catch (error) {
    onError(error);
  }
};

export const clearDanglingRandomCallMatches = async ({
  onError,
  onSuccess,
}: {
  onError: (error: any) => void;
  onSuccess: (result: ClearDanglingMatchesResponse) => void;
}) => {
  try {
    const result = await apiFetch<ClearDanglingMatchesResponse>(
      `/api/random_calls/lobby/${DEFAULT_LOBBY_NAME}/management/clear-dangling-matches`,
      {
        method: 'POST',
      },
    );
    onSuccess(result);
  } catch (error) {
    onError(error);
  }
};

export interface LobbyListItem {
  uuid: string;
  name: string;
  start_time: string;
  end_time: string;
  status: boolean;
  active_users_count: number;
}

export const getAllLobbies = async ({
  onError,
  onSuccess,
}: {
  onError: (error: any) => void;
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
  onError: (error: any) => void;
  onSuccess: (result: LobbyOverviewData) => void;
}) => {
  try {
    // First get the lobby to get its name
    const lobby = await apiFetch<LobbyListItem>(
      `/api/random_calls/lobby/${lobbyUuid}/`,
      {
        method: 'GET',
      },
    );
    // Then get the management overview using the lobby name
    const result = await apiFetch<LobbyOverviewData>(
      `/api/random_calls/lobby/${lobby.name}/management/overview`,
      {
        method: 'GET',
      },
    );
    onSuccess(result);
  } catch (error) {
    onError(error);
  }
};

export const getLobbyTasks = async ({
  lobbyName,
  onError,
  onSuccess,
}: {
  lobbyName: string;
  onError: (error: any) => void;
  onSuccess: (result: TasksData) => void;
}) => {
  try {
    const result = await apiFetch<TasksData>(
      `/api/random_calls/lobby/${lobbyName}/management/tasks`,
      {
        method: 'GET',
      },
    );
    onSuccess(result);
  } catch (error) {
    onError(error);
  }
};

export interface TasksData {
  tasks: Array<{
    task_id: string;
    task_name: string;
    status: string;
    date_created: string;
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
