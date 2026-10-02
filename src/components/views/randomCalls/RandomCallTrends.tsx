import {
  Loading,
  LoadingSizes,
  StatusMessage,
  StatusTypes,
  Text,
} from '@a-little-world/little-world-design-system';
import { subDays } from 'date-fns';
import React from 'react';
import { useSearchParams } from 'react-router-dom';
import styled from 'styled-components';
import useSWR from 'swr';

import {
  fetchLobbyTrends,
  LobbyInstanceSnapshot,
  RANDOM_CALL_LOBBY_TRENDS_ENDPOINT,
} from '../../../api/randomCalls';
import { BLUE_40, GREEN_40, ORANGE_40 } from '../../../constants';
import {
  formatDate,
  formatDurationSeconds,
  formatRoundedDuration,
} from '../../../helpers/date';
import {
  computeTrendOverviewStats,
  formatTrendCountStat,
  formatTrendFirstTimeReturningRatio,
  formatTrendPctStat,
  formatTrendRateStat,
  ratioOrNull,
  sharePct,
} from '../../../helpers/randomCallStats';
import { Card, CardContent, CardHeader } from '../../atoms/Card';
import {
  DateRangePicker,
  formatLocalDateYmd,
  parseYmdToLocalDate,
} from '../../atoms/DateRangePicker';
import { PageContainer } from '../../atoms/PageLayout';
import LineChart, { LineChartDataPoint } from '../../atoms/stats/LineChart';
import Stat, { StatCards } from '../../atoms/stats/Stat';
import {
  Description,
  Section,
  SectionTitle,
  Title,
} from './RandomCalls.styles';

const DEFAULT_TRENDS_LOOKBACK_DAYS = 90;
const SMALL_SESSION_PARTICIPANT_THRESHOLD = 5;
const DOT_RADIUS_MIN = 3;
const DOT_RADIUS_MAX = 10;

const ChartsGrid = styled.div`
  display: flex;
  flex-direction: column;
  gap: ${({ theme }) => theme.spacing.large};
  width: 100%;
`;

const ChartCard = styled(Card)`
  max-width: none;
  width: 100%;
`;

const ChartCardContent = styled(CardContent)`
  width: 100%;
`;

const DateRangeRow = styled.div`
  margin-bottom: ${({ theme }) => theme.spacing.medium};
  max-width: 28rem;
`;

const SummaryText = styled(Text)`
  color: ${({ theme }) => theme.color.text.secondary};
`;

function defaultTrendsFromDate(): string {
  return formatLocalDateYmd(subDays(new Date(), DEFAULT_TRENDS_LOOKBACK_DAYS));
}

function defaultTrendsToDate(): string {
  return formatLocalDateYmd(new Date());
}

function parseDateParam(value: string | null, fallback: string): string {
  if (!value) return fallback;
  const parsed = parseYmdToLocalDate(value);
  return Number.isNaN(parsed.getTime()) ? fallback : value;
}

function formatSessionTrendTooltip(start: Date): string {
  return formatDate(start, 'HH:mm, EEEE dd.MM.yy', 'de');
}

const ChartHint = styled(SummaryText)`
  margin-top: ${({ theme }) => theme.spacing.xxxsmall};
`;

function scaleDotRadius(
  participantCount: number,
  minCount: number,
  maxCount: number,
): number {
  if (maxCount <= minCount) {
    return (DOT_RADIUS_MIN + DOT_RADIUS_MAX) / 2;
  }
  const ratio = (participantCount - minCount) / (maxCount - minCount);
  return DOT_RADIUS_MIN + ratio * (DOT_RADIUS_MAX - DOT_RADIUS_MIN);
}

function formatSuccessfulCallTooltipDetail(
  withCall: number,
  total: number,
  pct: number,
): string {
  const participantLabel = total === 1 ? 'participant' : 'participants';
  return `${withCall} of ${total} ${participantLabel} had a call (${pct}%)`;
}

