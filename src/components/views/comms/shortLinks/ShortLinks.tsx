import React from 'react';
import { useSearchParams } from 'react-router-dom';

import { Tabs, TabsContent, TabsList, TabsTrigger } from '../../../atoms/Tabs';
import LinkClicks from './ClickData';
import Links from './ManageShortLinks';

function ShortLinks() {
  const [searchParams, setSearchParams] = useSearchParams();
  const tab = searchParams.get('tab') || 'manage';

  const onTabChange = (value: string) => {
    searchParams.set('tab', value);
    if (value === 'clicks') {
      if (!searchParams.get('page_size')) {
        searchParams.set('page_size', '50');
      }
    } else {
      searchParams.delete('page');
    }
    setSearchParams(searchParams);
  };

  return (
    <div className="flex flex-col min-h-0 w-full relative">
      <Tabs value={tab} onValueChange={onTabChange}>
        <TabsList>
          <TabsTrigger value="manage">Manage</TabsTrigger>
          <TabsTrigger value="clicks">Clicks</TabsTrigger>
        </TabsList>
        {tab === 'manage' && (
          <TabsContent value="manage">
            <Links />
          </TabsContent>
        )}
        {tab === 'clicks' && (
          <TabsContent value="clicks">
            <LinkClicks />
          </TabsContent>
        )}
      </Tabs>
    </div>
  );
}

export default ShortLinks;
