import React from 'react';
import { useSearchParams } from 'react-router-dom';

import { Tabs, TabsContent, TabsList, TabsTrigger } from '../../atoms/Tabs';
import RandomCallHistory from './RandomCallHistory';
import RandomCallManagement from './RandomCallManagement';
import RandomCallSchedule from './RandomCallSchedule';

function RandomCalls() {
  const [searchParams, setSearchParams] = useSearchParams();
  const tab = searchParams.get('tab') || 'manage';

  const onTabChange = (value: string) => {
    searchParams.set('tab', value);
    setSearchParams(searchParams);
  };

  return (
    <div className="flex flex-col min-h-0 w-full relative">
      <Tabs value={tab} onValueChange={onTabChange}>
        <TabsList>
          <TabsTrigger value="manage">Manage</TabsTrigger>
          <TabsTrigger value="schedule">Schedule</TabsTrigger>
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
        {tab === 'history' && (
          <TabsContent value="history">
            <RandomCallHistory />
          </TabsContent>
        )}
      </Tabs>
    </div>
  );
}

export default RandomCalls;