export function lobbySnapshotsToTrendPoints(
  snapshots: LobbyInstanceSnapshot[],
): LineChartDataPoint[] {
  return [...snapshots]
    .filter(row => row.start_time)
    .sort(
      (a, b) =>
        new Date(a.start_time!).getTime() - new Date(b.start_time!).getTime(),
    )
    .map(row => {
      const start = new Date(row.start_time!);
      return {
        name: formatDate(start, 'dd.MM.yy', 'de'),
        tooltipLabel: formatSessionTrendTooltip(start),
        learners: row.learner_count,
        volunteers: row.volunteer_count,
        total: row.total_users,
        firstTime: row.first_time_users,
        returning: row.returning_users,
        successfulCallPct: row.total_users
          ? Math.round(
              (100 * row.users_with_successful_calls) / row.total_users,
            )
          : 0,
        usersWithSuccessfulCalls: row.users_with_successful_calls,
      };
    });
}

/** Trend points for the successful-call chart — adds sample-size context on tooltips and dots. */
export function lobbySnapshotsToSuccessfulCallTrendPoints(
  snapshots: LobbyInstanceSnapshot[],
): LineChartDataPoint[] {
  const basePoints = lobbySnapshotsToTrendPoints(snapshots);
  if (basePoints.length === 0) return [];

  const participantCounts = basePoints.map(point =>
    typeof point.total === 'number' ? point.total : 0,
  );
  const minParticipants = Math.min(...participantCounts);
  const maxParticipants = Math.max(...participantCounts);

  return basePoints.map((point, index) => {
    const total = participantCounts[index];
    const withCall =
      typeof point.usersWithSuccessfulCalls === 'number'
        ? point.usersWithSuccessfulCalls
        : 0;
    const pct =
      typeof point.successfulCallPct === 'number' ? point.successfulCallPct : 0;

    return {
      ...point,
      tooltipDetail: formatSuccessfulCallTooltipDetail(withCall, total, pct),
      tooltipNote:
        total <= SMALL_SESSION_PARTICIPANT_THRESHOLD
          ? 'Small session — treat this percentage with caution.'
          : undefined,
      dotRadius: scaleDotRadius(total, minParticipants, maxParticipants),
    };
  });
}

const OverviewStats = styled(StatCards)`
  margin-bottom: ${({ theme }) => theme.spacing.large};
  padding: 0;
`;

