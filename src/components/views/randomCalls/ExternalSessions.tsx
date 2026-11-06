import React from 'react';
import { useSearchParams } from 'react-router-dom';

import { Tabs, TabsContent, TabsList, TabsTrigger } from '../../atoms/Tabs';
import ExternalSessionSchedule from './ExternalSessionSchedule';
import SpecialEventRegistrations from './SpecialEventRegistrations';

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
    setSearchParams(nextParams);
  };

  return (
    <Tabs value={section} onValueChange={onSectionChange}>
      <TabsList>
        <TabsTrigger value="registrations">Registrations</TabsTrigger>
        <TabsTrigger value="scheduled">Scheduled</TabsTrigger>
      </TabsList>
      {section === 'registrations' && (
        <TabsContent value="registrations">
          <SpecialEventRegistrations />
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
