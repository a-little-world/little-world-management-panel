import { Text, TextTypes } from '@a-little-world/little-world-design-system';
import React from 'react';
import styled from 'styled-components';

interface BarData {
  name: string;
  color?: string;
  description: string;
  count: string;
  percentage: number;
  label: string;
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
              <Description type={TextTypes.Body6}>
                {item.description}
              </Description>
            </NameColumn>
            <CountColumn>{item.count}</CountColumn>
            <BarContainer>
              <FilledBar
                $percentage={item.percentage}
                $color={item.color || getDefaultColor(data.length, index)}
              >
                {item.percentage}%
              </FilledBar>
            </BarContainer>
            <LabelColumn tag="label" type={TextTypes.Body6}>
              {item.label}
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
