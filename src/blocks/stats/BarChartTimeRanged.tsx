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

function createChartConfig_v2(data) {
  const chartConfig = {};
  data.forEach((item, index) => {
    // @ts-ignore
    chartConfig[item.name] = {
      label: item.name,
      description: item.name,
      color: `hsl(var(--chart-${index + 1}))`,
    };
  });
  return chartConfig;
}

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
    id: 'user-signup-funnel',
    title: 'User Signup Funnel',
    chartBackend: 'v2',
    filters: [
        'all',
        'journey_v2__never_active',
        'journey_v2__user_created',
        'journey_v2__user_deleted',
        'journey_v2__email_verified',
        'journey_v2__user_form_completed',
        'journey_v2__too_low_german_level',
        'journey_v2__booked_onboarding_call',
        'journey_v2__no_show',
    ],
  },
  {
    id: 'in-reg',
    title: 'Users still in Registration Process',
    filters: [
      'journey_v2__user_created',
      'journey_v2__email_verified',
      'journey_v2__user_form_completed',
      'journey_v2__booked_onboarding_call',
      'journey_v2__no_show',
    ],
  },
  {
    id: 'await-match',
    title: 'Users awaiting match',
    filters: ['journey_v2__first_search', 'journey_v2__user_searching', 'journey_v2__pre_matching'],
  },
  {
    id: 'match-take-off',
    title: 'Users in Matching Process',
    filters: ['journey_v2__match_takeoff', 'journey_v2__ghoster'],
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

export function BarChartTimeRanged({
  version = 'v2', // TODO 'v1',
  initialCategory = 'user-signup-funnel',
  hideCategoryDropdown = true, // TODO false,
}) {
  return version === 'v1' ? <BarChartTimeRangedV1
    version={version}
    initialCategory={initialCategory}
    hideCategoryDropdown={hideCategoryDropdown}
    /> : <BarChartTimeRangedV2
        initialCategory={initialCategory}
      />
}

function modifyDataV2(data) {
  const modifiedData = []
  const topCount = data[0].count;
  let currentCount = topCount;
  let lastName = ''

  data.forEach((item, index) => {
    if( index !== 0) {
      currentCount -= item.count;
    }
    const percentage = Math.round((currentCount / topCount) * 100);
    modifiedData.push({
      name: item.name,
      count: currentCount,
      description: `${index !== 0 ? '-' : ''} ${item.name} (${item.count}) = ${currentCount} (${percentage}%)`,
    });
  });
  return modifiedData
}

export function MonthTimeSelector({
  startDate,
  endDate,
  setStartDate,
  setEndDate,
  mutate,
}){
  
  const today = new Date();
  const thisYear = today.getFullYear();
  const currentMonth = today.getMonth(); // 0-11
  const monthToDatesMap = {
    "all": ["2021-01-01", today.toISOString().split('T')[0]],
    [`january (${currentMonth >= 0 ? thisYear : thisYear - 1})`]: [`${currentMonth >= 0 ? thisYear : thisYear - 1}-01-01`, `${currentMonth >= 0 ? thisYear : thisYear - 1}-01-31`],
    [`february (${currentMonth >= 1 ? thisYear : thisYear - 1})`]: [`${currentMonth >= 1 ? thisYear : thisYear - 1}-02-01`, `${currentMonth >= 1 ? thisYear : thisYear - 1}-02-28`],
    [`march (${currentMonth >= 2 ? thisYear : thisYear - 1})`]: [`${currentMonth >= 2 ? thisYear : thisYear - 1}-03-01`, `${currentMonth >= 2 ? thisYear : thisYear - 1}-03-31`],
    [`april (${currentMonth >= 3 ? thisYear : thisYear - 1})`]: [`${currentMonth >= 3 ? thisYear : thisYear - 1}-04-01`, `${currentMonth >= 3 ? thisYear : thisYear - 1}-04-30`],
    [`may (${currentMonth >= 4 ? thisYear : thisYear - 1})`]: [`${currentMonth >= 4 ? thisYear : thisYear - 1}-05-01`, `${currentMonth >= 4 ? thisYear : thisYear - 1}-05-31`],
    [`june (${currentMonth >= 5 ? thisYear : thisYear - 1})`]: [`${currentMonth >= 5 ? thisYear : thisYear - 1}-06-01`, `${currentMonth >= 5 ? thisYear : thisYear - 1}-06-30`],
    [`july (${currentMonth >= 6 ? thisYear : thisYear - 1})`]: [`${currentMonth >= 6 ? thisYear : thisYear - 1}-07-01`, `${currentMonth >= 6 ? thisYear : thisYear - 1}-07-31`],
    [`august (${currentMonth >= 7 ? thisYear : thisYear - 1})`]: [`${currentMonth >= 7 ? thisYear : thisYear - 1}-08-01`, `${currentMonth >= 7 ? thisYear : thisYear - 1}-08-31`],
    [`september (${currentMonth >= 8 ? thisYear : thisYear - 1})`]: [`${currentMonth >= 8 ? thisYear : thisYear - 1}-09-01`, `${currentMonth >= 8 ? thisYear : thisYear - 1}-09-30`],
    [`october (${currentMonth >= 9 ? thisYear : thisYear - 1})`]: [`${currentMonth >= 9 ? thisYear : thisYear - 1}-10-01`, `${currentMonth >= 9 ? thisYear : thisYear - 1}-10-31`],
    [`november (${currentMonth >= 10 ? thisYear : thisYear - 1})`]: [`${currentMonth >= 10 ? thisYear : thisYear - 1}-11-01`, `${currentMonth >= 10 ? thisYear : thisYear - 1}-11-30`],
    [`december (${currentMonth >= 11 ? thisYear : thisYear - 1})`]: [`${currentMonth >= 11 ? thisYear : thisYear - 1}-12-01`, `${currentMonth >= 11 ? thisYear : thisYear - 1}-12-31`],
  }

  return <div>
    <Dropdown
      value={startDate}
      options={Object.keys(monthToDatesMap).map(month => ({
        value: month,
        label: month,
      }))}
        onValueChange={val => {
          setStartDate(monthToDatesMap[val][0]);
          setEndDate(monthToDatesMap[val][1]);
          setTimeout(() => {
            mutate();
          }, 500);
        }}
    />
  </div>
}

export function BarChartTimeRangedV2({
  initialCategory = 'user-signup-funnel',
  displayTimeSelection = true,
}) {
  const [category, setCategory] = React.useState(chartCategories.find(cat => cat.id === initialCategory));

  const today = new Date();
  const [startDate, setStartDate] = React.useState('2021-01-01');
  const [endDate, setEndDate] = React.useState(
      today.toISOString().split('T')[0],
  );

  const random = React.useRef(Date.now() + Math.random());
  const { mutate, error, data, isLoading } = useSWR(
    '/api/matching/users/statistics/user_journey_buckets/?random=' + random.current,
    cratePostFetcher({
      selected_filters: category.filters,
      start_date: startDate,
      end_date: endDate,
    }),
    {},
  );

  if (isLoading) return <div>Loading...</div>;
  if (!data) return <div>Error: {error}</div>;
  
  const modifiedData = modifyDataV2(data?.buckets);
  const chartConfig = createChartConfig_v2(modifiedData);

  return <Card className="">
        <CardHeader>
        {category?.title}
        {displayTimeSelection && <MonthTimeSelector
          startDate={startDate}
          endDate={endDate}
          setStartDate={setStartDate}
          setEndDate={setEndDate}
          mutate={mutate}
        />}
      </CardHeader>
      <CardContent className="min-w-[600px]">
        <ChartContainer config={chartConfig}>
          <BarChart
            accessibilityLayer
            data={modifiedData}
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
              tick={<MultilineTick data={modifiedData} />}
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
    </Card>
}
    
  
export function BarChartTimeRangedV1({
  version = 'v1',
  initialCategory = 'user-signup-loss',
  hideCategoryDropdown = true, // TODO false,
}) {
  const [category, setCategory] = React.useState(chartCategories.find(cat => cat.id === initialCategory));

  const random = React.useRef(Date.now() + Math.random());
  const { mutate, error, data, isLoading } = useSWR(
    '/api/matching/users/statistics/user_journey_buckets/?random=' + random.current,
    cratePostFetcher({
      selected_filters: category.filters,
    }),
    {},
  );

  if (isLoading) return <div>Loading...</div>;
  if (!data) return <div>Error: {error}</div>;
  
  const modifiedData = data?.buckets;
  const chartConfig = createChartConfig(modifiedData);
  return (
    <Card className="">
      <CardHeader>
        {!hideCategoryDropdown && <StyledDropdown
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
        />}
        <CardTitle>{category.title}</CardTitle>
        {/*<CardDescription>January - June 2024</CardDescription>*/}
      </CardHeader>
      <CardContent className="min-w-[600px]">
        <ChartContainer config={chartConfig}>
          <BarChart
            accessibilityLayer
            data={modifiedData}
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
              tick={<MultilineTick data={modifiedData} />}
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
        NOTE: Data filtered down to the current matching user
      </CardFooter>
    </Card>
  );
}