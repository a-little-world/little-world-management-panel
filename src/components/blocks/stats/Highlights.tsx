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

interface HighlightsResponse {
  start_date: string;
  end_date: string;
  registrations: number;
  registered_volunteers: number;
  registered_learners: number;
  onboarded_volunteers: number;
  onboarded_learners: number;
  match_proposals_made: number;
  new_matches: number;
  in_flight_matches: number;
  successful_matches: number;
  completed_video_calls_both_active: number;
  video_call_duration_seconds_both_active: number;
  messages_sent_excluding_support: number;
}

interface HighlightBreakdownItem {
  label: string;
  value: number | undefined;
  suffix?: string;
  formatter?: (value: number | undefined) => string;
}

interface HighlightCard extends HighlightBreakdownItem {
  breakdown?: HighlightBreakdownItem[];
}

const Container = styled.div`
  display: flex;
  flex-direction: column;
  gap: ${({ theme }) => theme.spacing.medium};
  padding: ${({ theme }) => theme.spacing.small};
`;

const Header = styled.div`
  align-items: flex-start;
  display: flex;
  flex-wrap: wrap;
  gap: ${({ theme }) => theme.spacing.medium};
  justify-content: space-between;
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

const formatNumber = (value: number | undefined, suffix = '') => {
  if (value === undefined) {
    return '-';
  }

  const formatted = new Intl.NumberFormat('en-US', {
    maximumFractionDigits: suffix ? 1 : 0,
  }).format(value);

  if (suffix === '%') {
    return `${formatted}%`;
  }

  return suffix ? `${formatted} ${suffix}` : formatted;
};

const formatDuration = (seconds: number | undefined) => {
  if (seconds === undefined) {
    return '-';
  }

  const roundedMinutes = Math.round(seconds / 60);
  const hours = Math.floor(roundedMinutes / 60);
  const remainingMinutes = roundedMinutes % 60;

  if (hours === 0) {
    return `${remainingMinutes} min`;
  }

  return `${hours} hr ${remainingMinutes} min`;
};

const getPercentage = (
  numerator: number | undefined,
  denominator: number | undefined,
) => {
  if (numerator === undefined || denominator === undefined) {
    return undefined;
  }

  return denominator > 0 ? (numerator / denominator) * 100 : 0;
};

const getAverageDuration = (
  totalSeconds: number | undefined,
  totalCalls: number | undefined,
) => {
  if (totalSeconds === undefined || totalCalls === undefined) {
    return undefined;
  }

  return totalCalls > 0 ? totalSeconds / totalCalls : 0;
};

const formatCardValue = (card: HighlightCard) =>
  card.formatter
    ? card.formatter(card.value)
    : formatNumber(card.value, card.suffix);

const formatBreakdownValue = (item: HighlightBreakdownItem) =>
  item.formatter
    ? item.formatter(item.value)
    : formatNumber(item.value, item.suffix);

const buildCards = (data: HighlightsResponse | undefined): HighlightCard[] => {
  const onboardedUsers =
    data === undefined
      ? undefined
      : data.onboarded_volunteers + data.onboarded_learners;

  return [
    {
      label: 'Registrations',
      value: data?.registrations,
      breakdown: [
        { label: 'Learners', value: data?.registered_learners },
        { label: 'Volunteers', value: data?.registered_volunteers },
      ],
    },
    {
      label: 'Currently onboarded users',
      value: onboardedUsers,
      breakdown: [
        { label: 'Learners', value: data?.onboarded_learners },
        { label: 'Volunteers', value: data?.onboarded_volunteers },
      ],
    },
    {
      label: 'Onboarded vs registered',
      value: getPercentage(onboardedUsers, data?.registrations),
      suffix: '%',
      breakdown: [
        {
          label: 'Learners',
          value: getPercentage(
            data?.onboarded_learners,
            data?.registered_learners,
          ),
          suffix: '%',
        },
        {
          label: 'Volunteers',
          value: getPercentage(
            data?.onboarded_volunteers,
            data?.registered_volunteers,
          ),
          suffix: '%',
        },
      ],
    },
    { label: 'Match proposals made', value: data?.match_proposals_made },
    { label: 'New matches', value: data?.new_matches },
    { label: 'In-flight matches', value: data?.in_flight_matches },
    { label: 'Successful matches', value: data?.successful_matches },
    {
      label: 'Completed video calls, both users active',
      value: data?.completed_video_calls_both_active,
      breakdown: [
        {
          label: 'Total duration',
          value: data?.video_call_duration_seconds_both_active,
          formatter: formatDuration,
        },
        {
          label: 'Average duration',
          value: getAverageDuration(
            data?.video_call_duration_seconds_both_active,
            data?.completed_video_calls_both_active,
          ),
          formatter: formatDuration,
        },
      ],
    },
    {
      label: 'Messages sent, excluding support',
      value: data?.messages_sent_excluding_support,
    },
  ];
};

function Highlights() {
  const [dateRange, setDateRange] = React.useState<DateRange | undefined>(
    () => {
      const from = new Date();
      from.setMonth(from.getMonth() - 1);
      return { from, to: new Date() };
    },
  );
  const startDateValue = dateRange?.from
    ? formatLocalDateYmd(dateRange.from)
    : null;
  const endDateValue = dateRange?.to ? formatLocalDateYmd(dateRange.to) : null;
  const dateRangeIsValid =
    startDateValue !== null &&
    endDateValue !== null &&
    startDateValue <= endDateValue;
  const highlightsKey = dateRangeIsValid
    ? ([
        '/api/matching/users/statistics/highlights/',
        startDateValue,
        endDateValue,
      ] as const)
    : null;

  const { data, error, isLoading } = useSWR(
    highlightsKey,
    ([endpoint, start, end]) =>
      apiFetch<HighlightsResponse>(endpoint, {
        method: 'POST',
        body: {
          start_date: start,
          end_date: end,
        },
      }),
  );

  const cards = buildCards(data);

  return (
    <Container>
      <Header>
        <HeaderText>
          <Text type={TextTypes.Body3} bold tag="h1">
            Key Statistics Highlights
          </Text>
          <MutedText type={TextTypes.Body6}>
            Live statistics filtered to the current user access from{' '}
            {startDateValue ?? '-'} to {endDateValue ?? '-'}.
          </MutedText>
        </HeaderText>
        <DateRangePicker
          label="Date range"
          range={dateRange}
          setRange={setDateRange}
        />
      </Header>

      {!dateRangeIsValid && (
        <ErrorCard>
          <Text type={TextTypes.Body6}>
            Select both a start and an end date, with the end on or after the
            start.
          </Text>
        </ErrorCard>
      )}

      {error && (
        <ErrorCard>
          <Text type={TextTypes.Body6}>
            Failed to load statistics highlights.
          </Text>
        </ErrorCard>
      )}

      <StatCards>
        {cards.map(card => (
          <Stat
            key={card.label}
            label={card.label}
            stat={isLoading ? '-' : formatCardValue(card)}
            breakdown={card.breakdown?.map(item => ({
              label: item.label,
              value: isLoading ? '-' : formatBreakdownValue(item),
            }))}
          />
        ))}
      </StatCards>
    </Container>
  );
}

export default Highlights;
