import { Select } from '@a-little-world/little-world-design-system';
import React from 'react';
import useSWR from 'swr';

import {
  SIGNUP_FUNNEL_FILTERS,
  SIGNUP_FUNNEL_ID,
  SIGNUP_FUNNEL_MERGE_GROUPS,
  SIGNUP_FUNNEL_MODE,
  SIGNUP_FUNNEL_TITLE,
  USER_SIGNUP_FUNNEL_BUCKET_META,
} from '../../../constants/signupFunnel';
import { FunnelMergeGroup, modifyData } from '../../../helpers/stats';
import { cratePostFetcher } from '../../../store';
import { Card, CardContent, CardHeader } from '../../atoms/Card';
import { DatePicker } from '../../atoms/DatePicker';
import {
  DateRangePicker,
  formatLocalDateYmd,
  parseYmdToLocalDate,
} from '../../atoms/DateRangePicker';
import HorizontalBarChart from '../../atoms/stats/HorizontalBarChart';

const chartCategories: Array<{
  id: string;
  title: string;
  chartBackend?: string;
  filters: string[];
  funnelMergeGroups?: FunnelMergeGroup[];
  funnelMode?: 'stage' | 'dropout';
}> = [
  {
    id: SIGNUP_FUNNEL_ID,
    title: SIGNUP_FUNNEL_TITLE,
    chartBackend: 'v2',
    filters: SIGNUP_FUNNEL_FILTERS,
    funnelMergeGroups: SIGNUP_FUNNEL_MERGE_GROUPS,
    funnelMode: SIGNUP_FUNNEL_MODE,
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

function getMonthDateRange(
  monthTag: string,
  monthToDatesMap: Record<string, string[]>,
) {
  return monthToDatesMap[monthTag];
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
  initialCategory = SIGNUP_FUNNEL_ID,
  displayTimeSelection = true,
  displayVolunteersOnlyCheckbox = true,
  displayTooLowGermanLevelCheckbox = true,
  displayExactTimeSelection = false,
  bucketMetaMap = USER_SIGNUP_FUNNEL_BUCKET_META,
}) {
  const [category, setCategory] = React.useState(
    chartCategories.find(cat => cat.id === initialCategory),
  );
  const [volunteersOnly, setVolunteersOnly] = React.useState(false);
  const [includeTooLowGermanLevel, setIncludeTooLowGermanLevel] =
    React.useState(true);
  // German-level filtering is a cohort gate applied server-side via CohortSpec.
  // The frontend passes include_too_low_german_level; no filter step is removed here.
  const selectedFilters = category?.filters ?? [];

  const today = new Date();
  const [startDate, setStartDate] = React.useState('2021-01-01');
  const [endDate, setEndDate] = React.useState(
    today.toISOString().split('T')[0],
  );

  // Array key: SWR uses the whole array for cache identity; cratePostFetcher
  // only receives the URL (first element) so params stay out of the path.
  const requestKey = [
    '/api/matching/users/statistics/user_journey_buckets/',
    startDate,
    endDate,
    volunteersOnly,
    includeTooLowGermanLevel,
    selectedFilters.join(','),
  ] as const;

  const { mutate, error, data, isLoading } = useSWR(
    requestKey,
    ([url]: readonly [string, ...unknown[]]) =>
      cratePostFetcher({
        selected_filters: selectedFilters,
        start_date: startDate,
        end_date: endDate,
        volunteers_only: volunteersOnly,
        include_too_low_german_level: includeTooLowGermanLevel,
      })(url, undefined),
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

  const modifiedData = modifyData(data?.buckets ?? [], {
    mergeGroups: category?.funnelMergeGroups ?? [],
    bucketMetaMap,
    mode: category?.funnelMode ?? 'dropout',
  });

  return (
    <Card className="">
      <CardHeader>
        <div className="flex justify-between items-center">
          <span>{category?.title}</span>
        </div>
        <p className="text-xs text-muted-foreground mt-1">
          Includes all users that created an account from {startDate} to{' '}
          {endDate}.
        </p>
        <div className="flex flex-row items-center gap-4 mt-3">
          {displayTimeSelection && (
            <div className="flex-1">
              <DateRangePicker
                range={{
                  from: parseYmdToLocalDate(startDate),
                  to: parseYmdToLocalDate(endDate),
                }}
                setRange={range => {
                  if (!range?.from) return;
                  setStartDate(formatLocalDateYmd(range.from));
                  setEndDate(formatLocalDateYmd(range.to ?? range.from));
                }}
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
