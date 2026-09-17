import { Text, TextTypes } from '@a-little-world/little-world-design-system';
import React from 'react';
import {
  CartesianGrid,
  Legend,
  Line,
  LineChart as RechartsLineChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts';
import styled from 'styled-components';

const ChartWrapper = styled.div`
  width: 100%;
`;

const ChartArea = styled.div<{ $height: number }>`
  height: ${({ $height }) => $height}px;
  min-height: 16rem;
  width: 100%;
`;

const StyledTitle = styled(Text)`
  margin-bottom: ${({ theme }) => theme.spacing.xsmall};
`;

export type LineChartSeriesConfig = {
  id: string;
  color: string;
  label: string;
};

export type LineChartDataPoint = {
  name: string;
  tooltipLabel?: string;
  /** Replaces the default series value row when set (e.g. "2 of 24 participants had a call (8%)"). */
  tooltipDetail?: string;
  /** Optional cautionary note shown below the detail (e.g. small-session warning). */
  tooltipNote?: string;
  /** Dot radius in px — used when variableDotSize is enabled on the chart. */
  dotRadius?: number;
  [key: string]: string | number | undefined;
};

interface LineChartProps {
  data: LineChartDataPoint[];
  series: LineChartSeriesConfig[];
  title?: string;
  height?: number;
  yAxisDomain?: [number | string, number | string];
  yAxisTickFormatter?: (value: number) => string;
  emptyMessage?: string;
  /** Scale dot radius per point using each row's dotRadius field. */
  variableDotSize?: boolean;
}

function TrendTooltip({
  active,
  payload,
  label,
  yAxisTickFormatter,
}: {
  active?: boolean;
  payload?: Array<{
    name: string;
    value: number;
    color: string;
    dataKey: string;
    payload?: LineChartDataPoint;
  }>;
  label?: string;
  yAxisTickFormatter?: (value: number) => string;
}) {
  if (!active || !payload?.length) return null;

  const point = payload[0]?.payload;
  const tooltipLabel = point?.tooltipLabel ?? label;
  const formatValue =
    yAxisTickFormatter ?? ((value: number) => value.toLocaleString());

  return (
    <TooltipPanel>
      {tooltipLabel && <TooltipHeading>{tooltipLabel}</TooltipHeading>}
      {point?.tooltipDetail ? (
        <TooltipDetail>{point.tooltipDetail}</TooltipDetail>
      ) : (
        payload.map(item => (
          <TooltipRow key={item.dataKey}>
            <TooltipSwatch $color={item.color} />
            <TooltipLabel>{item.name}</TooltipLabel>
            <TooltipValue>{formatValue(item.value)}</TooltipValue>
          </TooltipRow>
        ))
      )}
      {point?.tooltipNote && <TooltipNote>{point.tooltipNote}</TooltipNote>}
    </TooltipPanel>
  );
}

const TooltipPanel = styled.div`
  background: ${({ theme }) => theme.color.surface.primary};
  border: 1px solid ${({ theme }) => theme.color.border.subtle};
  border-radius: ${({ theme }) => theme.radius.xxsmall};
  box-shadow: 0 4px 12px rgb(0 0 0 / 8%);
  font-size: 0.75rem;
  padding: ${({ theme }) => theme.spacing.xsmall};
`;

const TooltipHeading = styled.div`
  color: ${({ theme }) => theme.color.text.primary};
  font-weight: 600;
  margin-bottom: ${({ theme }) => theme.spacing.xxxsmall};
`;

const TooltipDetail = styled.div`
  color: ${({ theme }) => theme.color.text.primary};
  line-height: 1.4;
`;

const TooltipNote = styled.div`
  color: ${({ theme }) => theme.color.text.secondary};
  font-style: italic;
  line-height: 1.4;
  margin-top: ${({ theme }) => theme.spacing.xxsmall};
`;

const TooltipRow = styled.div`
  align-items: center;
  display: flex;
  gap: ${({ theme }) => theme.spacing.xxsmall};
`;

const TooltipSwatch = styled.span<{ $color: string }>`
  background: ${({ $color }) => $color};
  border-radius: 2px;
  flex-shrink: 0;
  height: 8px;
  width: 8px;
`;

const TooltipLabel = styled.span`
  color: ${({ theme }) => theme.color.text.secondary};
  flex: 1;
`;

const TooltipValue = styled.span`
  color: ${({ theme }) => theme.color.text.primary};
  font-variant-numeric: tabular-nums;
  font-weight: 600;
`;

const EmptyState = styled(Text).attrs({
  center: true,
  type: TextTypes.Body6,
})`
  color: ${({ theme }) => theme.color.text.secondary};
  padding: ${({ theme }) => theme.spacing.large};
`;

const DOT_RADIUS_DEFAULT = 3;
const DOT_RADIUS_ACTIVE_EXTRA = 2;

function renderVariableDot(props: {
  cx?: number;
  cy?: number;
  stroke?: string;
  payload?: LineChartDataPoint;
}) {
  const { cx, cy, stroke, payload } = props;
  if (cx == null || cy == null) return null;
  const radius =
    typeof payload?.dotRadius === 'number'
      ? payload.dotRadius
      : DOT_RADIUS_DEFAULT;
  return (
    <circle
      cx={cx}
      cy={cy}
      r={radius}
      fill={stroke}
      stroke={stroke}
      strokeWidth={2}
    />
  );
}

function renderVariableActiveDot(props: {
  cx?: number;
  cy?: number;
  stroke?: string;
  payload?: LineChartDataPoint;
}) {
  const { cx, cy, stroke, payload } = props;
  if (cx == null || cy == null) return null;
  const radius =
    (typeof payload?.dotRadius === 'number'
      ? payload.dotRadius
      : DOT_RADIUS_DEFAULT) + DOT_RADIUS_ACTIVE_EXTRA;
  return <circle cx={cx} cy={cy} r={radius} fill={stroke} stroke={stroke} />;
}

export default function LineChart({
  data,
  series,
  title,
  height = 320,
  yAxisDomain,
  yAxisTickFormatter,
  emptyMessage = 'No sessions in this date range.',
  variableDotSize = false,
}: LineChartProps) {
  if (!data.length) {
    return (
      <ChartWrapper>
        {title && (
          <StyledTitle tag="h3" type={TextTypes.Heading5}>
            {title}
          </StyledTitle>
        )}
        <ChartArea $height={height}>
          <EmptyState>{emptyMessage}</EmptyState>
        </ChartArea>
      </ChartWrapper>
    );
  }

  return (
    <ChartWrapper>
      {title && (
        <StyledTitle tag="h3" type={TextTypes.Heading5}>
          {title}
        </StyledTitle>
      )}
      <ChartArea $height={height}>
        <ResponsiveContainer width="100%" height="100%">
          <RechartsLineChart
            data={data}
            margin={{ top: 8, right: 24, left: 0, bottom: 8 }}
          >
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis
              dataKey="name"
              interval="preserveStartEnd"
              minTickGap={24}
              tick={{ fontSize: 11 }}
            />
            <YAxis
              domain={yAxisDomain}
              tick={{ fontSize: 11 }}
              tickFormatter={yAxisTickFormatter}
            />
            <Tooltip
              content={<TrendTooltip yAxisTickFormatter={yAxisTickFormatter} />}
            />
            <Legend
              verticalAlign="top"
              iconType="line"
              wrapperStyle={{ fontSize: '0.75rem', paddingBottom: '0.5rem' }}
            />
            {series.map(line => (
              <Line
                key={line.id}
                type="monotone"
                dataKey={line.id}
                name={line.label}
                stroke={line.color}
                strokeWidth={2}
                dot={
                  variableDotSize
                    ? renderVariableDot
                    : { r: DOT_RADIUS_DEFAULT }
                }
                activeDot={
                  variableDotSize
                    ? renderVariableActiveDot
                    : { r: DOT_RADIUS_DEFAULT + DOT_RADIUS_ACTIVE_EXTRA }
                }
              />
            ))}
          </RechartsLineChart>
        </ResponsiveContainer>
      </ChartArea>
    </ChartWrapper>
  );
}
