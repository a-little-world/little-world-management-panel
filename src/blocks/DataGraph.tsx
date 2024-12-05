import React from 'react';
import { Bar, BarChart, CartesianGrid, XAxis } from 'recharts';
import styled from 'styled-components';

import {
  ChartConfig,
  ChartContainer,
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
        <Bar dataKey="count" fill="var(--color-desktop)" radius={8} />
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
      label: "Learners",
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
        <Bar dataKey="count_vol" fill="#ff0000" radius={[0, 0, 8, 8]} stackId={"a"} />
        <Bar dataKey="count_ler" fill="var(--color-desktop)" radius={[8, 8, 0, 0]} stackId={"a"} />
      </BarChart>
    </StyledChartContainer>
  );
}

export default DataGraph;
