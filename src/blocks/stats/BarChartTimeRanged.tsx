import { Dropdown } from '@a-little-world/little-world-design-system';
import React from 'react';
import { Bar, BarChart, Text, XAxis, YAxis } from 'recharts';
import styled from 'styled-components';
import useSWR from 'swr';

import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
} from '../../atoms/Card';
import {
  ChartConfig,
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
} from '../../atoms/Chart';
import { cratePostFetcher } from '../../store';

const StyledDropdown = styled(Dropdown)`
  div[data-radix-popper-content-wrapper] {
    z-index: 20 !important;
  }
  width: 100%;
`;

const chartData = [
  { name: 'chrome', count: 275, fill: 'var(--color-chrome)' },
  { name: 'safari', count: 200, fill: 'var(--color-safari)' },
  { name: 'firefox', count: 187, fill: 'var(--color-firefox)' },
  { name: 'edge', count: 173, fill: 'var(--color-edge)' },
  { name: 'other', count: 90, fill: 'var(--color-other)' },
];

function createChartConfig(data) {
  const chartConfig = {};
  data.forEach((item, index) => {
    // @ts-ignore
    chartConfig[item.name] = {
      label: item.name,
      description: item.description,
      color: `hsl(var(--chart-${index + 1}))`,
    };
  });
  return chartConfig;
}

function wrapText(text, lineLength) {
  const words = text.split(' ');
  const lines = [];
  let currentLine = '';

  words.forEach(word => {
    if ((currentLine + word).length > lineLength) {
      lines.push(currentLine);
      currentLine = word;
    } else {
      currentLine += (currentLine === '' ? '' : ' ') + word;
    }
  });

  lines.push(currentLine); // push the last line
  return lines;
}

const chartCategories = [
  {
    id: 'in-reg',
    title: 'Users still in Registration Process',
    filters: [
      'ujv2_user_created',
      'ujv2_email_verified',
      'ujv2_user_form_completed',
      'ujv2_booked_onboarding_call',
      'ujv2_no_show',
    ],
  },
  {
    id: 'await-match',
    title: 'Users awaiting match',
    filters: ['ujv2_first_search', 'ujv2_user_searching', 'ujv2_pre_matching'],
  },
  {
    id: 'match-take-off',
    title: 'Users in Matching Process',
    filters: ['ujv2_match_takeoff', 'ujv2_ghoster'],
  },
  {
    id: 'active-users',
    title: 'Active Users',
    filters: ['active_match'],
  },
];

function MultilineTick(props) {
  const { x, y, payload } = props;
  const data = props.data;
  const category = data.find(item => item.name === payload.value);
  const lines = wrapText(category?.description, 40);
  const [hovered, setHovered] = React.useState(false);

  return (
    <g
      transform={`translate(${x},${y})`}
      onMouseEnter={() => {
        setHovered(true);
      }}
      onMouseLeave={() => {
        setHovered(false);
      }}
      onClick={() => {
        window.location.href = '/matching/users/?list=' + category.name;
      }}
    >
      {lines.map((line, index) => (
        <Text
          color={'red'}
          textDecoration={hovered ? 'underline' : 'none'}
          key={`line-${index}`}
          x={0}
          y={index * 16}
          textAnchor="end"
          dominantBaseline="end"
        >
          {line}
        </Text>
      ))}
    </g>
  );
}

export function BarChartTimeRanged() {
  const [category, setCategory] = React.useState(chartCategories[0]);

  const { mutate, error, data, isLoading } = useSWR(
    '/api/matching/users/statistics/user_journey_buckets/',
    cratePostFetcher({
      selected_filters: category.filters,
    }),
    {},
  );

  if (isLoading) return <div>Loading...</div>;
  if (!data) return <div>Error: {error}</div>;

  const chartConfig = createChartConfig(data);
  return (
    <Card className="">
      <CardHeader>
        <StyledDropdown
          value={category.id}
          options={chartCategories.map(({ id, title }) => ({
            value: id,
            label: title,
          }))}
          onValueChange={val => {
            // @ts-ignore
            setCategory(chartCategories.find(cat => cat.id === val));
            setTimeout(() => {
              mutate();
            }, 100);
          }}
          placeholder="Select a user list..."
          cannotError
        />
        <CardTitle>{category.title}</CardTitle>
        {/*<CardDescription>January - June 2024</CardDescription>*/}
      </CardHeader>
      <CardContent className="min-w-[600px]">
        <ChartContainer config={chartConfig}>
          <BarChart
            accessibilityLayer
            data={data}
            layout="vertical"
            margin={{
              left: 200,
            }}
          >
            <YAxis
              dataKey="name"
              type="category"
              tickLine={true}
              tickMargin={1}
              axisLine={false}
              tick={<MultilineTick data={data} />}
            />
            <XAxis dataKey="count" type="number" hide />
            <ChartTooltip
              cursor={false}
              content={<ChartTooltipContent hideLabel />}
            />
            <Bar
              dataKey="count"
              layout="vertical"
              radius={3}
              width={1}
              height={1}
            />
          </BarChart>
        </ChartContainer>
      </CardContent>
      <CardFooter className="flex-col items-start gap-2 text-sm">
        NODE: Data filtered down to the current matching user
      </CardFooter>
    </Card>
  );
}
