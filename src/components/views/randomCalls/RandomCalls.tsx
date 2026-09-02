import React from 'react';
import { useSearchParams } from 'react-router-dom';

import { Tabs, TabsContent, TabsList, TabsTrigger } from '../../atoms/Tabs';
import RandomCallAnalytics from './RandomCallAnalytics';
import RandomCallHistory from './RandomCallHistory';
import RandomCallManagement from './RandomCallManagement';
import RandomCallSchedule from './RandomCallSchedule';
import RandomCallTrends from './RandomCallTrends';

function RandomCalls() {
  const [searchParams, setSearchParams] = useSearchParams();
  const tab = searchParams.get('tab') || 'manage';

  const onTabChange = (value: string) => {
    searchParams.set('tab', value);
    setSearchParams(searchParams);
  };

  return (
    <Tabs value={tab} onValueChange={onTabChange}>
      <TabsList>
        <TabsTrigger value="manage">Manage</TabsTrigger>
        <TabsTrigger value="schedule">Schedule</TabsTrigger>
        <TabsTrigger value="analytics">Session Stats</TabsTrigger>
        <TabsTrigger value="trends">Trends</TabsTrigger>
        <TabsTrigger value="history">History</TabsTrigger>
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
    </Tabs>
  );
}

export default RandomCalls;
