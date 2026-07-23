import {
  Select,
  Text,
  TextTypes,
} from '@a-little-world/little-world-design-system';
import React from 'react';
import type { DateRange } from 'react-day-picker';
import styled, { useTheme } from 'styled-components';
import useSWR from 'swr';

import { apiFetch } from '../../../api/helpers';
import {
  DateRangePicker,
  formatLocalDateYmd,
} from '../../atoms/DateRangePicker';
import {
  BreakdownLabel,
  BreakdownList,
  BreakdownRow,
  BreakdownValue,
  StatCard,
  StatCards,
  StatLabel,
  StatValue,
} from '../../atoms/stats/StatCard';
import { DataGraphStackedPercentages } from '../DataGraph';

type MatchProposalType = 'all' | 'standard' | 'random_call';

type WaitingTimeSummary = {
  count: number;
  average_days: number | null;
  median_days: number | null;
  still_waiting_count: number;
  completed_count: number;
};

type OutcomeWaitingTimeSummary = {
  count: number;
  average_days: number | null;
  median_days: number | null;
};

type MatchProposalStatisticsResponse = {
  start_date: string;
  end_date: string;
  match_type: MatchProposalType;
  total_proposals: number;
  accepted_count: number;
  accepted_percentage: number;
  expired_count: number;
  expired_percentage: number;
  rejected_count: number;
  rejected_percentage: number;
  pending_count: number;
  pending_percentage: number;
  waiting_time: {
    first_proposal_learners: WaitingTimeSummary;
    first_match_total: WaitingTimeSummary;
    first_match_learners: WaitingTimeSummary;
    first_match_volunteers: WaitingTimeSummary;
  };
  first_proposal_outcome_waiting_time: {
    accepted: OutcomeWaitingTimeSummary;
    expired: OutcomeWaitingTimeSummary;
    rejected: OutcomeWaitingTimeSummary;
    pending_count: number;
    excluded_count: number;
    total_first_proposals: number;
  };
};

type MatchProposalOutcomeTrendPoint = {
  date: string;
  cohort_size: number;
  total_proposals: number;
  accepted_count: number;
  accepted_percentage: number;
  expired_count: number;
  expired_percentage: number;
  rejected_count: number;
  rejected_percentage: number;
  pending_count: number;
  pending_percentage: number;
};

const MATCH_PROPOSAL_TYPE_OPTIONS = [
  { value: 'all', label: 'All' },
  { value: 'standard', label: 'Standard' },
  { value: 'random_call', label: 'Random call' },
];

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

const Controls = styled.div`
  display: flex;
  flex-wrap: wrap;
  align-items: flex-end;
  gap: ${({ theme }) => theme.spacing.small};
`;

const TypeDropdown = styled(Select)`
  min-width: 12rem;

  div[data-radix-popper-content-wrapper] {
    z-index: 20 !important;
  }
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

const WaitingTimeSection = styled.div`
  display: flex;
  flex-direction: column;
  gap: ${({ theme }) => theme.spacing.small};
