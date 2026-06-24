import {
  Button,
  ButtonAppearance,
  ButtonSizes,
  PlusIcon,
} from '@a-little-world/little-world-design-system';
import React, { useEffect, useState } from 'react';
import { useNavigate, useParams, useSearchParams } from 'react-router-dom';
import styled, { useTheme } from 'styled-components';
import useSWR from 'swr';

import { MATCHING_ROUTE } from '../../../router/routes';
import { fetchSupportTasks } from '../../../api/supportTasks';
import { dataFetcher, useGlobalState } from '../../../store';
import { Section, SectionContent } from '../../atoms/Section';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../../atoms/Tabs';
import { usePageHeader } from '../LayoutHeaderContext';
import { SelectedUsersSheet } from '../SelectedUsersSheet';
import UserActions from './UserActions';
import UserCalls from './UserCalls';
import UserDetailsCard from './UserCard';
import UserChat from './UserChat';
import UserEmails from './UserEmails';
import UserMatches from './UserMatches';
import UserNotes from './UserNotes';
import UserStats from './UserStats';

const USER_TABS = [
  { key: 'profile', label: 'Profile' },
  { key: 'chat', label: 'Chat', title: 'User Support Chat' },
  { key: 'emails', label: 'Emails' },
  { key: 'calls', label: 'Calls' },
  { key: 'matches', label: 'Matches' },
  { key: 'stats', label: 'Stats' },
  { key: 'notes', label: 'Notes' },
  { key: 'actions', label: 'Actions' },
];

const HeaderActionButton = styled(Button)`
  flex-grow: 0;
  gap: ${({ theme }) => theme.spacing.xxsmall};
`;

const UserPanelContent = ({
  tab,
  user,
  appointment,
  onUpdate,
  activeSupportReplyTask,
  onSupportReplySent,
}: {
  tab: string;
  user: any;
  appointment?: { start_time: string; end_time: string };
  onUpdate: () => void;
  activeSupportReplyTask?: any;
  onSupportReplySent?: (message: string) => void;
}) => {
  if (tab === 'profile')
    return (
      <UserDetailsCard user={user} appointment={appointment} partial={false} />
    );

  if (tab === 'chat')
    return (
      <UserChat
        user={user}
        activeSupportReplyTask={activeSupportReplyTask}
        sendViaSupportReplyApi={Boolean(activeSupportReplyTask)}
        onSupportReplySent={onSupportReplySent}
      />
    );

  if (tab === 'emails') return <UserEmails user={user} />;

  if (tab === 'calls') return <UserCalls user={user} />;

  if (tab === 'matches')
    return <UserMatches user={user} appointment={appointment} />;

  if (tab === 'stats') return <UserStats user={user} />;

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

  const {
    data: appointment,
    error: appointmentError,
    isLoading: appointmentLoading,
  } = useSWR(
    user
      ? `/api/matching/users/${user.uuid ?? user.hash}/prematching_appointment/`
      : null,
    dataFetcher,
  );

  const onAddToMatching = () => {
    addUserToMatching(user);
    navigate(MATCHING_ROUTE);
  };

  const selectedTabKey = searchParams.get('tab') ?? USER_TABS[0].key;
  const selectedTab =
    USER_TABS.find(tab => tab.key === selectedTabKey) ?? USER_TABS[0];
  const userName = user
    ? `${user.profile.first_name} ${user.profile.second_name}`
    : 'User';

  const shouldLoadActiveReplyTask = selectedTabKey === 'chat' && Boolean(user?.id);
  const { data: activeReplyTasksResponse } = useSWR(
    shouldLoadActiveReplyTask
      ? [
          'active_support_reply_task',
          user.id,
        ]
      : null,
    () =>
      fetchSupportTasks({
        related_user: String(user.id),
        action_type: ['support_reply'],
        status: ['NEW', 'IN_PROGRESS'],
        sort_by: 'updated_at',
        sort_order: 'desc',
        page_size: 1,
      }),
  );
  const [activeSupportReplyTask, setActiveSupportReplyTask] = useState<any>(null);

  useEffect(() => {
    setActiveSupportReplyTask(activeReplyTasksResponse?.results?.[0] ?? null);
  }, [activeReplyTasksResponse]);

  useEffect(() => {
    setActiveSupportReplyTask(null);
  }, [user?.id]);

  const onSupportReplySent = (message: string) => {
    setActiveSupportReplyTask((current: any) => {
      if (!current) return current;
      return {
        ...current,
        status: 'COMPLETED',
        action: {
          ...current.action,
          status: 'EXECUTED',
          parameters: {
            ...(current.action?.parameters ?? {}),
            message,
          },
        },
      };
    });
  };

  usePageHeader({
    title: `${userName} - ${selectedTab.title ?? selectedTab.label}`,
    showMenu: true,
    actions: user ? (
      <HeaderActionButton
        backgroundColor={theme.color.gradient.blue10}
        size={ButtonSizes.Medium}
        appearance={ButtonAppearance.Secondary}
        onClick={onAddToMatching}
      >
        <PlusIcon label="select user" width={16} height={16} />
        Add to matching
      </HeaderActionButton>
    ) : undefined,
  });

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
    <Tabs defaultValue={selectedTabKey}>
      <TabsList className="grid w-full grid-cols-8">
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
            <SectionContent>
              <UserPanelContent
                tab={tab.key}
                user={user}
                appointment={appointment?.start_time ? appointment : undefined}
                onUpdate={mutate}
                activeSupportReplyTask={activeSupportReplyTask}
                onSupportReplySent={onSupportReplySent}
              />
            </SectionContent>
          </Section>
        </TabsContent>
      ))}
      {searchParams.get('tab') !== USER_TABS[1].key && <SelectedUsersSheet />}
    </Tabs>
  );
};

export default UserPanel;
