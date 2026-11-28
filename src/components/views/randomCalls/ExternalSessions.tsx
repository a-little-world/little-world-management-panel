import React from 'react';
import { useSearchParams } from 'react-router-dom';

import { Tabs, TabsContent, TabsList, TabsTrigger } from '../../atoms/Tabs';
import ExternalSessionActive from './ExternalSessionActive';
import ExternalSessionRegistrations from './ExternalSessionRegistrations';
import ExternalSessionSchedule from './ExternalSessionSchedule';

function ExternalSessions() {
  const [searchParams, setSearchParams] = useSearchParams();
  const section =
    searchParams.get('tab') === 'create-session'
      ? 'scheduled'
      : searchParams.get('section') || 'registrations';

  const onSectionChange = (value: string) => {
    const nextParams = new URLSearchParams(searchParams);
    nextParams.set('tab', 'external');
    nextParams.set('section', value);
    if (value !== 'registrations') {
      nextParams.delete('appointment_starts_at');
    }
    if (value !== 'active') {
      nextParams.delete('session');
    }
    setSearchParams(nextParams);
  };

  return (
    <Tabs value={section} onValueChange={onSectionChange}>
      <TabsList>
        <TabsTrigger value="active">Active</TabsTrigger>
        <TabsTrigger value="registrations">Registrations</TabsTrigger>
        <TabsTrigger value="scheduled">Scheduled</TabsTrigger>
      </TabsList>
      {section === 'active' && (
        <TabsContent value="active">
          <ExternalSessionActive />
        </TabsContent>
      )}
      {section === 'registrations' && (
        <TabsContent value="registrations">
          <ExternalSessionRegistrations />
        </TabsContent>
      )}
      {section === 'scheduled' && (
        <TabsContent value="scheduled">
          <ExternalSessionSchedule />
        </TabsContent>
      )}
    </Tabs>
  );
}

export default ExternalSessions;
