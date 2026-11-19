import React from 'react';
import { useSearchParams } from 'react-router-dom';

import { Tabs, TabsContent, TabsList, TabsTrigger } from '../../atoms/Tabs';
import ExternalSessions from './ExternalSessions';
import RandomCallAnalytics from './RandomCallAnalytics';
import RandomCallHistory from './RandomCallHistory';
import RandomCallManagement from './RandomCallManagement';
import RandomCallSchedule from './RandomCallSchedule';
import RandomCallTrends from './RandomCallTrends';

const EXTERNAL_TAB_ALIASES = new Set(['external', 'registrations', 'create-session']);

function RandomCalls() {
  const [searchParams, setSearchParams] = useSearchParams();
  const rawTab = searchParams.get('tab') || 'manage';
  const tab = EXTERNAL_TAB_ALIASES.has(rawTab) ? 'external' : rawTab;

  const onTabChange = (value: string) => {
    const nextParams = new URLSearchParams(searchParams);
    nextParams.set('tab', value);
    if (value === 'external') {
      if (!nextParams.get('section')) {
        nextParams.set('section', 'registrations');
      }
    } else {
      nextParams.delete('section');
      nextParams.delete('appointment_starts_at');
    }
    setSearchParams(nextParams);
  };

  return (
    <Tabs value={tab} onValueChange={onTabChange}>
      <TabsList>
        <TabsTrigger value="manage">Manage</TabsTrigger>
        <TabsTrigger value="schedule">Schedule</TabsTrigger>
        <TabsTrigger value="analytics">Session Stats</TabsTrigger>
        <TabsTrigger value="trends">Trends</TabsTrigger>
        <TabsTrigger value="history">History</TabsTrigger>
        <TabsTrigger value="external">External Sessions</TabsTrigger>
      </TabsList>
      {tab === 'manage' && (
        <TabsContent value="manage">
          <RandomCallManagement />
        </TabsContent>
      )}
      {tab === 'schedule' && (
        <TabsContent value="schedule">
          <RandomCallSchedule />
        </TabsContent>
      )}
      {tab === 'analytics' && (
        <TabsContent value="analytics">
          <RandomCallAnalytics />
        </TabsContent>
      )}
      {tab === 'trends' && (
        <TabsContent value="trends">
          <RandomCallTrends />
        </TabsContent>
      )}
      {tab === 'history' && (
        <TabsContent value="history">
          <RandomCallHistory />
        </TabsContent>
      )}
      {tab === 'external' && (
        <TabsContent value="external">
          <ExternalSessions />
        </TabsContent>
      )}
    </Tabs>
  );
}

export default RandomCalls;
