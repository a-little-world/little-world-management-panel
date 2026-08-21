import { Text, TextTypes } from '@a-little-world/little-world-design-system';
import React from 'react';
import type { DateRange } from 'react-day-picker';
import styled from 'styled-components';
import useSWR from 'swr';

import { apiFetch } from '../../../api/helpers';

import {
  DateRangePicker,
  formatLocalDateYmd,
} from '../../atoms/DateRangePicker';
import Stat, { StatCards } from '../../atoms/stats/Stat';
import DataGraph, { DataGraphCohortSuccess } from '../DataGraph';

type MatchTimingStatisticsResponse = {
  start_date: string;
  end_date: string;
  total_matches: number;
  first_call_match_count: number;
  first_call_match_percentage: number;
  one_way_call_match_count: number;
  one_way_call_match_percentage: number;
  no_call_match_count: number;
  no_call_match_percentage: number;
  both_messaged_match_count: number;
  both_messaged_match_percentage: number;
  one_way_message_match_count: number;
  one_way_message_match_percentage: number;
  no_message_match_count: number;
  no_message_match_percentage: number;
  average_days_to_first_call: number | null;
  median_days_to_first_call: number | null;
  average_days_until_both_messaged: number | null;
  median_days_until_both_messaged: number | null;
};

type MatchTrendDataPoint = {
  date: string;
  count: number;
  cohort_size: number;
  mutual_call_match_count?: number;
  both_messaged_match_count?: number;
  matches_with_call_count?: number;
};

const Container = styled.div`
  display: flex;
  flex-direction: column;
  gap: ${({ theme }) => theme.spacing.medium};
  padding: ${({ theme }) => theme.spacing.small};
`;

const Header = styled.div`
  display: flex;
  flex-wrap: wrap;
  align-items: flex-start;
  justify-content: space-between;
  gap: ${({ theme }) => theme.spacing.medium};
`;

const HeaderText = styled.div`
  display: flex;
  flex-direction: column;
  gap: ${({ theme }) => theme.spacing.xxsmall};
`;

const MutedText = styled(Text)`
  color: ${({ theme }) => theme.color.text.secondary};
`;

const ErrorCard = styled.div`
  background: ${({ theme }) => theme.color.surface.secondary};
  border: 1px solid ${({ theme }) => theme.color.border.subtle};
  border-radius: ${({ theme }) => theme.radius.small};
  padding: ${({ theme }) => theme.spacing.medium};
`;

const GraphCard = styled.div`
  display: flex;
  flex-direction: column;
  gap: ${({ theme }) => theme.spacing.small};
  background: ${({ theme }) => theme.color.surface.primary};
  border: 1px solid ${({ theme }) => theme.color.border.subtle};
  border-radius: ${({ theme }) => theme.radius.small};
  padding: ${({ theme }) => theme.spacing.medium};
`;

const GraphHeader = styled.div`
  display: flex;
  flex-direction: column;
  gap: ${({ theme }) => theme.spacing.xxsmall};
`;

const formatDays = (value: number | null | undefined) => {
  if (value === undefined || value === null) {
    return '-';
  }

  return `${value} days`;
};

const formatCountWithPercentage = (
  count: number | undefined,
  percentage: number | undefined,
) => {
  if (count === undefined || percentage === undefined) {
    return '-';
  }

  return `${count} (${percentage}%)`;
};

const getDefaultStartDate = () => {
  const date = new Date();
  date.setFullYear(date.getFullYear() - 1);
  return date;
};

