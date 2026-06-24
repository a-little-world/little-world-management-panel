import {
  Dropdown,
  Text,
  TextTypes,
} from '@a-little-world/little-world-design-system';
import React from 'react';
import styled from 'styled-components';
import useSWR from 'swr';

import { apiFetch } from '../../../api/helpers';
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

type HighlightsPeriod = 'daily' | 'weekly' | 'monthly' | 'yearly';

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
  ongoing_matches: number;
  completed_matches: number;
  video_calls_both_active: number;
  video_call_duration_minutes_both_active: number;
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

const PERIOD_OPTIONS: { label: string; value: HighlightsPeriod }[] = [
  { label: 'Daily', value: 'daily' },
  { label: 'Weekly', value: 'weekly' },
  { label: 'Monthly', value: 'monthly' },
  { label: 'Yearly', value: 'yearly' },
];

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

const FilterGroup = styled.div`
  min-width: 220px;
`;

const StyledDropdown = styled(Dropdown)`
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

const formatDate = (date: Date) => {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');

  return `${year}-${month}-${day}`;
};

const getDateRange = (period: HighlightsPeriod) => {
  const endDate = new Date();
  const startDate = new Date(endDate);

  if (period === 'daily') {
    startDate.setDate(startDate.getDate() - 1);
  } else if (period === 'weekly') {
    startDate.setDate(startDate.getDate() - 7);
  } else if (period === 'monthly') {
    startDate.setMonth(startDate.getMonth() - 1);
  } else {
    startDate.setFullYear(startDate.getFullYear() - 1);
  }

  return {
    startDate: formatDate(startDate),
    endDate: formatDate(endDate),
  };
};

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

const formatDuration = (minutes: number | undefined) => {
  if (minutes === undefined) {
    return '-';
  }

  const roundedMinutes = Math.round(minutes);
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
  totalMinutes: number | undefined,
  totalCalls: number | undefined,
) => {
  if (totalMinutes === undefined || totalCalls === undefined) {
    return undefined;
  }

  return totalCalls > 0 ? totalMinutes / totalCalls : 0;
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
      label: 'Onboarded users',
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
    { label: 'Ongoing matches', value: data?.ongoing_matches },
    { label: 'Completed matches', value: data?.completed_matches },
    {
      label: 'Video calls, both users active',
      value: data?.video_calls_both_active,
      breakdown: [
        {
          label: 'Total duration',
          value: data?.video_call_duration_minutes_both_active,
          formatter: formatDuration,
        },
        {
          label: 'Average duration',
          value: getAverageDuration(
            data?.video_call_duration_minutes_both_active,
            data?.video_calls_both_active,
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
  const [period, setPeriod] = React.useState<HighlightsPeriod>('monthly');
  const { startDate, endDate } = React.useMemo(
    () => getDateRange(period),
    [period],
  );
  const highlightsKey = React.useMemo(
    () =>
      [
        '/api/matching/users/statistics/highlights/',
        startDate,
        endDate,
      ] as const,
    [startDate, endDate],
  );

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
            Live statistics filtered to the current user access from {startDate}{' '}
            to {endDate}.
          </MutedText>
        </HeaderText>
        <FilterGroup>
          <StyledDropdown
            id="statistics-highlights-period"
            label="Time period"
            value={period}
            options={PERIOD_OPTIONS}
            onValueChange={value => setPeriod(value as HighlightsPeriod)}
            placeholder="Select a time period"
            cannotError
          />
        </FilterGroup>
      </Header>

      {error && (
        <ErrorCard>
          <Text type={TextTypes.Body6}>
            Failed to load statistics highlights.
          </Text>
        </ErrorCard>
      )}

      <StatCards>
        {cards.map(card => (
          <StatCard key={card.label}>
            <StatValue>{isLoading ? '-' : formatCardValue(card)}</StatValue>
            <StatLabel>{card.label}</StatLabel>
            {card.breakdown && (
              <BreakdownList>
                {card.breakdown.map(item => (
                  <BreakdownRow key={item.label}>
                    <BreakdownLabel>{item.label}</BreakdownLabel>
                    <BreakdownValue>
                      {isLoading ? '-' : formatBreakdownValue(item)}
                    </BreakdownValue>
                  </BreakdownRow>
                ))}
              </BreakdownList>
            )}
          </StatCard>
        ))}
      </StatCards>
    </Container>
  );
}

export default Highlights;
