import { Text, TextTypes } from '@a-little-world/little-world-design-system';
import React from 'react';
import styled from 'styled-components';

import type { FunnelBarSegment } from '../../../helpers/stats';

export interface BarData {
  name: string;
  color?: string;
  description?: string;
  count: string | number;
  percentage: number;
  label?: string;
  longDescription?: string;
  /** When set (e.g. merged funnel step), the filled bar is split by share of each part */
  segments?: FunnelBarSegment[];
}

const getDefaultColor = (total: number, index: number) => {
  const color =
    index + 1 === total
      ? '#16891c'
      : `#1c64f2${index ? Math.floor((1 - index / total) * 100) : ''}`;

  return color;
};

const ChartWrapper = styled.div`
  width: 100%;
`;

const Grid = styled.div`
  display: grid;
  width: 100%;
  grid-template-columns: minmax(max-content, 1fr) max-content 4fr max-content;
  margin-bottom: ${({ theme }) => theme.spacing.small};
  align-items: center;
  gap: ${({ theme }) => theme.spacing.xsmall};
`;

const ChartContainer = styled.div`
  display: contents;
`;

const NameColumn = styled.div`
  display: flex;
  flex-direction: column;
  justify-content: center;
`;

const Name = styled(Text)`
  margin: 0;
  font-weight: bold;
`;

const Description = styled(Text)`
  margin: 0;
  color: ${({ theme }) => theme.color.text.tertiary};
`;

const BarContainer = styled.div`
  position: relative;
  height: 30px;
  background-color: #e0e0e0;
  border-radius: 15px;
  overflow: hidden;
`;

const FilledBar = styled.div<{ $color?: string; $percentage: number }>`
  position: absolute;
  top: 0;
  left: 0;
  height: 100%;
  width: ${({ $percentage }) => $percentage}%;
  background-color: ${({ $color }) => $color || '#4299e1'};
  border-radius: 15px;
  display: flex;
  align-items: center;
  justify-content: flex-end;
  padding-right: ${({ theme }) => theme.spacing.small};
  color: white;
  font-weight: bold;
  box-sizing: border-box;
`;

/** Same shell as FilledBar: pill shape, flex row, right-aligned label area — segment colors live in SegmentTrack */
const SegmentedFilledBar = styled.div<{ $percentage: number }>`
  position: absolute;
  top: 0;
  left: 0;
  height: 100%;
  width: ${({ $percentage }) => $percentage}%;
  border-radius: 15px;
  overflow: hidden;
  display: flex;
  flex-direction: row;
  align-items: center;
  padding-right: ${({ theme }) => theme.spacing.small};
  color: white;
  font-weight: bold;
  box-sizing: border-box;
`;

const SegmentTrack = styled.div`
  flex: 1 1 auto;
  min-width: 0;
  align-self: stretch;
  display: flex;
  flex-direction: row;
  align-items: stretch;
`;

const BarSegment = styled.div<{
  $flex: number;
  $color: string;
}>`
  flex: ${({ $flex }) => $flex} 1 0;
  min-width: 0;
  background-color: ${({ $color }) => $color};
`;

const BarPercentageLabel = styled.span`
  flex-shrink: 0;
  margin-left: ${({ theme }) => theme.spacing.xsmall};
  text-shadow: 0 0 2px rgba(0, 0, 0, 0.35);
`;

const CountColumn = styled(Text)`
  display: flex;
  align-items: center;
  justify-content: flex-end;
`;

const LabelColumn = styled(Text)`
  display: flex;
  align-items: center;
  justify-content: flex-end;
`;

const StyledTitle = styled(Text)`
  margin-bottom: ${({ theme }) => theme.spacing.small};
`;

interface HorizontalBarChartProps {
  data: BarData[];
  title?: string;
}

const SEGMENT_COLORS = [
  '#172554',
  '#1e3a8a',
  '#1e40af',
  '#1d4ed8',
  '#2563eb',
  '#3b82f6',
  '#60a5fa',
  '#0ea5e9',
  '#38bdf8',
  '#7dd3fc',
  '#06b6d4',
  '#22d3ee',
];

function getSegmentColor(segmentIndex: number, segmentCount: number) {
  if (segmentCount <= 0) return SEGMENT_COLORS[0];
  const maxIdx = SEGMENT_COLORS.length - 1;
  if (segmentCount === 1) return SEGMENT_COLORS[Math.floor(maxIdx / 2)];
  const t = segmentIndex / (segmentCount - 1);
  return SEGMENT_COLORS[Math.round(t * maxIdx)];
}

function renderBarFill(
  item: BarData,
  index: number,
  totalRows: number,
  splitBarsEnabled?: boolean,
) {
  const pct = item.percentage;
  const baseColor = item.color || getDefaultColor(totalRows, index);
  const visible =
    item.segments?.filter(s => s.count > 0 && s.fraction > 0) ?? [];

  if (splitBarsEnabled && visible.length >= 2) {
    return (
      <SegmentedFilledBar $percentage={pct}>
        <SegmentTrack>
          {visible.map((seg, si) => (
            <BarSegment
              key={`${seg.label}-${si}`}
              $flex={seg.fraction}
              $color={getSegmentColor(si, visible.length)}
              title={`${seg.label}: ${seg.count}`}
            />
          ))}
        </SegmentTrack>
        <BarPercentageLabel>{pct}%</BarPercentageLabel>
      </SegmentedFilledBar>
    );
  }

  return (
    <FilledBar $percentage={pct} $color={baseColor}>
      {pct}%
    </FilledBar>
  );
}

const HorizontalBarChart: React.FC<HorizontalBarChartProps> = ({
  data,
  title,
}) => {
  return (
    <ChartWrapper>
      {title && (
        <StyledTitle tag="h3" type={TextTypes.Heading5}>
          {title}
        </StyledTitle>
      )}
      <Grid>
        {data.map((item, index) => (
          <ChartContainer key={index}>
            <NameColumn>
              <Name tag="h4">{item.name}</Name>
              {item.description ? (
                <Description type={TextTypes.Body6}>
                  {item.description}
                </Description>
              ) : null}
            </NameColumn>
            <CountColumn>{item.count}</CountColumn>
            <BarContainer>
              {renderBarFill(item, index, data.length)}
            </BarContainer>
            <LabelColumn tag="label" type={TextTypes.Body6}>
              {item.label ?? `${item.percentage}%`}
            </LabelColumn>
          </ChartContainer>
        ))}
      </Grid>
    </ChartWrapper>
  );
};

// Example usage
const exampleData: BarData[] = [
  {
    name: 'Revenue Growth',
    description: 'Year-over-year comparison',
    count: 'Long ones',
    percentage: 75,
    label: 'Q2 2024',
  },
  {
    name: 'Customer Satisfaction',
    description: 'Net Promoter Score',
    count: 'Short ones',
    percentage: 92,
    label: 'Current',
  },
  {
    name: 'Product Adoption',
    description: 'New feature usage',
    count: '800',
    percentage: 65,
    label: 'This Month',
  },
];

export const BarChart = () => (
  <HorizontalBarChart data={exampleData} title="User Funnel" />
);

export default HorizontalBarChart;
