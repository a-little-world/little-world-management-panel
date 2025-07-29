import {
  Button,
  Checkbox,
  MessageTypes,
  StatusMessage,
} from '@a-little-world/little-world-design-system';
import { isEmpty } from 'lodash';
import React from 'react';
import { Controller, useForm } from 'react-hook-form';
import { useParams, useSearchParams } from 'react-router-dom';
import useSWR from 'swr';

import { setMatchCompletedOffplattform } from '../../api';
import { dataFetcher } from '../../store';
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

const MATCH_TABS = [
  { key: 'overview', label: 'Overview' },
  { key: 'stats', label: 'Stats' },
  { key: 'notes', label: 'Notes' },
  { key: 'actions', label: 'Actions' },
];

const MatchActions = ({
  match,
  onUpdate,
}: {
  match: any;
  onUpdate: () => void;
}) => {
  const {
    control,
    handleSubmit,
    formState: { dirtyFields, errors },
    setError,
  } = useForm({
    defaultValues: {
      completed_off_plattform: match.completed_off_plattform,
    },
  });

  const saveChanges = data => {
    if (isEmpty(dirtyFields)) return;
    // Assume setMatchCompletedOffplattform is a function to update the match status
    setMatchCompletedOffplattform({
      matchId: match.uuid,
      completed_off_plattform: data.completed_off_plattform,
      onError: error => {
        setError('completed_off_plattform', error.message);
      },
      onSuccess: () => {
        onUpdate();
      },
    });
  };

  return (
    <form onSubmit={handleSubmit(saveChanges)}>
      <Controller
        name="completed_off_plattform"
        control={control}
        render={({
          field: { onChange, onBlur, value, name, ref },
          fieldState: { error },
        }) => (
          <Checkbox
            id="completed_off_plattform"
            name={name}
            inputRef={ref}
            onCheckedChange={val => onChange({ target: { value: val } })}
            onBlur={onBlur}
            value={value}
            defaultChecked={value}
            error={error?.message}
            label="Match completed off-platform"
          />
        )}
      />
      <StatusMessage
        $visible={!!errors?.completed_off_plattform}
        $type={MessageTypes.Error}
      >
        {errors?.completed_off_plattform?.message}
      </StatusMessage>
      <Button type="submit" disabled={isEmpty(dirtyFields)}>
        Save Changes
      </Button>
    </form>
  );
};

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
