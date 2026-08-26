import { Select } from '@a-little-world/little-world-design-system';
import React from 'react';
import styled from 'styled-components';
import useSWR from 'swr';

import {
  AMBER_40,
  BLUE_40,
  GRAY_40,
  GREEN_40,
  RED_40,
} from '../../../constants';
import { cratePostFetcher } from '../../../store';
import { PieChart } from './PieChart';

const StyledDropdown = styled(Select)`
  div[data-radix-popper-content-wrapper] {
    z-index: 20 !important;
  }
  width: 100%;
`;

const SLICE_COLORS: Record<string, string> = {
  successful: GREEN_40,
  in_flight: BLUE_40,
  kickoff: AMBER_40,
  did_not_succeed: RED_40,
  other: GRAY_40,
};

type QualitySlice = {
  id: string;
  title: string;
  count: number;
};

type MatchQualityResponse = {
  success_version_title?: string;
  success_version_description?: string;
  distribution?: QualitySlice[];
};

export function MatchQuality() {
  const today = new Date();
  const thisYear = today.getFullYear();
  const currentMonth = today.getMonth(); // 0-11
  const monthToDatesMap: Record<string, [string, string]> = {
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

  const [selectedMonth, setSelectedMonth] = React.useState('all');
  const [startDate, endDate] = monthToDatesMap[selectedMonth];
  const { data } = useSWR<MatchQualityResponse>(
    `/api/matching/users/statistics/match_quality/?start_date=${startDate}&end_date=${endDate}`,
    cratePostFetcher({
      start_date: startDate,
      end_date: endDate,
    }),
  );

  if (!data) return <div>Loading...</div>;

  const chartData = (data.distribution ?? [])
    .filter(slice => slice.count > 0)
    .map(slice => ({
      tag: slice.title,
      count: slice.count,
      fill: SLICE_COLORS[slice.id] ?? GRAY_40,
    }));

  const chartConfig: Record<string, { label: string; color?: string }> = {
    count: {
      label: 'Count',
    },
  };
  chartData.forEach(dp => {
    chartConfig[dp.tag] = {
      label: dp.tag,
      color: dp.fill,
    };
  });

  const successBlurb = [data.success_version_title, data.success_version_description]
    .filter(Boolean)
    .join(' — ');

  return (
    <div>
      <PieChart
        extraHeader={
          <>
            <StyledDropdown
              value={selectedMonth}
              options={Object.keys(monthToDatesMap).map(val => ({
                value: val.toString(),
                label: val,
              }))}
              onValueChange={val => {
                setSelectedMonth(val);
              }}
              placeholder="Select a month..."
              cannotError
            />
          </>
        }
        label="Matches Created"
        title="Match Quality"
        description={
          successBlurb
            ? `Distribution of matches by the active success rule. ${successBlurb}`
            : 'Distribution of matches by the active success rule.'
        }
        chartData={chartData}
        chartConfig={chartConfig}
      />
    </div>
  );
}
