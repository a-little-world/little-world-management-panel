import React from 'react';
import { useSearchParams } from 'react-router-dom';
import { cratePostFetcher } from '../store';
import { Dropdown } from '@a-little-world/little-world-design-system';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../atoms/Tabs';
import { BarChartTimeRanged } from '../blocks/stats/BarChartTimeRanged';
import { UserCountsBucketTable } from '../blocks/stats/JourneyBucketTable';
import { MatchUserJourneyOverview } from '../blocks/stats/MatchUserJourneyOverview';
import { UserJourneyBucketsOverview } from '../blocks/stats/UserJourneyBuckets';
import { RangedDataGraph } from '../blocks/stats/RangedDataGraph';
import { BarChartCounts } from '../blocks/BarChartCounts';
import { Sections, Container, Section, SectionR } from '../blocks/stats/MatchUserJourneyOverview';
import useSWR from 'swr';
import { MatchJourneyOverview } from '../blocks/stats/MatchJourneyBuckets';
import { matchJourneyBucketsV4 } from '../blocks/stats/buckets';
import styled from 'styled-components';


const StyledDropdown = styled(Dropdown)`
  div[data-radix-popper-content-wrapper] {
    z-index: 20 !important;
  }
  width: 100%;
`;

function MatchQualityChartMelina(){
  
  const today = new Date();
  const thisYear = today.getFullYear();
  const monthToDatesMap = {
    "all": ["2021-01-01", today.toISOString().split('T')[0]],
    "january": [`${thisYear}-01-01`, `${thisYear}-01-31`],
    "february": [`${thisYear}-02-01`, `${thisYear}-02-28`],
    "march": [`${thisYear}-03-01`, `${thisYear}-03-31`],
    "april": [`${thisYear}-04-01`, `${thisYear}-04-30`],
    "may": [`${thisYear}-05-01`, `${thisYear}-05-31`],
    "june": [`${thisYear}-06-01`, `${thisYear}-06-30`],
    "july": [`${thisYear}-07-01`, `${thisYear}-07-31`],
    "august": [`${thisYear}-08-01`, `${thisYear}-08-31`],
    "september": [`${thisYear}-09-01`, `${thisYear}-09-30`],
    "october": [`${thisYear}-10-01`, `${thisYear}-10-31`],
    "november": [`${thisYear}-11-01`, `${thisYear}-11-30`],
    "december": [`${thisYear}-12-01`, `${thisYear}-12-31`],
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
                    options={["all", "january", "february", "march", "april", "may", "june", "july", "august", "september", "october", "november", "december"].map(val => ({
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

function DebugMatches(){
  const random = React.useRef(Date.now() + Math.random());
  const { mutate, error, data, isLoading } = useSWR(
    '/api/matching/users/statistics/match_journey_buckets/?random=' + random.current,
    cratePostFetcher({
      selected_filters: [
        "match_journey_v2__match_free_play",
        "match_journey_v2__completed_match"
      ]
    }),
    {},
  );

  if (isLoading) return <div>Loading...</div>;
  if (!data) return <div>Error: {error}</div>;

  return <>Test Matches</>
}

function DebugTab(){

  const random = React.useRef(Date.now() + Math.random());
  const { mutate, error, data, isLoading } = useSWR(
    '/api/matching/users/statistics/user_journey_buckets/?random=' + random.current,
    cratePostFetcher({
      selected_filters: ["journey_v2__happy_inactive"]
    }),
    {},
  );

  if (isLoading) return <div>Loading...</div>;
  if (!data) return <div>Error: {error}</div>;

  return <>Test</>
}

function Stats() {
  let [searchParams, setSearchParams] = useSearchParams();
  const tab = searchParams.get('tab') || 'overview';

  const onTabChange = (value: string) => {
    searchParams.set('tab', value);
    setSearchParams(searchParams);
  };

  return (
    <div className="flex flex-col min-h-0 w-full relative">
      <Tabs value={tab} onValueChange={onTabChange}>
        <TabsList>
          <TabsTrigger value="overview">User & Match Journey</TabsTrigger>
          <TabsTrigger value="graphs">Graphs</TabsTrigger>
          <TabsTrigger value="signup-funnel">User Sign-up Funnel</TabsTrigger>
          <TabsTrigger value="simple-journey">Basic Buckets</TabsTrigger>
        </TabsList>
        {tab === 'overview' && (
          <TabsContent value="overview" className="">
            <MatchUserJourneyOverview />
          </TabsContent>
        )}
        {tab === 'graphs' && (
          <TabsContent
            value="graphs"
            className="flex flex-col content-center justify-center items-center flex-grow"
          >
            <RangedDataGraph />
          </TabsContent>
        )}
        {tab === 'signup-funnel' && (
          <TabsContent
            value="signup-funnel"
            className="flex flex-col content-center justify-center items-center flex-grow"
          >
            <BarChartTimeRanged />
            <MatchQualityChartMelina />
          </TabsContent>
        )}
        {tab === 'simple-journey' && (
          <TabsContent
            value="simple-journey"
            className=""
          >
            <Container>
            <Sections>
              
            <SectionR $fullWidth>
              <UserJourneyBucketsOverview />
            </SectionR>
            <SectionR $fullWidth>
              <MatchJourneyOverview />
            </SectionR>
            </Sections>
            </Container>
          </TabsContent>
        )}
      </Tabs>
    </div>
  );
}

export default Stats;
