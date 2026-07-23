import React from 'react';
import { Bar, BarChart, CartesianGrid, XAxis, YAxis } from 'recharts';
import styled, { useTheme } from 'styled-components';

import {
  ChartContainer,
  ChartLegend,
  ChartLegendContent,
  ChartTooltip,
  ChartTooltipContent,
} from '../atoms/Chart';

const StyledChartContainer = styled(ChartContainer)<{
  $minHeight?: string;
  $maxHeight?: string;
}>`
  max-height: ${({ $maxHeight }) => $maxHeight || '640px'};
  min-height: ${({ $minHeight }) => $minHeight || '400px'};
`;

const CohortTooltipCard = styled.div`
  background: ${({ theme }) => theme.color.surface.primary};
  border: 1px solid ${({ theme }) => theme.color.border.subtle};
  border-radius: ${({ theme }) => theme.radius.small};
  padding: ${({ theme }) => theme.spacing.xsmall};
  font-size: 12px;
  color: ${({ theme }) => theme.color.text.primary};
`;

const CohortTooltipTitle = styled.div`
  font-weight: 600;
  margin-bottom: ${({ theme }) => theme.spacing.xxsmall};
`;

interface DataGraphProps {
  data: any;
  dataLabel: string;
  minHeight?: string;
  maxHeight?: string;
}

export function DataGraph({
  data,
  dataLabel,
  maxHeight,
  minHeight,
}: DataGraphProps) {
  const chartConfig = {
    count: {
      label: dataLabel,
      color: '#2563eb',
    },
    date: {
      label: 'Date',
      color: '#000',
    },
  };

  return (
    <StyledChartContainer
      config={chartConfig}
      $maxHeight={maxHeight}
      $minHeight={minHeight}
    >
      <BarChart accessibilityLayer data={data}>
        <CartesianGrid vertical={false} />
        <XAxis
          dataKey="date"
          tickLine={true}
          tickMargin={2}
          axisLine={true}
          angle={-20}
          textAnchor="end"
          tickFormatter={value => value.slice(0, 10)}
        />
        <ChartTooltip cursor={false} content={<ChartTooltipContent />} />
        <Bar dataKey="count" fill="var(--color-desktop)" radius={0} />
      </BarChart>
    </StyledChartContainer>
  );
}

export function DataGraphTwoCounts({
  data,
  dataLabel,
  maxHeight,
  minHeight,
}: DataGraphProps) {
  const chartConfig = {
    count_vol: {
      label: 'Volunteers',
      color: '#ff0000',
    },
    count_ler: {
      label: 'Learners',
      color: '#2563eb',
    },
    date: {
      label: 'Date',
      color: '#000',
    },
  };

  return (
    <StyledChartContainer
      config={chartConfig}
      $maxHeight={maxHeight}
      $minHeight={minHeight}
    >
      <BarChart accessibilityLayer data={data}>
        <CartesianGrid vertical={false} />
        <XAxis
          dataKey="date"
          tickLine={true}
          tickMargin={2}
          axisLine={true}
          angle={-20}
          textAnchor="end"
          tickFormatter={value => value.slice(0, 10)}
        />
        <ChartTooltip cursor={false} content={<ChartTooltipContent />} />
        <Bar
          dataKey="count_vol"
          fill="#ff0000"
          radius={[0, 0, 8, 8]}
          stackId={'a'}
        />
        <Bar
          dataKey="count_ler"
          fill="var(--color-desktop)"
          radius={[8, 8, 0, 0]}
          stackId={'a'}
        />
      </BarChart>
    </StyledChartContainer>
  );
}

type StackedPercentageSeries = {
  dataKey: string;
  label: string;
  color: string;
  countKey: string;
};

interface DataGraphStackedPercentagesProps {
  data: Record<string, unknown>[];
  series: StackedPercentageSeries[];
  minHeight?: string;
  maxHeight?: string;
}

const formatMonthLabel = (value: string) => {
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) {
    return value.slice(0, 7);
  }

  return date.toLocaleDateString(undefined, {
    month: 'short',
    year: 'numeric',
  });
};

