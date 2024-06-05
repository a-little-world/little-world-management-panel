import React from 'react';
import { useLocation, useParams } from 'react-router-dom';
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
  // { key: 'tasks', label: 'Tasks' },
  { key: 'actions', label: 'Actions' },
];

const UserPanelContent = ({ preMatchingAppointment, use, user }) => {
  if (use === 'profile') return <UserDetailsCard user={user} partial={false} />;

  if (use === 'chat') return <UserChat user={user} />;

  if (use === 'emails') return <UserEmails user={user} />;

  if (use === 'matches')
    return (
      <UserMatches
        user={user}
        preMatchingAppointment={preMatchingAppointment}
      />
    );

  if (use === 'actions') return <UserActions user={user} />;
  return null;
};

const UserPanel = () => {
  const { userId } = useParams();
  const { state } = useLocation();
  const {
    data: user,
    error,
    isLoading,
  } = useSWR(
    `/api/admin/user_advanced/${userId}/?messages=include`,
    dataFetcher,
  );

  const { data: preMatchingAppointment } = useSWR(
    `/api/admin/user_advanced/${userId}/prematching_appointments/`,
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
          <TabsTrigger value={tab.key}>{tab.label}</TabsTrigger>
        ))}
      </TabsList>
      {USER_TABS.map(tab => (
        <TabsContent
          value={tab.key}
          className="py-1 px-2 flex-1 overflow-y-auto"
        >
          <Card>
            <CardHeader>
              <CardTitle>{`${
                user.profile.first_name + user.profile.second_name
              } - ${tab.title ?? tab.label}`}</CardTitle>
              {tab.description && (
                <CardDescription>{tab.description}</CardDescription>
              )}
            </CardHeader>
            <CardContent className="space-y-2 flex flex-col">
              <UserPanelContent
                use={tab.key}
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
