import React from 'react';
import { useLocation, useParams } from 'react-router-dom';
import { useSearchParams } from 'react-router-dom';
import useSWR from 'swr';

import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '../atoms/Card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../atoms/Tabs';
import { dataFetcher } from '../store';
import { SelectedUsersSheet } from './SelectedUsersSheet';
import UserActions from './UserActions';
import UserDetailsCard from './UserCard';
import UserChat from './UserChat';
import UserEmails from './UserEmails';
import UserMatches from './UserMatches';

const USER_TABS = [
  { key: 'profile', label: 'Profile' },
  { key: 'chat', label: 'Chat', title: 'User Support Chat' },
  { key: 'emails', label: 'Emails' },
  { key: 'matches', label: 'Matches' },
  // { key: 'notes', label: 'Notes' },
  { key: 'actions', label: 'Actions' },
];

const UserPanelContent = ({
  preMatchingAppointment,
  tab,
  user }) => {
  if (tab === 'profile') return <UserDetailsCard user={user} partial={false} />;

  if (tab === 'chat') return <UserChat user={user} />;

  if (tab === 'emails') return <UserEmails user={user} />;

  if (tab === 'matches')
    return (
      <UserMatches
        user={user}
        preMatchingAppointment={preMatchingAppointment}
      />
    );

  if (tab === 'actions') return <UserActions user={user} />;
  return null;
};

const UserPanel = () => {
  const { userId } = useParams();
  const { state } = useLocation();
  let [searchParams, setSearchParams] = useSearchParams();
  const tab = searchParams.get('tab') || 'profile';

  const {
    data: user,
    error,
    isLoading,
  } = useSWR(
    `/api/matching/users/${userId}/?messages=include`,
    dataFetcher,
  );

  const { data: preMatchingAppointment } = useSWR(
    `/api/matching/users/${userId}/prematching_appointments/`,
    dataFetcher,
  );
  if (isLoading && !error)
    return <div className="w-full p-3 text-center">Loading</div>;
  if (error)
    return (
      <div className="w-full p-3 text-center">
        Issue fetching this user. Please ensure the user id is correct
      </div>
    );

  return (
    <Tabs
      defaultValue={state?.openTab ?? USER_TABS[0].key}
      className="w-full flex-1 flex flex-col overflow-hidden"
    >
      <TabsList className="grid w-full grid-cols-6">
        {USER_TABS.map(tab => (
          <TabsTrigger value={tab.key} onClick={() => {
            setSearchParams({ tab: tab.key });
          }}>{tab.label}</TabsTrigger>
        ))}
      </TabsList>
      {USER_TABS.map(tab => (
        <TabsContent
          value={tab.key}
          className="py-1 px-2 flex-1 overflow-y-auto"
        >
          <Card className={'border-none shadow-none'}>
            <CardHeader>
              <CardTitle>{`${user.profile.first_name + user.profile.second_name
                } - ${tab.title ?? tab.label}`}</CardTitle>
              {tab.description && (
                <CardDescription>{tab.description}</CardDescription>
              )}
            </CardHeader>
            <CardContent className="space-y-2 flex flex-col">
              <UserPanelContent
                tab={tab.key}
                user={user}
                preMatchingAppointment={preMatchingAppointment?.start_time}
              />
            </CardContent>
            <CardFooter></CardFooter>
          </Card>
        </TabsContent>
      ))}
      <SelectedUsersSheet />
    </Tabs>
  );
};

export default UserPanel;
