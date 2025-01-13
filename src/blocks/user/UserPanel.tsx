import {
  Button,
  ButtonSizes,
  ButtonVariations,
  PlusIcon,
} from '@a-little-world/little-world-design-system';
import React, { useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useSearchParams } from 'react-router-dom';
import { useTheme } from 'styled-components';
import useSWR from 'swr';

import {
  Section,
  SectionContent,
  SectionDescription,
  SectionHeader,
  SectionTitle,
} from '../../atoms/Section';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../../atoms/Tabs';
import { MATCHING_ROUTE } from '../../routes';
import { dataFetcher, useGlobalState } from '../../store';
import { SelectedUsersSheet } from '../SelectedUsersSheet';
import UserActions from './UserActions';
import UserDetailsCard from './UserCard';
import UserChat from './UserChat';
import UserEmails from './UserEmails';
import UserMatches from './UserMatches';
import UserNotes from './UserNotes';

const USER_TABS = [
  { key: 'profile', label: 'Profile' },
  { key: 'chat', label: 'Chat', title: 'User Support Chat' },
  { key: 'emails', label: 'Emails' },
  { key: 'matches', label: 'Matches' },
  { key: 'notes', label: 'Notes' },
  { key: 'actions', label: 'Actions' },
];

const UserPanelContent = ({
  tab,
  user,
  onUpdate,
}: {
  tab: string;
  user: any;
  onUpdate: () => void;
}) => {
  if (tab === 'profile') return <UserDetailsCard user={user} partial={false} />;

  if (tab === 'chat') return <UserChat user={user} />;

  if (tab === 'emails') return <UserEmails user={user} />;

  if (tab === 'matches') return <UserMatches user={user} />;

  if (tab === 'notes')
    return (
      <UserNotes notes={user?.state?.notes} model="user" modelId={user.id} />
    );

  if (tab === 'actions') return <UserActions user={user} onUpdate={onUpdate} />;
  return null;
};

const UserPanel = () => {
  const { userId } = useParams();
  const { addUserToMatching, setUpdateCurrentUser } = useGlobalState();
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

  useEffect(() => {
    setUpdateCurrentUser(() => mutate);
  }, [userId, mutate]);

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
            key={'header' + tab.key}
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
        <TabsContent key={'content' + tab.key} value={tab.key}>
          <Section fullHeight={tab.key === 'chat'}>
            <SectionHeader>
              <div>
                <SectionTitle>{`${
                  user.profile.first_name + ' ' + user.profile.second_name
                } - ${tab.title ?? tab.label}`}</SectionTitle>
                {tab.description && (
                  <SectionDescription>{tab.description}</SectionDescription>
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
            </SectionHeader>
            <SectionContent>
              <UserPanelContent tab={tab.key} user={user} onUpdate={mutate} />
            </SectionContent>
          </Section>
        </TabsContent>
      ))}
      {searchParams.get('tab') !== USER_TABS[1].key && <SelectedUsersSheet />}
    </Tabs>
  );
};

export default UserPanel;