export function DataGraphStackedPercentages({
  data,
  series,
  maxHeight,
  minHeight,
}: DataGraphStackedPercentagesProps) {
  const theme = useTheme();
  const chartConfig = {
    date: {
      label: 'Month',
      color: theme.color.text.primary,
    },
    ...Object.fromEntries(
      series.map(item => [
        item.dataKey,
        {
          label: item.label,
          color: item.color,
        },
      ]),
    ),
  };

  const countKeyByDataKey = Object.fromEntries(
    series.map(item => [item.dataKey, item.countKey]),
  );

  return (
    <StyledChartContainer
      config={chartConfig}
      $maxHeight={maxHeight}
      $minHeight={minHeight}
    >
      <BarChart accessibilityLayer data={data}>
        <CartesianGrid vertical={false} />
        <XAxis
          dataKey="date"
          tickLine={true}
          tickMargin={8}
          axisLine={true}
          angle={-25}
          textAnchor="end"
          tickFormatter={formatMonthLabel}
        />
        <YAxis
          type="number"
          domain={[0, 100]}
          ticks={[0, 25, 50, 75, 100]}
          allowDecimals={false}
          tickFormatter={value => `${value}%`}
        />
        <ChartTooltip
          cursor={false}
          content={
            <ChartTooltipContent
              labelFormatter={formatMonthLabel}
              formatter={(value, _name, item) => {
                const countKey = countKeyByDataKey[String(item.dataKey)];
                const count =
                  countKey && item.payload
                    ? item.payload[countKey as keyof typeof item.payload]
                    : null;

                if (typeof count === 'number') {
                  return `${value}% (${count})`;
                }

                return `${value}%`;
              }}
            />
          }
        />
        <ChartLegend content={<ChartLegendContent />} />
        {series.map((item, index) => (
          <Bar
            key={item.dataKey}
            dataKey={item.dataKey}
            fill={item.color}
            stackId="outcomes"
            radius={
              index === series.length - 1 ? [8, 8, 0, 0] : [0, 0, 0, 0]
            }
          />
        ))}
      </BarChart>
    </StyledChartContainer>
  );
}

type CohortSuccessDataPoint = {
  date: string;
  count: number;
  cohort_size: number;
  mutual_call_match_count?: number;
  both_messaged_match_count?: number;
};

type DataGraphCohortSuccessProps = {
  data: CohortSuccessDataPoint[];
  successCountKey: 'mutual_call_match_count' | 'both_messaged_match_count';
  successLabel: string;
  failureLabel: string;
  minHeight?: string;
  maxHeight?: string;
};

const formatWeekLabel = (value: string) => {
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) {
    return value.slice(0, 10);
  }

  return date.toLocaleDateString(undefined, {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  });
};

export function DataGraphCohortSuccess({
  data,
  successCountKey,
  successLabel,
  failureLabel,
  maxHeight,
  minHeight,
}: DataGraphCohortSuccessProps) {
  const theme = useTheme();

  const chartData = React.useMemo(
    () =>
      data.map(point => {
        const successCount = point[successCountKey] ?? 0;
        const cohortSize = point.cohort_size ?? 0;
        const failureCount = Math.max(cohortSize - successCount, 0);
        const percentage =
          cohortSize > 0
            ? Math.round((successCount / cohortSize) * 1000) / 10
            : 0;

        return {
          date: point.date,
          success_count: successCount,
          failure_count: failureCount,
          cohort_size: cohortSize,
          percentage,
        };
      }),
    [data, successCountKey],
  );

  const chartConfig = {
    date: {
      label: 'Week',
      color: theme.color.text.primary,
    },
    success_count: {
      label: successLabel,
      color: theme.color.status.success,
    },
    failure_count: {
      label: failureLabel,
      color: theme.color.border.subtle,
    },
  };

  return (
    <StyledChartContainer
      config={chartConfig}
      $maxHeight={maxHeight}
      $minHeight={minHeight}
    >
      <BarChart accessibilityLayer data={chartData}>
        <CartesianGrid vertical={false} />
        <XAxis
          dataKey="date"
          tickLine={true}
          tickMargin={8}
          axisLine={true}
          angle={-25}
          textAnchor="end"
          tickFormatter={formatWeekLabel}
        />
        <YAxis
          type="number"
          allowDecimals={false}
          tickFormatter={value => String(value)}
        />
        <ChartTooltip
          cursor={false}
          content={({ active, payload }) => {
            if (!active || !payload?.[0]?.payload) {
              return null;
            }

            const point = payload[0].payload as (typeof chartData)[number];

            return (
              <CohortTooltipCard>
                <CohortTooltipTitle>
                  {formatWeekLabel(point.date)}
                </CohortTooltipTitle>
                <div>
                  {successLabel}: {point.success_count} / {point.cohort_size}{' '}
                  ({point.percentage}%)
                </div>
              </CohortTooltipCard>
            );
          }}
        />
        <ChartLegend content={<ChartLegendContent />} />
        <Bar
          dataKey="success_count"
          stackId="cohort"
          fill={theme.color.status.success}
        />
        <Bar
          dataKey="failure_count"
          stackId="cohort"
          fill={theme.color.border.subtle}
          radius={[8, 8, 0, 0]}
        />
      </BarChart>
    </StyledChartContainer>
  );
}

export default DataGraph;
