import {
  Select,
  Text,
  TextTypes,
} from '@a-little-world/little-world-design-system';
import React from 'react';
import type { DateRange } from 'react-day-picker';
import styled from 'styled-components';
import useSWR from 'swr';

import { apiFetch } from '../../../api/helpers';
import {
  DateRangePicker,
  formatLocalDateYmd,
} from '../../atoms/DateRangePicker';
import DataGraph from '../DataGraph';

const StyledDropdown = styled(Select)`
  div[data-radix-popper-content-wrapper] {
    z-index: 20 !important;
  }
  width: 100%;
`;

const GRAPH_ENDPOINT = '/api/matching/statistics/time-series/';

const GraphLayout = styled.div`
  align-items: center;
  display: flex;
  flex-direction: column;
  gap: ${({ theme }) => theme.spacing.small};
  width: 100%;
`;

const Controls = styled.div`
  align-items: flex-end;
  display: flex;
  flex-wrap: wrap;
  gap: ${({ theme }) => theme.spacing.small};
  justify-content: center;
  width: 100%;
`;

const Control = styled.div`
  min-width: 180px;
`;

type MetricUnit = 'count' | 'duration_seconds';

type CallType = 'all' | 'standard' | 'random';

type Metric = {
  id: string;
  display_name: string;
  description: string;
  unit: MetricUnit;
  supports_call_type: boolean;
};

type TimeSeriesPoint = {
  date: string;
  period_value: number;
  cumulative_value: number;
};

type TimeSeriesResponse = {
  metric: Metric;
  points: TimeSeriesPoint[];
};

const formatDuration = (seconds: number) => {
  const totalMinutes = Math.round(seconds / 60);
  const hours = Math.floor(totalMinutes / 60);
  const minutes = totalMinutes % 60;

  if (hours === 0) return `${minutes}m`;
  return `${hours}h ${minutes}m`;
};

export function RangedDataGraph() {
  const [metricId, setMetricId] = React.useState('video_calls');
  const [dateRange, setDateRange] = React.useState<DateRange | undefined>({
    from: new Date(2024, 0, 1),
    to: new Date(),
  });
  const [dayRange, setDayRange] = React.useState(1);
  const [displayMode, setDisplayMode] = React.useState<'period' | 'cumulative'>(
    'period',
  );
  const [callType, setCallType] = React.useState<CallType>('all');

  const {
    data: metrics,
    error: metricsError,
    isLoading: metricsLoading,
  } = useSWR<Metric[]>(GRAPH_ENDPOINT, (url: string) =>
    apiFetch<Metric[]>(url),
  );
  const selectedMetric = metrics?.find(metric => metric.id === metricId);
  const requestStartDate = dateRange?.from
    ? formatLocalDateYmd(dateRange.from)
    : null;
  const requestEndDate = dateRange?.to
    ? formatLocalDateYmd(dateRange.to)
    : null;
  const dateRangeIsValid =
    requestStartDate !== null &&
    requestEndDate !== null &&
    requestStartDate <= requestEndDate;
  // Only call metrics take a call type; leaving it out elsewhere keeps one cache
  // entry per metric instead of one per hidden filter value.
  const requestCallType = selectedMetric?.supports_call_type
    ? callType
    : undefined;

  const {
    data,
    error: dataError,
    isLoading: dataLoading,
  } = useSWR<TimeSeriesResponse>(
    selectedMetric && dateRangeIsValid
      ? ([
          GRAPH_ENDPOINT,
          metricId,
          requestStartDate,
          requestEndDate,
          dayRange,
          requestCallType,
        ] as const)
      : null,
    ([url]) =>
      apiFetch<TimeSeriesResponse>(url, {
        method: 'POST',
        body: {
          metric_id: metricId,
          start_date: requestStartDate,
          end_date: requestEndDate,
          bucket_size: dayRange,
          ...(requestCallType && { call_type: requestCallType }),
        },
      }),
    // Keep the current chart on screen while the next range or metric loads.
    { keepPreviousData: true },
  );

  if (metricsLoading) return <div>Loading...</div>;
  if (!metrics) return <div>Error: {String(metricsError)}</div>;

  const chartData =
    data?.points.map(point => ({
      date: point.date,
      count:
        displayMode === 'cumulative'
          ? point.cumulative_value
          : point.period_value,
    })) ?? [];
  // Format by the metric the data belongs to, which can lag the selection while
  // keepPreviousData shows the old chart.
  const valueFormatter =
    data?.metric.unit === 'duration_seconds'
      ? formatDuration
      : (value: number) => value.toLocaleString();

  return (
    <GraphLayout>
      <Text type={TextTypes.Body3} bold tag="h2">
        {selectedMetric?.display_name}
      </Text>
      <StyledDropdown
        value={metricId}
        options={metrics.map(metric => ({
          value: metric.id,
          label: metric.display_name,
        }))}
        onValueChange={setMetricId}
        placeholder="Select a metric..."
        cannotError
      />
      <Text type={TextTypes.Body6}>{selectedMetric?.description}</Text>
      <Text type={TextTypes.Body6}>
        Statistics are limited to users the current matching user can access.
      </Text>
      <Controls>
        <DateRangePicker
          label="Date range"
          range={dateRange}
          setRange={setDateRange}
        />
        <Control>
          <StyledDropdown
            label="Period"
            value={dayRange.toString()}
            options={[1, 7, 30].map(val => ({
              value: val.toString(),
              label: val === 1 ? 'Daily' : val === 7 ? 'Weekly' : 'Monthly',
            }))}
            onValueChange={val => setDayRange(parseInt(val, 10))}
            placeholder="Select a period..."
            cannotError
          />
        </Control>
        <Control>
          <StyledDropdown
            label="Value"
            value={displayMode}
            options={[
              { value: 'period', label: 'Per period' },
              { value: 'cumulative', label: 'Cumulative in range' },
            ]}
            onValueChange={value =>
              setDisplayMode(value as 'period' | 'cumulative')
            }
            placeholder="Select a value..."
            cannotError
          />
        </Control>
        {selectedMetric?.supports_call_type && (
          <Control>
            <StyledDropdown
              label="Call type"
              value={callType}
              options={[
                { value: 'all', label: 'All calls' },
                { value: 'standard', label: 'Standard calls' },
                { value: 'random', label: 'Random calls' },
              ]}
              onValueChange={value => setCallType(value as CallType)}
              placeholder="Select a call type..."
              cannotError
            />
          </Control>
        )}
      </Controls>
      {!dateRangeIsValid && (
        <Text type={TextTypes.Body6}>
          Select both a start and an end date, with the end on or after the
          start.
        </Text>
      )}
      {dataLoading && <div>Loading graph...</div>}
      {dataError && <div>Error: {String(dataError)}</div>}
      {data && dateRangeIsValid && (
        <DataGraph
          data={chartData}
          dataLabel={`${data.metric.display_name}: `}
          valueFormatter={valueFormatter}
        />
      )}
    </GraphLayout>
  );
}
