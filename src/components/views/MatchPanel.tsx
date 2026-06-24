import {
  Tag,
  TagAppearance,
  TagSizes,
} from '@a-little-world/little-world-design-system';
import React from 'react';
import { useParams, useSearchParams } from 'react-router-dom';
import styled from 'styled-components';
import useSWR from 'swr';

import { dataFetcher } from '../../store';
import {
  Section,
  SectionContent,
  SectionHeader,
  SectionTitle,
} from '../atoms/Section';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../atoms/Tabs';
import { SelectedUsersSheet } from '../blocks/SelectedUsersSheet';
import MatchActions from '../blocks/match/MatchActions';
import MatchCalls from '../blocks/match/MatchCalls';
import MatchCard from '../blocks/match/MatchCard';
import MatchJourney from '../blocks/match/MatchJourney';
import UserNotes from '../blocks/user/UserNotes';

const HeaderTitleGroup = styled.div`
  display: flex;
  gap: ${({ theme }) => theme.spacing.medium};
  flex-wrap: wrap;
  align-items: center;
`;

const HeaderTags = styled.div`
  display: flex;
  flex-wrap: wrap;
  gap: ${({ theme }) => theme.spacing.xxsmall};
`;

const MATCH_TABS = [
  { key: 'overview', label: 'Overview' },
  { key: 'journey', label: 'Journey' },
  { key: 'calls', label: 'Calls' },
  { key: 'stats', label: 'Stats' },
  { key: 'notes', label: 'Notes' },
  { key: 'actions', label: 'Actions' },
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
  if (tab === 'overview') return <MatchCard match={match} />;

  if (tab === 'journey') return <MatchJourney match={match} />;

  if (tab === 'calls') return <MatchCalls match={match} />;

  if (tab === 'stats') return 'More detailed stats coming soon';

  if (tab === 'notes')
    return (
      <UserNotes notes={match?.notes} modelId={match.uuid} model="match" />
    );

  if (tab === 'actions')
    return <MatchActions match={match} onUpdate={onUpdate} />;

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
              <HeaderTitleGroup>
                <SectionTitle>{`Match: ${match.uuid}`}</SectionTitle>
                <HeaderTags>
                  <Tag
                    appearance={
                      match.active ? TagAppearance.success : TagAppearance.error
                    }
                    size={TagSizes.small}
                    bold
                  >
                    {match.active ? 'Active' : 'Inactive'}
                  </Tag>
                  <Tag
                    appearance={TagAppearance.outline}
                    size={TagSizes.small}
                    bold
                  >
                    {match.bucket_label ?? 'Unknown journey position'}
                  </Tag>
                </HeaderTags>
              </HeaderTitleGroup>
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
      {searchParams.get('tab') !== 'stats' && <SelectedUsersSheet />}
    </Tabs>
  );
};

export default MatchPanel;
