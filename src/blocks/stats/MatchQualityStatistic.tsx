import { Dropdown } from '@a-little-world/little-world-design-system';
import {
    BarChartCounts
} from "../BarChartCounts"

import { DatePicker } from '../../atoms/DatePicker';
import { matchJourneyBucketsV4 } from './buckets';

import React from 'react';
import useSWR from 'swr';

import LoadingSpinner from '../../atoms/LoadingSpinner';
import { cratePostFetcher } from '../../store';
import styled from 'styled-components';

const StyledDropdown = styled(Dropdown)`
  div[data-radix-popper-content-wrapper] {
    z-index: 20 !important;
  }
  width: 100%;
`;



export function MatchQuality(){
  
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

  const [startDate, setStartDate] = React.useState('2021-01-01');
  const [endDate, setEndDate] = React.useState(
      today.toISOString().split('T')[0],
  );
  const allBuckets = matchJourneyBucketsV4.flatMap(bucket => bucket.sub_buckets);
  const random = React.useRef(Date.now() + Math.random());
  const excludeBuckets = ["match_journey_v2__proposed_matches", "match_journey_v2__expired_proposals"]
  const { data, mutate } = useSWR(
    '/api/matching/users/statistics/match_journey_buckets/' + "?random=" + random.current,
    cratePostFetcher({
      selected_filters: allBuckets.filter(bucket => !excludeBuckets.includes(bucket.id)).map(bucket => bucket.id),
      start_date: startDate,
      end_date: endDate,
    }),
    {},
  );
  
  if (!data) return <div>Loading...</div>;

  const categorieTotalCounts = {};
  var totalCount = 0;
  for (let bucket of matchJourneyBucketsV4) {
    let bucketTotalCount = 0;
    for(let sub_bucket of bucket.sub_buckets) {
      const count = data?.buckets?.find(
        item => item.name === sub_bucket.id,
      )?.count;
      if(count && !excludeBuckets.includes(sub_bucket.id)){
        bucketTotalCount += count;
        totalCount += count;
      }
    }
    categorieTotalCounts[bucket.id] = bucketTotalCount;
  }
  
  categorieTotalCounts["ongoing_plus_finished"] = categorieTotalCounts["finished-matching"] + categorieTotalCounts["ongoing-matching"];

  
  let chartData = [
    //{ tag: 'ongoing_plus_finished', count: categorieTotalCounts["ongoing_plus_finished"], fill: '#3498db' },
    { tag: 'ongoing-matching', count: categorieTotalCounts["ongoing-matching"], fill: '#3498db' },
    { tag: 'finished-matching', count: categorieTotalCounts["finished-matching"], fill: '#2ecc71' },
    { tag: 'failed-matching', count: categorieTotalCounts["failed-matching"], fill: '#e74c3c' },
    { tag: 'pre-matching', count: categorieTotalCounts["pre-matching"], fill: '#f1c40f' }
  ]

    let chartConfig = {
        count: {
            label: 'Count'
        },
    }

    chartData.forEach((dp, i) => {
        chartConfig[dp.tag] = {
            label: dp.tag,
            color: dp.fill
        }
    })

    return <div>
        <BarChartCounts
            useSubtitles={true}
            extraHeader={<>
                  <StyledDropdown
                    value={"all"}
                    options={Object.keys(monthToDatesMap).map(val => ({
                      value: val.toString(),
                      label: val
                    }))}
                    onValueChange={val => {
                      setStartDate(monthToDatesMap[val][0]);
                      setEndDate(monthToDatesMap[val][1]);
                      setTimeout(() => {
                        mutate();
                      }, 500);
                    }}
                    placeholder="Select a user list..."
                    cannotError
                  />
              </>}
            label="Matches Created"
            title={"Match Live Cicle"}
            description="Shows the distribution of our matches in different matching stages."
            chartData={chartData}
            chartConfig={chartConfig}
            subtitle1={"sub1"}
            subtitle2={"sub2"}
        /></div>;
}
