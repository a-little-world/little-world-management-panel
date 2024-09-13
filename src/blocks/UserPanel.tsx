import {
  Button,
  ButtonSizes,
  ButtonVariations,
  PlusIcon,
} from '@a-little-world/little-world-design-system';
import React from 'react';
import { useLocation, useNavigate, useParams } from 'react-router-dom';
import { useSearchParams } from 'react-router-dom';
import { useTheme } from 'styled-components';
import useSWR from 'swr';

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '../atoms/Card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../atoms/Tabs';
import { MATCHING_ROUTE } from '../routes';
import { dataFetcher, useGlobalState } from '../store';
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
  user,
  onUpdate,
}: {
  preMatchingAppointment: string;
  tab: string;
  user: any;
  onUpdate: () => void;
}) => {
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

  if (tab === 'actions') return <UserActions user={user} onUpdate={onUpdate} />;
  return null;
};

const UserPanel = () => {
  const { userId } = useParams();
  const { addUserToMatching } = useGlobalState();
  const theme = useTheme();
  let [searchParams, setSearchParams] = useSearchParams();

  const navigate = useNavigate();

  const {
    data: user,
    error,
    isLoading,
    mutate,
  } = useSWR(`/api/matching/users/${userId}/?messages=include`, dataFetcher);

  const onAddToMatching = () => {
    addUserToMatching(user);
    navigate(MATCHING_ROUTE);
  };

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
    <Tabs defaultValue={searchParams.get('tab') ?? USER_TABS[0].key}>
      <TabsList className="grid w-full grid-cols-6">
        {USER_TABS.map(tab => (
          <TabsTrigger
            value={tab.key}
            onClick={() => {
              setSearchParams({ tab: tab.key });
            }}
          >
            {tab.label}
          </TabsTrigger>
        ))}
      </TabsList>
      {USER_TABS.map(tab => (
        <TabsContent value={tab.key}>
          <Card
            className={`border-none shadow-none flex flex-col w-full ${
              tab.key === 'chat' ? 'h-full' : ''
            }`}
          >
            <CardHeader className="flex-row items-center justify-between px-6 py-4 gap-4">
              <div>
                <CardTitle>{`${
                  user.profile.first_name + ' ' + user.profile.second_name
                } - ${tab.title ?? tab.label}`}</CardTitle>
                {tab.description && (
                  <CardDescription>{tab.description}</CardDescription>
                )}
              </div>
              <Button
                backgroundColor={theme.color.gradient.blue10}
                size={ButtonSizes.Medium}
                variation={ButtonVariations.Circle}
                onClick={onAddToMatching}
                style={{ flexGrow: 0 }}
              >
                <PlusIcon
                  color={theme.color.surface.primary}
                  label="select user"
                  labelId="selectUser"
                  width={16}
                  height={16}
                />
              </Button>
            </CardHeader>
            <CardContent className="px-6 py-4 flex flex-col min-h-0 h-full w-full">
              <UserPanelContent
                tab={tab.key}
                user={user}
                preMatchingAppointment={preMatchingAppointment?.start_time}
                onUpdate={mutate}
              />
            </CardContent>
          </Card>
        </TabsContent>
      ))}
      {searchParams.get('tab') !== USER_TABS[1].key && <SelectedUsersSheet />}
    </Tabs>
  );
};

export default UserPanel;
