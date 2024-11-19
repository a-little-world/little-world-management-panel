import React from 'react';
import { useSearchParams } from 'react-router-dom';

import { Tabs, TabsContent, TabsList, TabsTrigger } from '../atoms/Tabs';
import { BarChartTimeRanged } from '../blocks/stats/BarChartTimeRanged';
import { UserCountsBucketTable } from '../blocks/stats/JourneyBucketTable';
import { MatchUserJourneyOverview } from '../blocks/stats/MatchUserJourneyOverview';
import { RangedDataGraph } from '../blocks/stats/RangedDataGraph';

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
          </TabsContent>
        )}
      </Tabs>
    </div>
  );
}

export default Stats;
