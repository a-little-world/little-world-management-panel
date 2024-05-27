import React from 'react';
import UserDetailsCard from '../atoms/UserCard';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../atoms/Tabs';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '../atoms/Card';
import { Button } from '@a-little-world/little-world-design-system';
import useSWR from 'swr';
import { dataFetcher } from '../store';
import { useLocation, useParams } from 'react-router-dom';

const USER_TABS = [
  { key: 'profile', label: 'Profile' }, { key: 'chat', label: 'Chat' }, { key: 'emails', label: 'Emails' }, { key: 'matching', label: 'Matching' }, { key: 'tasks', label: 'Tasks' }, { key: 'actions', label: 'Actions' }
]

const UserPanelContent = ({ use, user }) => {
  console.log({ user })
  if (use === 'profile') return (
    <div className='flex flex-col'>
      <UserDetailsCard user={user} partial={false} />
    </div>
  )
  return null;
}

const UserPanel = () => {
  const { userId } = useParams();
  const { data: user, error, isLoading } = useSWR(`/api/admin/user_advanced/${userId}/?messages=include`, dataFetcher)
  if (isLoading && !error) return <div className='w-full p-3 text-center'>Loading</div>
  if (error) return <div className='w-full p-3 text-center'>Issue fetching this user. Please ensure the user id is correct</div>

    return (
          <Tabs defaultValue={USER_TABS[0].key} className="w-full flex-1 flex flex-col overflow-hidden">
          <TabsList className="grid w-full grid-cols-6">
            {USER_TABS.map(tab => (
              <TabsTrigger value={tab.key}>{tab.label}</TabsTrigger>
            ))}
          </TabsList>
          {USER_TABS.map(tab => (
            <TabsContent value={tab.key} className='py-1 px-2 flex-1 overflow-y-auto'>
              <Card>
                  <CardHeader>
                    <CardTitle>{tab.label}</CardTitle>
                    {tab.description && <CardDescription>
                      {tab.description}
                    </CardDescription>}
                  </CardHeader>
                  <CardContent className="space-y-2">
                    <UserPanelContent use={tab.key} user={user} />
                  </CardContent>
                  <CardFooter>
                  </CardFooter>
                </Card>
            </TabsContent>
          ))}
        </Tabs>
    )
}

export default UserPanel