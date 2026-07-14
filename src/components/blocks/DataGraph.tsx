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

export default DataGraph;
