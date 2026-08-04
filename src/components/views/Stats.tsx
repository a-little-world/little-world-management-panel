import React from 'react';
import { useSearchParams } from 'react-router-dom';

import { Tabs, TabsContent, TabsList, TabsTrigger } from '../atoms/Tabs';
import UserPreferencesOverview from '../blocks/stats/UserPreferencesOverview';
import Highlights from '../blocks/stats/Highlights';
import KPIsDashboard from '../blocks/stats/KPIsDashboard';
import MatchesStats from '../blocks/stats/MatchesStats';
import { MatchUserJourneyOverview } from '../blocks/stats/MatchUserJourneyOverview';
import ProposalStats from '../blocks/stats/ProposalStats';
import { RangedDataGraph } from '../blocks/stats/RangedDataGraph';
import ReportsDashboard from '../blocks/stats/reports/ReportsDashboard';

function Stats() {
  let [searchParams, setSearchParams] = useSearchParams();
  const rawTab = searchParams.get('tab') || 'kpis';
  const tab = rawTab === 'availability' ? 'user_preferences' : rawTab;

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
        <TabsTrigger value="overview">User & Match Journey</TabsTrigger>
        <TabsTrigger value="graphs">Graphs</TabsTrigger>
        <TabsTrigger value="reports">Reports</TabsTrigger>
        <TabsTrigger value="user_preferences">User Preferences</TabsTrigger>
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
      {tab === 'user_preferences' && (
        <TabsContent value="user_preferences">
          <UserPreferencesOverview />
        </TabsContent>
      )}
    </Tabs>
  );
}

export default Stats;
