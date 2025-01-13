import React from 'react';
import { useSearchParams } from 'react-router-dom';
import { cratePostFetcher } from '../store';
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
import { MatchQuality } from '../blocks/stats/MatchQualityStatistic';


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
            <MatchQuality />
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