const MatchesStats = () => {
  const [dateRange, setDateRange] = React.useState<DateRange | undefined>({
    from: getDefaultStartDate(),
    to: new Date(),
  });

  const startDateString = dateRange?.from
    ? formatLocalDateYmd(dateRange.from)
    : '';
  const endDateString = dateRange?.to ? formatLocalDateYmd(dateRange.to) : '';

  const swrKey = React.useMemo(
    () =>
      startDateString && endDateString
        ? [
            '/api/matching/matches/statistics/timing/',
            startDateString,
            endDateString,
          ]
        : null,
    [startDateString, endDateString],
  );

  const mutualCallTrendSWRKey = React.useMemo(
    () =>
      startDateString && endDateString
        ? [
            '/api/matching/matches/statistics/mutual-call-trend/',
            startDateString,
            endDateString,
          ]
        : null,
    [startDateString, endDateString],
  );

  const bothMessagedTrendSWRKey = React.useMemo(
    () =>
      startDateString && endDateString
        ? [
            '/api/matching/matches/statistics/both-messaged-trend/',
            startDateString,
            endDateString,
          ]
        : null,
    [startDateString, endDateString],
  );

  const videoCallWeekEvolutionSWRKey = React.useMemo(
    () =>
      startDateString && endDateString
        ? [
            '/api/matching/matches/statistics/video-call-week-evolution/',
            startDateString,
            endDateString,
          ]
        : null,
    [startDateString, endDateString],
  );

  const { data, error, isLoading } = useSWR(swrKey, ([endpoint, start, end]) =>
    apiFetch<MatchTimingStatisticsResponse>(endpoint, {
      method: 'POST',
      body: {
        start_date: start,
        end_date: end,
      },
    }),
  );

  const {
    data: mutualCallTrendData,
    error: mutualCallTrendError,
    isLoading: isMutualCallTrendLoading,
  } = useSWR(mutualCallTrendSWRKey, ([endpoint, start, end]) =>
    apiFetch<MatchTrendDataPoint[]>(endpoint, {
      method: 'POST',
      body: {
        start_date: start,
        end_date: end,
        bucket_size: 7,
      },
    }),
  );

  const {
    data: bothMessagedTrendData,
    error: bothMessagedTrendError,
    isLoading: isBothMessagedTrendLoading,
  } = useSWR(bothMessagedTrendSWRKey, ([endpoint, start, end]) =>
    apiFetch<MatchTrendDataPoint[]>(endpoint, {
      method: 'POST',
      body: {
        start_date: start,
        end_date: end,
        bucket_size: 7,
      },
    }),
  );

  const {
    data: videoCallWeekEvolutionData,
    error: videoCallWeekEvolutionError,
    isLoading: isVideoCallWeekEvolutionLoading,
  } = useSWR(videoCallWeekEvolutionSWRKey, ([endpoint, start, end]) =>
    apiFetch<MatchTrendDataPoint[]>(endpoint, {
      method: 'POST',
      body: {
        start_date: start,
        end_date: end,
      },
    }),
  );

  return (
    <Container>
      <Header>
        <HeaderText>
          <Text type={TextTypes.Body3} bold tag="h1">
            Match Statistics
          </Text>
          <MutedText type={TextTypes.Body6}>
            Match timing metrics filtered by match creation date from{' '}
            {startDateString} to {endDateString}.
          </MutedText>
        </HeaderText>
        <DateRangePicker
          label="Match creation date range"
          range={dateRange}
          setRange={setDateRange}
        />
      </Header>

      {error && (
        <ErrorCard>
          <Text type={TextTypes.Body6}>Failed to load match statistics.</Text>
        </ErrorCard>
      )}

      <StatCards>
        <Stat
          label="No. of days till first call"
          stat={isLoading ? '-' : formatDays(data?.median_days_to_first_call)}
          breakdown={[
            {
              label: 'Average',
              value: isLoading
                ? '-'
                : formatDays(data?.average_days_to_first_call),
            },
            {
              label: 'Median',
              value: isLoading
                ? '-'
                : formatDays(data?.median_days_to_first_call),
            },
            {
              label: 'Matches with a mutual call',
              value: isLoading
                ? '-'
                : formatCountWithPercentage(
                    data?.first_call_match_count,
                    data?.first_call_match_percentage,
                  ),
            },
            {
              label: 'Matches with one-sided calls',
              value: isLoading
                ? '-'
                : formatCountWithPercentage(
                    data?.one_way_call_match_count,
                    data?.one_way_call_match_percentage,
                  ),
            },
            {
              label: 'Matches with no calls',
              value: isLoading
                ? '-'
                : formatCountWithPercentage(
                    data?.no_call_match_count,
                    data?.no_call_match_percentage,
                  ),
            },
            {
              label: 'Total matches',
              value: isLoading ? '-' : (data?.total_matches ?? 0),
            },
          ]}
        />
        <Stat
          label="No. of days till both users have messaged"
          stat={
            isLoading ? '-' : formatDays(data?.median_days_until_both_messaged)
          }
          breakdown={[
            {
              label: 'Average',
              value: isLoading
                ? '-'
                : formatDays(data?.average_days_until_both_messaged),
            },
            {
              label: 'Median',
              value: isLoading
                ? '-'
                : formatDays(data?.median_days_until_both_messaged),
            },
            {
              label: 'Matches with messages both ways',
              value: isLoading
                ? '-'
                : formatCountWithPercentage(
                    data?.both_messaged_match_count,
                    data?.both_messaged_match_percentage,
                  ),
            },
            {
              label: 'Matches with one-way messages',
              value: isLoading
                ? '-'
                : formatCountWithPercentage(
                    data?.one_way_message_match_count,
                    data?.one_way_message_match_percentage,
                  ),
            },
            {
              label: 'Matches with no messages',
              value: isLoading
                ? '-'
                : formatCountWithPercentage(
                    data?.no_message_match_count,
                    data?.no_message_match_percentage,
                  ),
            },
            {
              label: 'Total matches',
              value: isLoading ? '-' : (data?.total_matches ?? 0),
            },
          ]}
        />
      </StatCards>

      <GraphCard>
        <GraphHeader>
          <Text type={TextTypes.Body4} bold>
            Mutual calls within the first two weeks
          </Text>
          <MutedText type={TextTypes.Body6}>
            Weekly match creation cohorts. Bar height is the number of matches
            created that week; the filled portion had a mutual video call within
            14 days. Hover for exact counts and percentages. Recent cohorts
            without a full 14-day observation window are excluded.
          </MutedText>
        </GraphHeader>
        {mutualCallTrendError && (
          <ErrorCard>
            <Text type={TextTypes.Body6}>
              Failed to load mutual call trend.
            </Text>
          </ErrorCard>
        )}
        {isMutualCallTrendLoading && (
          <Text type={TextTypes.Body6}>Loading mutual call trend...</Text>
        )}
        {!isMutualCallTrendLoading && mutualCallTrendData && (
          <DataGraphCohortSuccess
            data={mutualCallTrendData}
            successCountKey="mutual_call_match_count"
            successLabel="Mutual call within 14 days"
            failureLabel="No mutual call within 14 days"
            minHeight="320px"
            maxHeight="420px"
          />
        )}
      </GraphCard>

      <GraphCard>
        <GraphHeader>
          <Text type={TextTypes.Body4} bold>
            Messages both ways within the first two weeks
          </Text>
          <MutedText type={TextTypes.Body6}>
            Weekly match creation cohorts. Bar height is the number of matches
            created that week; the filled portion had messages both ways within
            14 days. Hover for exact counts and percentages. Recent cohorts
            without a full 14-day observation window are excluded.
          </MutedText>
        </GraphHeader>
        {bothMessagedTrendError && (
          <ErrorCard>
            <Text type={TextTypes.Body6}>
              Failed to load both-way messaging trend.
            </Text>
          </ErrorCard>
        )}
        {isBothMessagedTrendLoading && (
          <Text type={TextTypes.Body6}>
            Loading both-way messaging trend...
          </Text>
        )}
        {!isBothMessagedTrendLoading && bothMessagedTrendData && (
          <DataGraphCohortSuccess
            data={bothMessagedTrendData}
            successCountKey="both_messaged_match_count"
            successLabel="Messages both ways within 14 days"
            failureLabel="Not both messaged within 14 days"
            minHeight="320px"
            maxHeight="420px"
          />
        )}
      </GraphCard>

      <GraphCard>
        <GraphHeader>
          <Text type={TextTypes.Body4} bold>
            Both-active video calls by match week
          </Text>
          <MutedText type={TextTypes.Body6}>
            Matches created in the selected date range, grouped by relative
            match week. Each bar shows the percentage of matches old enough to
            have completed that week that had at least one both-active video
            call during that week. Weeks are independent, so a call in Week 6
            does not require calls in Weeks 1-5.
          </MutedText>
        </GraphHeader>
        {videoCallWeekEvolutionError && (
          <ErrorCard>
            <Text type={TextTypes.Body6}>
              Failed to load video call week evolution.
            </Text>
          </ErrorCard>
        )}
        {isVideoCallWeekEvolutionLoading && (
          <Text type={TextTypes.Body6}>
            Loading video call week evolution...
          </Text>
        )}
        {!isVideoCallWeekEvolutionLoading && videoCallWeekEvolutionData && (
          <DataGraph
            data={videoCallWeekEvolutionData}
            dataLabel="% of matches with a both-active video call: "
            minHeight="320px"
            maxHeight="420px"
          />
        )}
      </GraphCard>
    </Container>
  );
};

export default MatchesStats;