function RandomCallTrends() {
  const [searchParams, setSearchParams] = useSearchParams({
    from: defaultTrendsFromDate(),
    to: defaultTrendsToDate(),
    lobby_name: 'default',
  });

  const fromDate = parseDateParam(
    searchParams.get('from'),
    defaultTrendsFromDate(),
  );
  const toDate = parseDateParam(searchParams.get('to'), defaultTrendsToDate());

  const { data, error, isLoading } = useSWR(
    [RANDOM_CALL_LOBBY_TRENDS_ENDPOINT, searchParams.toString()] as const,
    ([, queryString]) => fetchLobbyTrends(queryString),
    { revalidateOnFocus: true, revalidateOnMount: true },
  );

  const updateDateRange = (from?: string, to?: string) => {
    const nextParams = new URLSearchParams(searchParams);
    nextParams.set('tab', 'trends');
    if (from) {
      nextParams.set('from', from);
    } else {
      nextParams.delete('from');
    }
    if (to) {
      nextParams.set('to', to);
    } else {
      nextParams.delete('to');
    }
    setSearchParams(nextParams);
  };

  const chartData = data ? lobbySnapshotsToTrendPoints(data.results) : [];
  const successfulCallChartData = data
    ? lobbySnapshotsToSuccessfulCallTrendPoints(data.results)
    : [];
  const overviewStats = data ? computeTrendOverviewStats(data.results) : null;

  return (
    <PageContainer>
      <Title>Trends</Title>
      <Description>
        Session trends over time. Each point is one random call lobby instance.
      </Description>

      <DateRangeRow>
        <DateRangePicker
          label="Date range"
          range={{
            from: parseYmdToLocalDate(fromDate),
            to: parseYmdToLocalDate(toDate),
          }}
          setRange={range => {
            if (!range?.from) return;
            updateDateRange(
              formatLocalDateYmd(range.from),
              formatLocalDateYmd(range.to ?? range.from),
            );
          }}
        />
      </DateRangeRow>

      {error && (
        <StatusMessage type={StatusTypes.Error} visible>
          Failed to load session trends.
        </StatusMessage>
      )}

      {isLoading && !data && <Loading size={LoadingSizes.Medium} />}

      {data && (
        <>
          <SummaryText tag="p">
            {data.count === 0
              ? 'No sessions found in this date range.'
              : `${data.count} session${data.count === 1 ? '' : 's'} from ${fromDate} to ${toDate}.`}
          </SummaryText>

          {overviewStats && overviewStats.sessionCount > 0 && (
            <>
              <Section>
                <SectionTitle>Totals</SectionTitle>
                <OverviewStats>
                  <Stat
                    label="Lobby sessions"
                    stat={formatTrendCountStat(data.totals.lobby_count)}
                  />
                  <Stat
                    label="Total participants"
                    stat={formatTrendCountStat(data.totals.total_participants)}
                    breakdown={[
                      {
                        label: 'Avg per session',
                        value: formatTrendRateStat(
                          ratioOrNull(
                            data.totals.total_participants,
                            data.totals.lobby_count,
                          ),
                        ),
                      },
                    ]}
                  />
                  <Stat
                    label="Unique participants"
                    stat={formatTrendCountStat(data.totals.unique_participants)}
                    breakdown={[
                      {
                        label: 'Avg sessions each',
                        value: formatTrendRateStat(
                          ratioOrNull(
                            data.totals.total_participants,
                            data.totals.unique_participants,
                          ),
                        ),
                      },
                    ]}
                  />
                  <Stat
                    label="Successful calls"
                    stat={formatTrendCountStat(data.totals.successful_calls)}
                    breakdown={[
                      {
                        label: 'Of completed',
                        value: `${data.totals.successful_calls} of ${data.totals.completed_calls}`,
                      },
                      {
                        label: 'Avg per session',
                        value: formatTrendRateStat(
                          ratioOrNull(
                            data.totals.successful_calls,
                            data.totals.lobby_count,
                          ),
                        ),
                      },
                    ]}
                  />
                  <Stat
                    label="Total call time"
                    stat={formatDurationSeconds(
                      data.totals.total_call_duration_seconds,
                      { includeSeconds: false },
                    )}
                    breakdown={[
                      {
                        label: 'Avg per session',
                        value: formatDurationSeconds(
                          (ratioOrNull(
                            data.totals.total_call_duration_seconds,
                            data.totals.lobby_count,
                          ) ?? 0) as number,
                          { includeSeconds: false },
                        ),
                      },
                    ]}
                  />
                </OverviewStats>
                {data.totals.successful_calls < data.totals.completed_calls && (
                  <ChartHint tag="p">
                    A call counts as successful once the pair talked for at
                    least a minute.{' '}
                    {(
                      data.totals.completed_calls - data.totals.successful_calls
                    ).toLocaleString()}{' '}
                    of {data.totals.completed_calls.toLocaleString()} completed
                    calls fall short of that or have no recorded session, and
                    are excluded from call time and the median rather than
                    counted as zero.
                  </ChartHint>
                )}
              </Section>

              <Section>
                <SectionTitle>Medians per session</SectionTitle>
                <OverviewStats>
                  <Stat
                    label="Median participants"
                    stat={formatTrendCountStat(
                      overviewStats.medianParticipants,
                    )}
                    breakdown={[
                      {
                        label: 'Learners',
                        value: formatTrendCountStat(
                          overviewStats.medianLearners,
                        ),
                      },
                      {
                        label: 'Volunteers',
                        value: formatTrendCountStat(
                          overviewStats.medianVolunteers,
                        ),
                      },
                    ]}
                  />
                  <Stat
                    label="First-time : returning (medians)"
                    stat={formatTrendFirstTimeReturningRatio(
                      overviewStats.medianFirstTimeUsers,
                      overviewStats.medianReturningUsers,
                    )}
                    breakdown={[
                      {
                        label: 'First-time',
                        value: formatTrendCountStat(
                          overviewStats.medianFirstTimeUsers,
                        ),
                      },
                      {
                        label: 'Returning',
                        value: formatTrendCountStat(
                          overviewStats.medianReturningUsers,
                        ),
                      },
                    ]}
                  />
                  <Stat
                    label="Median calls per lobby"
                    stat={formatTrendCountStat(
                      overviewStats.medianCallsPerLobby,
                    )}
                    breakdown={[
                      {
                        label: 'Avg calls per participant',
                        value: formatTrendRateStat(
                          overviewStats.meanCallsPerParticipant,
                        ),
                      },
                      {
                        label: 'Median calls per participant',
                        value: formatTrendRateStat(
                          overviewStats.medianCallsPerParticipant,
                        ),
                      },
                    ]}
                  />
                  <Stat
                    label="Median users with successful call"
                    stat={formatTrendPctStat(
                      overviewStats.medianSuccessfulCallPct,
                    )}
                  />
                  <Stat
                    label="Median call duration"
                    stat={
                      data.totals.median_call_duration_seconds == null
                        ? '—'
                        : formatRoundedDuration(
                            data.totals.median_call_duration_seconds,
                          )
                    }
                  />
                  <Stat
                    label="Median proposals rejected"
                    stat={formatTrendPctStat(overviewStats.medianRejectedPct)}
                    breakdown={[
                      {
                        label: 'Learner–learner',
                        value: formatTrendPctStat(
                          sharePct(
                            data.totals.rejected_learner_learner,
                            data.totals.rejected_proposals,
                          ),
                        ),
                      },
                      {
                        label: 'Learner–volunteer',
                        value: formatTrendPctStat(
                          sharePct(
                            data.totals.rejected_learner_volunteer,
                            data.totals.rejected_proposals,
                          ),
                        ),
                      },
                      ...(data.totals.rejected_other > 0
                        ? [
                            {
                              label: 'Other pairing',
                              value: formatTrendPctStat(
                                sharePct(
                                  data.totals.rejected_other,
                                  data.totals.rejected_proposals,
                                ),
                              ),
                            },
                          ]
                        : []),
                    ]}
                  />
                </OverviewStats>
                <ChartHint tag="p">
                  Each figure is the median across sessions in range. The
                  learner–learner and learner–volunteer split is the share of
                  all rejected proposals in the range, not a median.
                </ChartHint>
              </Section>
            </>
          )}

          <ChartsGrid>
            <ChartCard center={false}>
              <CardHeader>
                <SummaryText tag="span">
                  Learners vs volunteers per session
                </SummaryText>
              </CardHeader>
              <ChartCardContent>
                <LineChart
                  data={chartData}
                  series={[
                    { id: 'learners', color: BLUE_40, label: 'Learners' },
                    { id: 'volunteers', color: ORANGE_40, label: 'Volunteers' },
                  ]}
                />
              </ChartCardContent>
            </ChartCard>

            <ChartCard center={false}>
              <CardHeader>
                <SummaryText tag="span">Participants per session</SummaryText>
              </CardHeader>
              <ChartCardContent>
                <LineChart
                  data={chartData}
                  series={[
                    { id: 'total', color: BLUE_40, label: 'Total' },
                    { id: 'firstTime', color: GREEN_40, label: 'First-time' },
                    {
                      id: 'returning',
                      color: ORANGE_40,
                      label: 'Returning',
                    },
                  ]}
                />
              </ChartCardContent>
            </ChartCard>

            <ChartCard center={false}>
              <CardHeader>
                <SummaryText tag="span">
                  Participants with a successful call
                </SummaryText>
                <ChartHint tag="span">
                  Dot size reflects how many participants joined the session.
                </ChartHint>
              </CardHeader>
              <ChartCardContent>
                <LineChart
                  data={successfulCallChartData}
                  series={[
                    {
                      id: 'successfulCallPct',
                      color: GREEN_40,
                      label: 'With successful call',
                    },
                  ]}
                  yAxisDomain={[0, 100]}
                  yAxisTickFormatter={value => `${value}%`}
                  variableDotSize
                />
              </ChartCardContent>
            </ChartCard>
          </ChartsGrid>
        </>
      )}
    </PageContainer>
  );
}

export default RandomCallTrends;
