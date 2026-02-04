import React from 'react';
import { useSearchParams } from 'react-router-dom';

import { modifyDataToPercentages } from '../../helpers/stats';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../atoms/Tabs';
import AvailabilityOverview from '../blocks/stats/AvailabilityOverview';
import {
  BarChartTimeRanged,
  SignupFunnelEvolution,
} from '../blocks/stats/BarChartTimeRanged';
import KPIsDashboard from '../blocks/stats/KPIsDashboard';
import { MatchJourneyOverview } from '../blocks/stats/MatchJourneyBuckets';
import { MatchQuality } from '../blocks/stats/MatchQualityStatistic';
import {
  Container,
  MatchUserJourneyOverview,
  SectionR,
  Sections,
} from '../blocks/stats/MatchUserJourneyOverview';
import { RangedDataGraph } from '../blocks/stats/RangedDataGraph';
import { UserJourneyBucketsOverview } from '../blocks/stats/UserJourneyBuckets';
import ReportsDashboard from '../blocks/stats/reports/ReportsDashboard';

function Stats() {
  let [searchParams, setSearchParams] = useSearchParams();
  const tab = searchParams.get('tab') || 'kpis';

  const onTabChange = (value: string) => {
    searchParams.set('tab', value);
    setSearchParams(searchParams);
  };

  return (
    <div className="flex flex-col min-h-0 w-full relative">
      <Tabs value={tab} onValueChange={onTabChange}>
        <TabsList>
          <TabsTrigger value="kpis">KPIs</TabsTrigger>
          <TabsTrigger value="overview">User & Match Journey</TabsTrigger>
          <TabsTrigger value="graphs">Graphs</TabsTrigger>
          <TabsTrigger value="signup-funnel">User Sign-up Funnel</TabsTrigger>
          <TabsTrigger value="simple-journey">Basic Buckets</TabsTrigger>
          <TabsTrigger value="signup-funnel-evolution">
            User Sign-up Funnel Evolution
          </TabsTrigger>
          <TabsTrigger value="reports">Reports</TabsTrigger>
          <TabsTrigger value="availability">Availability</TabsTrigger>
        </TabsList>
        {tab === 'kpis' && (
          <TabsContent value="kpis">
            <KPIsDashboard />
          </TabsContent>
        )}
        {tab === 'overview' && (
          <TabsContent value="overview">
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
        {tab === 'signup-funnel-evolution' && (
          <TabsContent
            value="signup-funnel-evolution"
            className="flex flex-col content-center justify-center items-center flex-grow"
          >
            <SignupFunnelEvolution />
            <SignupFunnelEvolution dataModFunc={modifyDataToPercentages} />
            <BarChartTimeRanged
              displayExactTimeSelection={true}
              displayTimeSelection={false}
            />
          </TabsContent>
        )}
        {tab === 'simple-journey' && (
          <TabsContent value="simple-journey">
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
        {tab === 'reports' && (
          <TabsContent value="reports">
            <ReportsDashboard />
          </TabsContent>
        )}
        {tab === 'availability' && (
          <TabsContent value="availability">
            <AvailabilityOverview />
          </TabsContent>
        )}
      </Tabs>
    </div>
  );
}

export default Stats;
