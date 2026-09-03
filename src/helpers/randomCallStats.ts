import { LobbyInstanceSnapshot } from '../api/randomCalls';

/** The pair of fields every successful-call figure on this feature is derived from. */
type SuccessfulCallCounts = {
  total_users: number;
  users_with_successful_calls: number;
};

/** Share of lobby participants who completed at least one call; null for an empty lobby. */
export function successfulCallUserPct(
  snapshot: SuccessfulCallCounts,
): number | null {
  if (!snapshot.total_users) return null;
  return (100 * snapshot.users_with_successful_calls) / snapshot.total_users;
}

export function formatSuccessfulCallUserPct(
  snapshot: SuccessfulCallCounts,
): string {
  return formatTrendPctStat(successfulCallUserPct(snapshot));
}

/** Share of a whole as a percentage, or null when the whole is empty. */
export function sharePct(part: number, whole: number): number | null {
  if (!whole) return null;
  return (100 * part) / whole;
}

/** Guarded division for derived overview figures; null when there is nothing to divide by. */
export function ratioOrNull(
  numerator: number,
  denominator: number,
): number | null {
  if (!denominator) return null;
  return numerator / denominator;
}

export function usersWithoutSuccessfulCall(
  snapshot: SuccessfulCallCounts,
): number {
  return snapshot.total_users - snapshot.users_with_successful_calls;
}

export type TrendOverviewStats = {
  sessionCount: number;
  medianParticipants: number | null;
  medianLearners: number | null;
  medianVolunteers: number | null;
  medianFirstTimeUsers: number | null;
  medianReturningUsers: number | null;
  medianCallsPerLobby: number | null;
  meanCallsPerParticipant: number | null;
  medianCallsPerParticipant: number | null;
  medianSuccessfulCallPct: number | null;
  medianRejectedPct: number | null;
};

function median(values: number[]): number | null {
  if (values.length === 0) return null;
  const sorted = [...values].sort((a, b) => a - b);
  const mid = Math.floor(sorted.length / 2);
  if (sorted.length % 2 === 0) {
    return (sorted[mid - 1] + sorted[mid]) / 2;
  }
  return sorted[mid];
}

function mean(values: number[]): number | null {
  if (values.length === 0) return null;
  return values.reduce((sum, value) => sum + value, 0) / values.length;
}

function roundStat(value: number | null, decimals = 0): number | null {
  if (value == null) return null;
  const factor = 10 ** decimals;
  return Math.round(value * factor) / factor;
}

export function computeTrendOverviewStats(
  snapshots: LobbyInstanceSnapshot[],
): TrendOverviewStats {
  if (snapshots.length === 0) {
    return {
      sessionCount: 0,
      medianParticipants: null,
      medianLearners: null,
      medianVolunteers: null,
      medianFirstTimeUsers: null,
      medianReturningUsers: null,
      medianCallsPerLobby: null,
      meanCallsPerParticipant: null,
      medianCallsPerParticipant: null,
      medianSuccessfulCallPct: null,
      medianRejectedPct: null,
    };
  }

  const sessionsWithParticipants = snapshots.filter(row => row.total_users > 0);

  const callsPerParticipant = sessionsWithParticipants.map(
    row => row.completed_calls / row.total_users,
  );
  const successfulCallPcts = sessionsWithParticipants.map(
    row => successfulCallUserPct(row) ?? 0,
  );
  // Sessions with no proposals at all have no rejection rate to speak of; including them
  // as 0% would pull the median toward a number no session actually had.
  const rejectedPcts = snapshots
    .filter(row => row.proposals_total > 0)
    .map(row => (100 * row.proposals_rejected) / row.proposals_total);

  return {
    sessionCount: snapshots.length,
    medianParticipants: roundStat(
      median(snapshots.map(row => row.total_users)),
    ),
    medianLearners: roundStat(median(snapshots.map(row => row.learner_count))),
    medianVolunteers: roundStat(
      median(snapshots.map(row => row.volunteer_count)),
    ),
    medianFirstTimeUsers: roundStat(
      median(snapshots.map(row => row.first_time_users)),
    ),
    medianReturningUsers: roundStat(
      median(snapshots.map(row => row.returning_users)),
    ),
    medianCallsPerLobby: roundStat(
      median(snapshots.map(row => row.completed_calls)),
    ),
    meanCallsPerParticipant: roundStat(mean(callsPerParticipant), 2),
    medianCallsPerParticipant: roundStat(median(callsPerParticipant), 2),
    medianSuccessfulCallPct: roundStat(median(successfulCallPcts)),
    medianRejectedPct: roundStat(median(rejectedPcts)),
  };
}

export function formatTrendCountStat(value: number | null): string {
  if (value == null) return '—';
  return Number.isInteger(value) ? String(value) : value.toFixed(1);
}

export function formatTrendPctStat(value: number | null): string {
  if (value == null) return '—';
  return `${Math.round(value)}%`;
}

export function formatTrendRateStat(value: number | null): string {
  if (value == null) return '—';
  return value.toFixed(2);
}

function gcd(a: number, b: number): number {
  let x = Math.abs(Math.round(a));
  let y = Math.abs(Math.round(b));
  while (y !== 0) {
    [x, y] = [y, x % y];
  }
  return x;
}

/**
 * Simplified first-time : returning ratio, e.g. `1 : 4`.
 *
 * Callers pass the two medians, so this is the ratio *of* medians — not the median
 * of per-session ratios. Label it accordingly.
 */
export function formatTrendFirstTimeReturningRatio(
  firstTime: number | null,
  returning: number | null,
): string {
  if (firstTime == null || returning == null) return '—';

  const first = Math.round(firstTime);
  const returningCount = Math.round(returning);

  if (first === 0 && returningCount === 0) return '0 : 0';
  if (first === 0) return `0 : ${returningCount}`;
  if (returningCount === 0) return `${first} : 0`;

  const divisor = gcd(first, returningCount);
  return `${first / divisor} : ${returningCount / divisor}`;
}
