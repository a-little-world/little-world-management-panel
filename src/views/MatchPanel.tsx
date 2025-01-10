import React from 'react';
import { useParams } from 'react-router-dom';
import { useSearchParams } from 'react-router-dom';
import useSWR from 'swr';

import {
  Section,
  SectionContent,
  SectionDescription,
  SectionHeader,
  SectionTitle,
} from '../atoms/Section';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../atoms/Tabs';
import { SelectedUsersSheet } from '../blocks/SelectedUsersSheet';
import MatchCard from '../blocks/match/MatchCard';
import UserNotes from '../blocks/user/UserNotes';
import { dataFetcher } from '../store';

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
  return null;
};

const MatchPanel = () => {
  const { matchId } = useParams();

  let [searchParams, setSearchParams] = useSearchParams();

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
          <Section>
            <SectionHeader>
              <div>
                <SectionTitle inactive={!match.active}>{`${
                  match.active ? '' : 'Inactive '
                }Match: ${match.uuid}`}</SectionTitle>
                {tab.description && (
                  <SectionDescription>{tab.description}</SectionDescription>
                )}
              </div>
            </SectionHeader>
            <SectionContent>
              <MatchPanelContent
                tab={tab.key}
                match={match}
                onUpdate={mutate}
              />
            </SectionContent>
          </Section>
        </TabsContent>
      ))}
      {searchParams.get('tab') !== MATCH_TABS[1].key && <SelectedUsersSheet />}
    </Tabs>
  );
};

export default MatchPanel;
