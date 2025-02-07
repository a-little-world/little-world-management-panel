import { Text, TextTypes } from '@a-little-world/little-world-design-system';
import React from 'react';
import {
  Area,
  AreaChart,
  Bar,
  BarChart,
  CartesianGrid,
  Legend,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts';
import styled, { useTheme } from 'styled-components';

const example_elements_config = [
  { id: 'uv', color: '#8884d8' },
  { id: 'pv', color: '#82ca9d' },
  { id: 'amt', color: '#ffc658' },
];

const example_data = [
  {
    name: 'Page A',
    uv: 4000,
    pv: 2400,
    amt: 2400,
  },
  {
    name: 'Page B',
    uv: 3000,
    pv: 1398,
    amt: 2210,
  },
  {
    name: 'Page C',
    uv: 2000,
    pv: 9800,
    amt: 2290,
  },
  {
    name: 'Page D',
    uv: 2780,
    pv: 3908,
    amt: 2000,
  },
  {
    name: 'Page E',
    uv: 1890,
    pv: 4800,
    amt: 2181,
  },
  {
    name: 'Page F',
    uv: 2390,
    pv: 3800,
    amt: 2500,
  },
  {
    name: 'Page G',
    uv: 3490,
    pv: 4300,
    amt: 2100,
  },
];

const ChartWrapper = styled.div`
  width: 100%;
  height: 400px;
  min-height: clamp(10rem, 70vh, 40rem);
`;

const StyledTitle = styled(Text)`
  margin-bottom: ${({ theme }) => theme.spacing.xsmall};
`;

type AreaChartDataType = {
  name: string;
  uv: number;
  pv: number;
  amt: number;
}[];

type ElementType = {
  id: string;
  color: string;
};

interface StackedChartProps {
  data: AreaChartDataType[];
  elementsConfig: ElementType[];
  title?: string;
  type?: 'bar' | 'area';
}

const StackedChart = ({
  data = example_data,
  elementsConfig = example_elements_config,
  title,
  type = 'bar',
}: StackedChartProps) => {
  const theme = useTheme();
  const ChartType = type === 'area' ? AreaChart : BarChart;
  const ChartElement = type === 'area' ? Area : Bar;

  return (
    <ChartWrapper>
      {title && (
        <StyledTitle tag="h3" type={TextTypes.Heading5}>
          {title}
        </StyledTitle>
      )}
      <ResponsiveContainer width="100%" aspect={9 / 16}>
        <ChartType
          // width={500}
          // height={400}
          data={data}
          margin={{
            top: 10,
            right: 30,
            left: 0,
            bottom: 0,
          }}
        >
          <Legend
            verticalAlign="top"
            margin={{ bottom: 16 }}
            iconType="square"
          />
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis dataKey="name" />
          <YAxis />
          <Tooltip />
          {elementsConfig.map(element => (
            <ChartElement
              type="monotone"
              dataKey={element.id}
              stackId="1"
              stroke={element.color}
              fill={element.color}
            />
          ))}
        </ChartType>
      </ResponsiveContainer>
    </ChartWrapper>
  );
};

export default StackedChart;
