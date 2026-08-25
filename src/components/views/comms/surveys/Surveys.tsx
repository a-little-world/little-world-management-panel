import React from 'react';
import { useSearchParams } from 'react-router-dom';

import { Tabs, TabsContent, TabsList, TabsTrigger } from '../../../atoms/Tabs';
import SurveyCampaigns from './SurveyCampaigns';
import SurveyResponses from './SurveyResponses';

function Surveys() {
  const [searchParams, setSearchParams] = useSearchParams();
  const tab =
    searchParams.get('tab') === 'responses' ? 'responses' : 'campaigns';

  const onTabChange = (value: string) => {
    searchParams.set('tab', value);
    if (value === 'responses') {
      if (!searchParams.get('page_size')) {
        searchParams.set('page_size', '50');
      }
    } else {
      searchParams.delete('page');
    }
    setSearchParams(searchParams);
  };

  return (
    <Tabs value={tab} onValueChange={onTabChange}>
      <TabsList>
        <TabsTrigger value="campaigns">Campaigns</TabsTrigger>
        <TabsTrigger value="responses">Responses</TabsTrigger>
      </TabsList>
      {tab === 'campaigns' && (
        <TabsContent value="campaigns">
          <SurveyCampaigns />
        </TabsContent>
      )}
      {tab === 'responses' && (
        <TabsContent value="responses">
          <SurveyResponses />
        </TabsContent>
      )}
    </Tabs>
  );
}

export default Surveys;
