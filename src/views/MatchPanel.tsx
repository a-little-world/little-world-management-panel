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
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '../atoms/Card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../atoms/Tabs';
import { SelectedUsersSheet } from '../blocks/SelectedUsersSheet';
import MatchCard from '../blocks/match/MatchCard';
import UserActions from '../blocks/user/UserActions';
import UserNotes from '../blocks/user/UserNotes';
import { dataFetcher, useGlobalState } from '../store';

const MATCH_TABS = [
  { key: 'overview', label: 'Overview' },
  { key: 'stats', label: 'Stats' },
  { key: 'notes', label: 'Notes' },
  // { key: 'actions', label: 'Actions' },
];

const MatchPanelContent = ({
  tab,
  match,
  onUpdate,
}: {
  tab: string;
  match: any;
  onUpdate: () => void;
}) => {
  if (tab === 'overview')
    return <MatchCard match={match} onMatchUpdate={onUpdate} />;

  if (tab === 'stats') return 'More detailed stats coming soon';

  if (tab === 'notes')
    return (
      <UserNotes notes={match?.notes} modelId={match.uuid} model="match" />
    );

  // if (tab === 'actions') return <UserActions user={user} onUpdate={onUpdate} />;
  return null;
};

const MatchPanel = () => {
  const { matchId } = useParams();
  // const { addUserToMatching, setUpdateCurrentUser } = useGlobalState();
  const theme = useTheme();
  let [searchParams, setSearchParams] = useSearchParams();

  const navigate = useNavigate();

  const {
    data: match,
    error,
    isLoading,
    mutate,
  } = useSWR(`/api/matching/matches/${matchId}/`, dataFetcher);

  console.log({ match });
  if (isLoading && !error)
    return <div className="w-full p-3 text-center">Loading</div>;
  if (error)
    return (
      <div className="w-full p-3 text-center">
        Issue fetching this match. Please ensure the match id is correct
      </div>
    );

  return (
    <Tabs defaultValue={searchParams.get('tab') ?? MATCH_TABS[0].key}>
      <TabsList className="grid w-full grid-cols-6">
        {MATCH_TABS.map(tab => (
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
      {MATCH_TABS.map(tab => (
        <TabsContent key={'content' + tab.key} value={tab.key}>
          <Card
            className={`border-none shadow-none flex flex-col w-full ${
              tab.key === 'chat' ? 'h-full' : ''
            }`}
          >
            <CardHeader className="flex-row items-center justify-between px-6 py-4 gap-4">
              <div>
                <CardTitle>{`Match: ${match.uuid}`}</CardTitle>
                {tab.description && (
                  <CardDescription>{tab.description}</CardDescription>
                )}
              </div>
            </CardHeader>
            <CardContent className="px-6 py-4 flex flex-col min-h-0 h-full w-full">
              <MatchPanelContent
                tab={tab.key}
                match={match}
                onUpdate={mutate}
              />
            </CardContent>
          </Card>
        </TabsContent>
      ))}
      {searchParams.get('tab') !== MATCH_TABS[1].key && <SelectedUsersSheet />}
    </Tabs>
  );
};

export default MatchPanel;
