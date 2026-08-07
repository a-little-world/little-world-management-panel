import React from 'react';
import { useSearchParams } from 'react-router-dom';

import { Tabs, TabsContent, TabsList, TabsTrigger } from '../atoms/Tabs';
import AvailabilityOverview from '../blocks/stats/AvailabilityOverview';
import Highlights from '../blocks/stats/Highlights';
import KPIsDashboard from '../blocks/stats/KPIsDashboard';
import MatchesStats from '../blocks/stats/MatchesStats';
import { MatchJourneyOverview } from '../blocks/stats/MatchJourneyOverview';
import ProposalStats from '../blocks/stats/ProposalStats';
import { RangedDataGraph } from '../blocks/stats/RangedDataGraph';
import ReportsDashboard from '../blocks/stats/reports/ReportsDashboard';
import { UserJourneyOverview } from '../blocks/stats/UserJourneyOverview';

function Stats() {
  let [searchParams, setSearchParams] = useSearchParams();
  const tab = searchParams.get('tab') || 'kpis';

  const onTabChange = (value: string) => {
    searchParams.set('tab', value);
    setSearchParams(searchParams);
  };

  return (
    <Tabs value={tab} onValueChange={onTabChange}>
      <TabsList>
        <TabsTrigger value="kpis">KPIs</TabsTrigger>
        <TabsTrigger value="highlights">Highlights</TabsTrigger>
        <TabsTrigger value="matches">Matches</TabsTrigger>
        <TabsTrigger value="proposals">Proposals</TabsTrigger>
        <TabsTrigger value="user-journey">User Journey</TabsTrigger>
        <TabsTrigger value="match-journey">Match Journey</TabsTrigger>
        <TabsTrigger value="graphs">Graphs</TabsTrigger>
        <TabsTrigger value="reports">Reports</TabsTrigger>
        <TabsTrigger value="availability">Availability</TabsTrigger>
      </TabsList>
      {tab === 'kpis' && (
        <TabsContent value="kpis">
          <KPIsDashboard />
        </TabsContent>
      )}
      {tab === 'user-journey' && (
        <TabsContent value="user-journey">
          <UserJourneyOverview />
        </TabsContent>
      )}
      {tab === 'match-journey' && (
        <TabsContent value="match-journey">
          <MatchJourneyOverview />
        </TabsContent>
      )}
      {tab === 'highlights' && (
        <TabsContent value="highlights">
          <Highlights />
        </TabsContent>
      )}
      {tab === 'matches' && (
        <TabsContent value="matches">
          <MatchesStats />
        </TabsContent>
      )}
      {tab === 'proposals' && (
        <TabsContent value="proposals">
          <ProposalStats />
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
  );
}

export default Stats;
