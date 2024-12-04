import React from 'react';
import { useSearchParams } from 'react-router-dom';
import { cratePostFetcher } from '../store';


import { Tabs, TabsContent, TabsList, TabsTrigger } from '../atoms/Tabs';
import { BarChartTimeRanged } from '../blocks/stats/BarChartTimeRanged';
import { UserCountsBucketTable } from '../blocks/stats/JourneyBucketTable';
import { MatchUserJourneyOverview, SimplifiedUserJourneyOverview, SimplifiedMatchJourneyOverview } from '../blocks/stats/MatchUserJourneyOverview';
import { RangedDataGraph } from '../blocks/stats/RangedDataGraph';
import { BarChartCounts } from '../blocks/BarChartCounts';
import { Sections, Container, Section, SectionR } from '../blocks/stats/MatchUserJourneyOverview';
import useSWR from 'swr';

function MatchQualityChartMelina(){
  
  let chartData = [
    { tag: 'became_active', count: 10, fill: '#2ecc71' },
    { tag: 'became_activ2', count: 10, fill: '#2ecc71' }
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
            extraHeader={<></>}
            title={"Matching Quality"}
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
          <TabsTrigger value="charts">Charts</TabsTrigger>
          <TabsTrigger value="simple-journey">Simple</TabsTrigger>
          <TabsTrigger value="debug">Debug</TabsTrigger>
          <TabsTrigger value="debugMatches">Debug Matches</TabsTrigger>
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
        {tab === 'charts' && (
          <TabsContent
            value="charts"
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
              <SimplifiedUserJourneyOverview />
            </SectionR>
            <SectionR $fullWidth>
              <SimplifiedMatchJourneyOverview />
            </SectionR>
            </Sections>
            </Container>
          </TabsContent>
        )}
        {tab === "debug" && (
          <TabsContent
            value="debug"
            className="flex flex-col content-center justify-center items-center flex-grow"
          >
            <DebugTab/>
          </TabsContent>
        )}
        {tab === "debugMatches" && (
          <TabsContent
            value="debugMatches"
            className="flex flex-col content-center justify-center items-center flex-grow"
          >
            <DebugMatches/>
          </TabsContent>
        )}
      </Tabs>
    </div>
  );
}

export default Stats;
