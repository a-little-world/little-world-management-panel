import {
  Button,
  Checkbox,
  StatusMessage,
  StatusTypes,
} from '@a-little-world/little-world-design-system';
import { isEmpty } from 'lodash';
import React, { useState } from 'react';
import { Controller, useForm } from 'react-hook-form';
import { useParams, useSearchParams } from 'react-router-dom';
import useSWR from 'swr';

import styled from 'styled-components';
import { setMatchCompletedOffplattform } from '../../api';
import { dataFetcher } from '../../store';
import {
  Section,
  SectionContent,
  SectionHeader,
  SectionTitle,
} from '../atoms/Section';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../atoms/Tabs';
import { SelectedUsersSheet } from '../blocks/SelectedUsersSheet';
import MatchCalls from '../blocks/match/MatchCalls';
import MatchCard from '../blocks/match/MatchCard';
import UserNotes from '../blocks/user/UserNotes';

const MATCH_TABS = [
  { key: 'overview', label: 'Overview' },
  { key: 'calls', label: 'Calls' },
  { key: 'stats', label: 'Stats' },
  { key: 'notes', label: 'Notes' },
  { key: 'actions', label: 'Actions' },
];

const StyledStatusMessage = styled(StatusMessage)`
  margin-bottom: ${({ theme }) => theme.spacing.small};
`;

const MatchActions = ({
  match,
  onUpdate,
}: {
  match: any;
  onUpdate: () => void;
}) => {
  const [showSuccessMessage, setShowSuccessMessage] = useState(false);

  const {
    control,
    handleSubmit,
    formState: { dirtyFields, errors },
    setError,
    reset,
  } = useForm({
    defaultValues: {
      completed_off_plattform: match.completed_off_plattform,
    },
  });

  const saveChanges = (data: any) => {
    if (isEmpty(dirtyFields)) return;
    setShowSuccessMessage(false);

    // Assume setMatchCompletedOffplattform is a function to update the match status
    setMatchCompletedOffplattform({
      matchId: match.uuid,
      completed_off_plattform: data.completed_off_plattform,
      onError: (error: any) => {
        setError('completed_off_plattform', error.message);
        setShowSuccessMessage(false);
      },
      onSuccess: () => {
        setShowSuccessMessage(true);
        onUpdate();
        reset(data); // Reset form to reflect the saved state
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
            inputRef={ref as unknown as React.RefObject<HTMLButtonElement>}
            onCheckedChange={val => onChange({ target: { value: val } })}
            onBlur={onBlur}
            value={value}
            defaultChecked={value}
            error={error?.message}
            label="Match completed off-platform"
          />
        )}
      />
      <StyledStatusMessage
        visible={!!errors?.completed_off_plattform || showSuccessMessage}
        type={showSuccessMessage ? StatusTypes.Success : StatusTypes.Error}
      >
        {String(
          errors?.completed_off_plattform?.message ||
            '✅ Changes successfully updated!',
        )}
      </StyledStatusMessage>
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

  if (tab === 'calls')
    return <MatchCalls match={match} />;

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
      <TabsList className="grid w-full grid-cols-5">
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
                <SectionTitle>{`${
                  match.active ? '' : 'Inactive '
                }Match: ${match.uuid}`}</SectionTitle>
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
      {searchParams.get('tab') !== 'stats' && <SelectedUsersSheet />}
    </Tabs>
  );
};

export default MatchPanel;
