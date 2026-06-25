import {
  Select,
  Text as DSText,
  TextTypes,
} from '@a-little-world/little-world-design-system';
import React from 'react';
import { Bar, BarChart, CartesianGrid, XAxis } from 'recharts';
import styled from 'styled-components';
import useSWR from 'swr';

import { modifyData, type FunnelMergeGroup } from '../../../helpers/stats';
import { cratePostFetcher } from '../../../store';
import { Card, CardContent, CardHeader } from '../../atoms/Card';
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
} from '../../atoms/Chart';
import { DatePicker } from '../../atoms/DatePicker';
import HorizontalBarChart from '../../atoms/stats/HorizontalBarChart';

const matchJourneyChartCategories = [
  {
    id: 'match-journey',
    title: 'Match Journey',
    filters: [
      'all',
      'match_journey_v2__ongoing_matches',
      //'match_journey_v2__failed_matches',
      'match_journey_v2__sucess_matches',
    ],
  },
];

const chartCategories: Array<{
  id: string;
  title: string;
  chartBackend?: string;
  filters: string[];
  funnelMergeGroups?: FunnelMergeGroup[];
}> = [
  {
    id: 'user-signup-funnel',
    title: 'User Signup Funnel',
    chartBackend: 'v2',
    filters: [
      'all',
      'journey_v2__never_active_or_deleted',
      'journey_v2__user_created',
      //'journey_v2__user_deleted', is within the first bucket now!
      'journey_v2__email_verified',
      'journey_v2__user_form_completed',
      'journey_v2__too_low_german_level',
      'journey_v2__booked_onboarding_call',
      'journey_v2__self_onboarding_started',
      'journey_v2__no_show',
    ],
    funnelMergeGroups: [
      {
        buckets: [
          'journey_v2__booked_onboarding_call',
          'journey_v2__self_onboarding_started',
        ],
        label: 'Onboarding started',
      },
    ],
  },
  {
    id: 'simplified-user-signup-funnel',
    title: 'Simplified User Signup Funnel',
    filters: [
      'all',
      // Registered users
      'journey_v2__never_active_or_deleted_or_created',
      // Verified users
      'journey_v2__email_verified_and_form_completed',
      // Not onboarded users
      'journey_v2__too_low_german_level_or_not_onboarded',
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
      'journey_v2__self_onboarding_started',
      'journey_v2__no_show',
    ],
    funnelMergeGroups: [
      {
        buckets: [
          'journey_v2__booked_onboarding_call',
          'journey_v2__self_onboarding_started',
        ],
        label: 'Onboarding started',
      },
    ],
  },
  {
    id: 'await-match',
    title: 'Users awaiting match',
    filters: [
      'journey_v2__first_search',
      'journey_v2__user_searching',
      'journey_v2__pre_matching',
    ],
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

const StyledChartContainer = styled(ChartContainer)<{
  $minHeight?: string;
  $maxHeight?: string;
}>`
  aspect-ratio: unset !important;
  max-height: ${({ $maxHeight }) => $maxHeight || '640px'};
  min-height: ${({ $minHeight }) => $minHeight || '400px'};
  height: auto;
`;

export function DataGraphSingupFunnelEvolution({
  filters,
  data,
  chartConfig,
  maxHeight,
  minHeight,
}) {
  return (
    <StyledChartContainer
      config={chartConfig}
      $maxHeight={maxHeight}
      $minHeight={minHeight}
    >
      <BarChart accessibilityLayer data={data}>
        <CartesianGrid vertical={false} />
        <XAxis
          dataKey="monthTag"
          tickLine={true}
          tickMargin={0}
          axisLine={true}
          angle={-20}
          textAnchor="end"
          interval={0}
          tickFormatter={(value: string) => value.slice(0, 20)}
        />
        <ChartTooltip cursor={false} content={<ChartTooltipContent />} />
        {filters.map((item, index) => (
          <Bar
            dataKey={item}
            fill={chartConfig[item].color}
            radius={[0, 0, 0, 0]}
            stackId={'a'}
          />
        ))}
      </BarChart>
    </StyledChartContainer>
  );
}

export function MatchingFunnelEvolution({
  dataModFunc = modifyData,
  dataset = 'match-journey',
}) {
  const today = new Date();
  const thisYear = today.getFullYear();
  const currentMonth = today.getMonth(); // 0-11
  const months = [];

  for (let i = 0; i < 12; i++) {
    const monthIndex = (currentMonth - i + 12) % 12; // Wrap around to previous year
    const year = currentMonth - i >= 0 ? thisYear : thisYear - 1;
    const monthNames = [
      'january',
      'february',
      'march',
      'april',
      'may',
      'june',
      'july',
      'august',
      'september',
      'october',
      'november',
      'december',
    ];

    const daysInMonth = new Date(year, monthIndex + 1, 0).getDate(); // Get last day of month

    months.push({
      key: `${monthNames[monthIndex]} (${year})`,
      dates: [
        `${year}-${String(monthIndex + 1).padStart(2, '0')}-01`,
        `${year}-${String(monthIndex + 1).padStart(2, '0')}-${daysInMonth}`,
      ],
    });
  }
  const monthToDatesMap = {
    all: ['2021-01-01', today.toISOString().split('T')[0]],
    ...Object.fromEntries(months.reverse().map(m => [m.key, m.dates])),
  };
  const monthToDatesKeys = Object.keys(monthToDatesMap);
  const filters =
    matchJourneyChartCategories.find(cat => cat.id === dataset)?.filters || [];

  // const tag1Data = useMonthData(filters, monthToDatesKeys[0], monthToDatesMap) we don't need 'all'
  const tag2Data = useMonthDataMatching(
    filters,
    monthToDatesKeys[1],
    monthToDatesMap,
  );
  const tag3Data = useMonthDataMatching(
    filters,
    monthToDatesKeys[2],
    monthToDatesMap,
  );
  const tag4Data = useMonthDataMatching(
    filters,
    monthToDatesKeys[3],
    monthToDatesMap,
  );
  const tag5Data = useMonthDataMatching(
    filters,
    monthToDatesKeys[4],
    monthToDatesMap,
  );
  const tag6Data = useMonthDataMatching(
    filters,
    monthToDatesKeys[5],
    monthToDatesMap,
  );
  const tag7Data = useMonthDataMatching(
    filters,
    monthToDatesKeys[6],
    monthToDatesMap,
  );
  const tag8Data = useMonthDataMatching(
    filters,
    monthToDatesKeys[7],
    monthToDatesMap,
  );
  const tag9Data = useMonthDataMatching(
    filters,
    monthToDatesKeys[8],
    monthToDatesMap,
  );
  const tag10Data = useMonthDataMatching(
    filters,
    monthToDatesKeys[9],
    monthToDatesMap,
  );
  const tag11Data = useMonthDataMatching(
    filters,
    monthToDatesKeys[10],
    monthToDatesMap,
  );
  const tag12Data = useMonthDataMatching(
    filters,
    monthToDatesKeys[11],
    monthToDatesMap,
  );
  const tag13Data = useMonthDataMatching(
    filters,
    monthToDatesKeys[12],
    monthToDatesMap,
  );

  const data = [
    tag2Data,
    tag3Data,
    tag4Data,
    tag5Data,
    tag6Data,
    tag7Data,
    tag8Data,
    tag9Data,
    tag10Data,
    tag11Data,
    tag12Data,
    tag13Data,
  ];
  const isLoading = data.some(item => item.isLoading);
  const errorItem = data.find(item => item.error);
  const isError = !!errorItem;
  const errorMessage = errorItem?.error
    ? errorItem.error instanceof Error
      ? errorItem.error.message
      : String(errorItem.error)
    : null;

  const pureData =
    !isLoading && !isError
      ? data.map(item => {
          console.log('item', item);
          const modifiedData = dataModFunc(item.data.buckets);
          const bucketsMap = modifiedData.reduce((acc, bucket) => {
            acc[bucket.name] = bucket.count;
            return acc;
          }, {});

          return {
            monthTag: item.monthTag,
            ...bucketsMap,
          };
        })
      : [];

  // now we need to transfer all the data into the form [{time: monthTag, count1: 222, count2 ....}]
  const chartConfig = {};
  filters.forEach((item, index) => {
    // @ts-ignore
    chartConfig[item] = {
      label: item === 'all' ? 'All' : `- (minus) ${item}`,
      description: item,
      color: `hsl(var(--chart-${index + 1}))`,
    };
  });

  return (
    <div>
      <DSText type={TextTypes.Body3} tag="h3">
        Match Journey Evolution
      </DSText>
      {isLoading && <div>Loading...</div>}
      {isError && <div>Error: {errorMessage || 'An error occurred'}</div>}
      <DataGraphSingupFunnelEvolution
        filters={filters}
        data={pureData}
        chartConfig={chartConfig}
        maxHeight="640px"
        minHeight="400px"
      />
    </div>
  );
}

function getMonthDateRange(
  monthTag: string,
  monthToDatesMap: Record<string, string[]>,
) {
  return monthToDatesMap[monthTag];
}

function useMonthDataMatching(
  filters: string[],
  monthTag: string,
  monthToDatesMap: Record<string, string[]>,
) {
  const [startDate, endDate] = getMonthDateRange(monthTag, monthToDatesMap);
  const random = React.useRef(Date.now() + Math.random());
  const { mutate, error, data, isLoading } = useSWR(
    `/api/matching/users/statistics/match_journey_buckets/?random=${random.current}`,
    cratePostFetcher({
      selected_filters: filters,
      start_date: startDate,
      end_date: endDate,
    }),
    {},
  );

  return {
    data: data,
    monthTag: monthTag,
    isLoading,
    error,
  };
}

export function ExactTimeSelector({
  startDate,
  endDate,
  setStartDate,
  setEndDate,
  mutate,
}) {
  return (
    <div className="flex flex-row items-center content-center justify-center">
      <div className="flex w-full items-start">Start Date:</div>
      <DatePicker
        date={startDate}
        setDate={date => {
          setStartDate(date);
          setTimeout(() => {
            mutate();
          }, 500);
        }}
      />
      <div className="flex w-full items-start">End Date</div>
      <DatePicker
        date={endDate}
        setDate={date => {
          setEndDate(date);
          setTimeout(() => {
            mutate();
          }, 500);
        }}
      />
    </div>
  );
}

export function MonthTimeSelector({
  startDate,
  endDate,
  setStartDate,
  setEndDate,
  mutate,
}) {
  const today = new Date();
  const thisYear = today.getFullYear();
  const currentMonth = today.getMonth(); // 0-11
  const monthToDatesMap = {
    all: ['2021-01-01', today.toISOString().split('T')[0]],
    [`january (${currentMonth >= 0 ? thisYear : thisYear - 1})`]: [
      `${currentMonth >= 0 ? thisYear : thisYear - 1}-01-01`,
      `${currentMonth >= 0 ? thisYear : thisYear - 1}-01-31`,
    ],
    [`february (${currentMonth >= 1 ? thisYear : thisYear - 1})`]: [
      `${currentMonth >= 1 ? thisYear : thisYear - 1}-02-01`,
      `${currentMonth >= 1 ? thisYear : thisYear - 1}-02-28`,
    ],
    [`march (${currentMonth >= 2 ? thisYear : thisYear - 1})`]: [
      `${currentMonth >= 2 ? thisYear : thisYear - 1}-03-01`,
      `${currentMonth >= 2 ? thisYear : thisYear - 1}-03-31`,
    ],
    [`april (${currentMonth >= 3 ? thisYear : thisYear - 1})`]: [
      `${currentMonth >= 3 ? thisYear : thisYear - 1}-04-01`,
      `${currentMonth >= 3 ? thisYear : thisYear - 1}-04-30`,
    ],
    [`may (${currentMonth >= 4 ? thisYear : thisYear - 1})`]: [
      `${currentMonth >= 4 ? thisYear : thisYear - 1}-05-01`,
      `${currentMonth >= 4 ? thisYear : thisYear - 1}-05-31`,
    ],
    [`june (${currentMonth >= 5 ? thisYear : thisYear - 1})`]: [
      `${currentMonth >= 5 ? thisYear : thisYear - 1}-06-01`,
      `${currentMonth >= 5 ? thisYear : thisYear - 1}-06-30`,
    ],
    [`july (${currentMonth >= 6 ? thisYear : thisYear - 1})`]: [
      `${currentMonth >= 6 ? thisYear : thisYear - 1}-07-01`,
      `${currentMonth >= 6 ? thisYear : thisYear - 1}-07-31`,
    ],
    [`august (${currentMonth >= 7 ? thisYear : thisYear - 1})`]: [
      `${currentMonth >= 7 ? thisYear : thisYear - 1}-08-01`,
      `${currentMonth >= 7 ? thisYear : thisYear - 1}-08-31`,
    ],
    [`september (${currentMonth >= 8 ? thisYear : thisYear - 1})`]: [
      `${currentMonth >= 8 ? thisYear : thisYear - 1}-09-01`,
      `${currentMonth >= 8 ? thisYear : thisYear - 1}-09-30`,
    ],
    [`october (${currentMonth >= 9 ? thisYear : thisYear - 1})`]: [
      `${currentMonth >= 9 ? thisYear : thisYear - 1}-10-01`,
      `${currentMonth >= 9 ? thisYear : thisYear - 1}-10-31`,
    ],
    [`november (${currentMonth >= 10 ? thisYear : thisYear - 1})`]: [
      `${currentMonth >= 10 ? thisYear : thisYear - 1}-11-01`,
      `${currentMonth >= 10 ? thisYear : thisYear - 1}-11-30`,
    ],
    [`december (${currentMonth >= 11 ? thisYear : thisYear - 1})`]: [
      `${currentMonth >= 11 ? thisYear : thisYear - 1}-12-01`,
      `${currentMonth >= 11 ? thisYear : thisYear - 1}-12-31`,
    ],
  };

  return (
    <div>
      <Select
        id="month-time-selector"
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
  );
}

export function BarChartTimeRanged({
  initialCategory = 'user-signup-funnel',
  displayTimeSelection = true,
  displayVolunteersOnlyCheckbox = true,
  displayTooLowGermanLevelCheckbox = true,
  displayExactTimeSelection = false,
  listDescriptionMap = {},
}) {
  const [category, setCategory] = React.useState(
    chartCategories.find(cat => cat.id === initialCategory),
  );
  const [volunteersOnly, setVolunteersOnly] = React.useState(false);
  const [includeTooLowGermanLevel, setIncludeTooLowGermanLevel] =
    React.useState(true);
  const selectedFilters =
    category?.filters.filter(
      filter =>
        includeTooLowGermanLevel ||
        filter !== 'journey_v2__too_low_german_level',
    ) ?? [];

  const today = new Date();
  const [startDate, setStartDate] = React.useState('2021-01-01');
  const [endDate, setEndDate] = React.useState(
    today.toISOString().split('T')[0],
  );

  const random = React.useRef(Date.now() + Math.random());
  const { mutate, error, data, isLoading } = useSWR(
    '/api/matching/users/statistics/user_journey_buckets/?random=' +
      random.current,
    cratePostFetcher({
      selected_filters: selectedFilters,
      start_date: startDate,
      end_date: endDate,
      volunteers_only: volunteersOnly,
      include_too_low_german_level: includeTooLowGermanLevel,
    }),
    {},
  );

  if (isLoading) return <div>Loading...</div>;
  if (!data) {
    const errorMessage = error
      ? error instanceof Error
        ? error.message
        : String(error)
      : 'An error occurred';
    return <div>Error: {errorMessage}</div>;
  }

  const modifiedData = modifyData(data?.buckets ?? [], listDescriptionMap, {
    mergeGroups: category?.funnelMergeGroups ?? [],
  });

  return (
    <Card className="">
      <CardHeader>
        <div className="flex justify-between items-center">
          <span>{category?.title}</span>
        </div>
        <div className="flex flex-row items-center gap-4 mt-3">
          {displayTimeSelection && (
            <div className="flex-1">
              <MonthTimeSelector
                startDate={startDate}
                endDate={endDate}
                setStartDate={setStartDate}
                setEndDate={setEndDate}
                mutate={mutate}
              />
            </div>
          )}
          {displayExactTimeSelection && (
            <div className="flex-1">
              <ExactTimeSelector
                startDate={startDate}
                endDate={endDate}
                setStartDate={setStartDate}
                setEndDate={setEndDate}
                mutate={mutate}
              />
            </div>
          )}
          {displayVolunteersOnlyCheckbox && (
            <div className="flex items-center space-x-2">
              <input
                type="checkbox"
                id="volunteers-only"
                checked={volunteersOnly}
                onChange={e => {
                  setVolunteersOnly(e.target.checked);
                  setTimeout(() => {
                    mutate();
                  }, 500);
                }}
                className="h-4 w-4 rounded border-gray-300 text-primary focus:ring-primary"
              />
              <label
                htmlFor="volunteers-only"
                className="text-sm font-medium text-gray-700"
              >
                Volunteers only
              </label>
            </div>
          )}
          {displayTooLowGermanLevelCheckbox && (
            <div className="flex items-center space-x-2">
              <input
                type="checkbox"
                id="include-too-low-german-level"
                checked={includeTooLowGermanLevel}
                onChange={e => {
                  setIncludeTooLowGermanLevel(e.target.checked);
                  setTimeout(() => {
                    mutate();
                  }, 500);
                }}
                className="h-4 w-4 rounded border-gray-300 text-primary focus:ring-primary"
              />
              <label
                htmlFor="include-too-low-german-level"
                className="text-sm font-medium text-gray-700"
              >
                Include too low German level
              </label>
            </div>
          )}
        </div>
      </CardHeader>
      <CardContent className="min-w-[600px]">
        <HorizontalBarChart data={modifiedData} />
      </CardContent>
    </Card>
  );
}