`;

const formatCountWithPercentage = (
  count: number | undefined,
  percentage: number | undefined,
) => {
  if (count === undefined || percentage === undefined) {
    return '-';
  }

  return `${count} (${percentage}%)`;
};

const formatDays = (value: number | null | undefined) =>
  value === null || value === undefined ? '-' : `${value} days`;

const OutcomeWaitingTimeBreakdown = ({
  summary,
  isLoading,
}: {
  summary?: OutcomeWaitingTimeSummary;
  isLoading: boolean;
}) => (
  <BreakdownList>
    <BreakdownRow>
      <BreakdownLabel>Average</BreakdownLabel>
      <BreakdownValue>
        {isLoading ? '-' : formatDays(summary?.average_days)}
      </BreakdownValue>
    </BreakdownRow>
    <BreakdownRow>
      <BreakdownLabel>Median</BreakdownLabel>
      <BreakdownValue>
        {isLoading ? '-' : formatDays(summary?.median_days)}
      </BreakdownValue>
    </BreakdownRow>
    <BreakdownRow>
      <BreakdownLabel>First proposals</BreakdownLabel>
      <BreakdownValue>{isLoading ? '-' : (summary?.count ?? 0)}</BreakdownValue>
    </BreakdownRow>
  </BreakdownList>
);

const WaitingTimeBreakdown = ({
  summary,
  isLoading,
}: {
  summary?: WaitingTimeSummary;
  isLoading: boolean;
}) => (
  <BreakdownList>
    <BreakdownRow>
      <BreakdownLabel>Average</BreakdownLabel>
      <BreakdownValue>
        {isLoading ? '-' : formatDays(summary?.average_days)}
      </BreakdownValue>
    </BreakdownRow>
    <BreakdownRow>
      <BreakdownLabel>Median</BreakdownLabel>
      <BreakdownValue>
        {isLoading ? '-' : formatDays(summary?.median_days)}
      </BreakdownValue>
    </BreakdownRow>
    <BreakdownRow>
      <BreakdownLabel>Still waiting</BreakdownLabel>
      <BreakdownValue>
        {isLoading ? '-' : (summary?.still_waiting_count ?? 0)}
      </BreakdownValue>
    </BreakdownRow>
    <BreakdownRow>
      <BreakdownLabel>Received</BreakdownLabel>
      <BreakdownValue>
        {isLoading ? '-' : (summary?.completed_count ?? 0)}
      </BreakdownValue>
    </BreakdownRow>
    <BreakdownRow>
      <BreakdownLabel>Onboarded in range</BreakdownLabel>
      <BreakdownValue>{isLoading ? '-' : (summary?.count ?? 0)}</BreakdownValue>
    </BreakdownRow>
  </BreakdownList>
);

const getDefaultStartDate = () => {
  const date = new Date();
  date.setFullYear(date.getFullYear() - 1);
  return date;
};

const ProposalStats = () => {
  const theme = useTheme();
  const [dateRange, setDateRange] = React.useState<DateRange | undefined>({
    from: getDefaultStartDate(),
    to: new Date(),
  });
  const [matchType, setMatchType] = React.useState<MatchProposalType>('all');

  const proposalOutcomeSeries = React.useMemo(
    () => [
      {
        dataKey: 'accepted_percentage',
        countKey: 'accepted_count',
        label: 'Accepted',
        color: theme.color.status.success,
      },
      {
        dataKey: 'expired_percentage',
        countKey: 'expired_count',
        label: 'Expired',
        color: theme.color.status.warning,
      },
      {
        dataKey: 'rejected_percentage',
        countKey: 'rejected_count',
        label: 'Rejected',
        color: theme.color.status.error,
      },
      {
        dataKey: 'pending_percentage',
        countKey: 'pending_count',
        label: 'Pending',
        color: theme.color.status.info,
      },
    ],
    [theme],
  );

  const startDateString = dateRange?.from
    ? formatLocalDateYmd(dateRange.from)
    : '';
  const endDateString = dateRange?.to ? formatLocalDateYmd(dateRange.to) : '';

  const swrKey = React.useMemo(
    () =>
      startDateString && endDateString
        ? [
            '/api/matching/match-proposals/statistics/',
            startDateString,
            endDateString,
            matchType,
          ]
        : null,
    [startDateString, endDateString, matchType],
  );

  const outcomeTrendSWRKey = React.useMemo(
    () =>
      startDateString && endDateString
        ? [
            '/api/matching/match-proposals/statistics/outcome-trend/',
            startDateString,
            endDateString,
            matchType,
          ]
        : null,
    [startDateString, endDateString, matchType],
  );

  const { data, error, isLoading } = useSWR(
    swrKey,
    ([endpoint, start, end, selectedMatchType]) =>
      apiFetch<MatchProposalStatisticsResponse>(endpoint, {
        method: 'POST',
        body: {
          start_date: start,
          end_date: end,
          match_type: selectedMatchType,
        },
      }),
  );

  const {
    data: outcomeTrendData,
    error: outcomeTrendError,
    isLoading: isOutcomeTrendLoading,
  } = useSWR(outcomeTrendSWRKey, ([endpoint, start, end, selectedMatchType]) =>
    apiFetch<MatchProposalOutcomeTrendPoint[]>(endpoint, {
      method: 'POST',
      body: {
        start_date: start,
        end_date: end,
        match_type: selectedMatchType,
      },
    }),
  );

  return (
    <Container>
      <Header>
        <HeaderText>
          <Text type={TextTypes.Body3} bold tag="h1">
            Match Proposal Statistics
          </Text>
          <MutedText type={TextTypes.Body6}>
            Proposal outcomes filtered by proposal creation date from{' '}
            {startDateString} to {endDateString}.
          </MutedText>
        </HeaderText>
        <Controls>
          <TypeDropdown
            id="match-proposal-type"
            label="Proposal type"
            value={matchType}
            options={MATCH_PROPOSAL_TYPE_OPTIONS}
            onValueChange={value => setMatchType(value as MatchProposalType)}
            placeholder="Select proposal type"
            cannotError
          />
          <DateRangePicker
            label="Proposal creation date range"
            range={dateRange}
            setRange={setDateRange}
          />
        </Controls>
      </Header>

      {error && (
        <ErrorCard>
          <Text type={TextTypes.Body6}>
            Failed to load match proposal statistics.
          </Text>
        </ErrorCard>
      )}

      <StatCards>
        <StatCard>
          <StatValue>
            {isLoading ? '-' : (data?.total_proposals ?? 0)}
          </StatValue>
          <StatLabel>Total proposals</StatLabel>
          <BreakdownList>
            <BreakdownRow>
              <BreakdownLabel>Still pending</BreakdownLabel>
              <BreakdownValue>
                {isLoading
                  ? '-'
                  : formatCountWithPercentage(
                      data?.pending_count,
                      data?.pending_percentage,
                    )}
              </BreakdownValue>
            </BreakdownRow>
          </BreakdownList>
        </StatCard>
        <StatCard>
          <StatValue>
            {isLoading
              ? '-'
              : formatCountWithPercentage(
                  data?.accepted_count,
                  data?.accepted_percentage,
                )}
          </StatValue>
          <StatLabel>Accepted</StatLabel>
        </StatCard>
        <StatCard>
          <StatValue>
            {isLoading
              ? '-'
              : formatCountWithPercentage(
                  data?.expired_count,
                  data?.expired_percentage,
                )}
          </StatValue>
          <StatLabel>Expired</StatLabel>
        </StatCard>
        <StatCard>
          <StatValue>
            {isLoading
              ? '-'
              : formatCountWithPercentage(
                  data?.rejected_count,
                  data?.rejected_percentage,
                )}
          </StatValue>
          <StatLabel>Rejected</StatLabel>
        </StatCard>
      </StatCards>

      <WaitingTimeSection>
        <HeaderText>
          <Text type={TextTypes.Body4} bold>
            Waiting time
          </Text>
          <MutedText type={TextTypes.Body6}>
            Users onboarded in the selected date range. Waiting time counts
            completed waits plus current waits for those still without a first
            proposal or first match.
          </MutedText>
        </HeaderText>
        <StatCards>
          <StatCard>
            <StatValue>
              {isLoading
                ? '-'
                : formatDays(
                    data?.waiting_time?.first_proposal_learners?.median_days,
                  )}
            </StatValue>
            <StatLabel>First proposal (learners)</StatLabel>
            <WaitingTimeBreakdown
              isLoading={isLoading}
              summary={data?.waiting_time?.first_proposal_learners}
            />
          </StatCard>
          <StatCard>
            <StatValue>
              {isLoading
                ? '-'
                : formatDays(
                    data?.waiting_time?.first_match_learners?.median_days,
                  )}
            </StatValue>
            <StatLabel>First match (learners)</StatLabel>
            <WaitingTimeBreakdown
              isLoading={isLoading}
              summary={data?.waiting_time?.first_match_learners}
            />
          </StatCard>
          <StatCard>
            <StatValue>
              {isLoading
                ? '-'
                : formatDays(
                    data?.waiting_time?.first_match_volunteers?.median_days,
                  )}
            </StatValue>
            <StatLabel>First match (volunteers)</StatLabel>
            <WaitingTimeBreakdown
              isLoading={isLoading}
              summary={data?.waiting_time?.first_match_volunteers}
            />
          </StatCard>
        </StatCards>
      </WaitingTimeSection>

      <WaitingTimeSection>
        <HeaderText>
          <Text type={TextTypes.Body4} bold>
            Waiting time vs proposal outcome
          </Text>
          <MutedText type={TextTypes.Body6}>
            Each learner&apos;s first proposal created in the selected date
            range. Waiting time is from learner onboarded to first proposal sent.
            Repeat proposals are excluded.
          </MutedText>
        </HeaderText>
        <StatCards>
          <StatCard>
            <StatValue>
              {isLoading
                ? '-'
                : formatDays(
                    data?.first_proposal_outcome_waiting_time?.accepted
                      ?.median_days,
                  )}
            </StatValue>
            <StatLabel>Accepted first proposals</StatLabel>
            <OutcomeWaitingTimeBreakdown
              isLoading={isLoading}
              summary={data?.first_proposal_outcome_waiting_time?.accepted}
            />
          </StatCard>
          <StatCard>
            <StatValue>
              {isLoading
                ? '-'
                : formatDays(
                    data?.first_proposal_outcome_waiting_time?.expired
                      ?.median_days,
                  )}
            </StatValue>
            <StatLabel>Expired first proposals</StatLabel>
            <OutcomeWaitingTimeBreakdown
              isLoading={isLoading}
              summary={data?.first_proposal_outcome_waiting_time?.expired}
            />
          </StatCard>
          <StatCard>
            <StatValue>
              {isLoading
                ? '-'
                : formatDays(
                    data?.first_proposal_outcome_waiting_time?.rejected
                      ?.median_days,
                  )}
            </StatValue>
            <StatLabel>Rejected first proposals</StatLabel>
            <OutcomeWaitingTimeBreakdown
              isLoading={isLoading}
              summary={data?.first_proposal_outcome_waiting_time?.rejected}
            />
          </StatCard>
        </StatCards>
      </WaitingTimeSection>

      <GraphCard>
        <GraphHeader>
          <Text type={TextTypes.Body4} bold>
            Proposal outcomes by month
          </Text>
          <MutedText type={TextTypes.Body6}>
            Monthly proposal creation cohorts. Each bar shows the percentage of
            proposals created that month that were accepted, expired, rejected,
            or still pending.
          </MutedText>
        </GraphHeader>
        {outcomeTrendError && (
          <ErrorCard>
            <Text type={TextTypes.Body6}>
              Failed to load proposal outcome trend.
            </Text>
          </ErrorCard>
        )}
        {isOutcomeTrendLoading && (
          <Text type={TextTypes.Body6}>Loading proposal outcome trend...</Text>
        )}
        {!isOutcomeTrendLoading && outcomeTrendData && (
          <DataGraphStackedPercentages
            data={outcomeTrendData}
            series={proposalOutcomeSeries}
            minHeight="320px"
            maxHeight="420px"
          />
        )}
      </GraphCard>
    </Container>
  );
};

export default ProposalStats;
