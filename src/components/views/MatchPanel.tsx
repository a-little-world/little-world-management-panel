import {
  Button,
  Checkbox,
  Stepper,
  StepperOrientations,
  StepperSizes,
  StatusMessage,
  StatusTypes,
  Text,
  TextTypes,
} from '@a-little-world/little-world-design-system';
import { isEmpty } from 'lodash';
import React, { useState } from 'react';
import { Controller, useForm } from 'react-hook-form';
import { useParams, useSearchParams } from 'react-router-dom';
import useSWR from 'swr';

import styled from 'styled-components';
import { setMatchCompletedOffplattform } from '../../api';
import {
  BLUE_10,
  BLUE_40,
  GREEN_10,
  GREEN_40,
  LANGUAGES,
  ORANGE_10,
  ORANGE_40,
} from '../../constants';
import { formatDate } from '../../helpers/date';
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
  { key: 'journey', label: 'Journey' },
  { key: 'calls', label: 'Calls' },
  { key: 'stats', label: 'Stats' },
  { key: 'notes', label: 'Notes' },
  { key: 'actions', label: 'Actions' },
];

const MATCH_JOURNEY_STAGES = [
  {
    id: 'pre-match',
    label: 'Pre-match',
    description: 'Proposal, confirmation, or early no-contact state.',
    buckets: [
      'match_journey_v2__proposed_matches',
      'match_journey_v2__expired_proposals',
      'match_journey_v2__unviewed',
      'match_journey_v2__one_user_viewed',
      'match_journey_v2__confirmed_no_contact',
      'match_journey_v2__confirmed_single_party_contact',
      'match_journey_v2__never_confirmed',
      'match_journey_v2__no_contact',
      'match_journey_v2__user_ghosted',
    ],
  },
  {
    id: 'first-contact',
    label: 'First contact',
    description: 'Both people have started interacting.',
    buckets: ['match_journey_v2__first_contact'],
  },
  {
    id: 'ongoing',
    label: 'Ongoing',
    description: 'The match is active within the planned 10 week journey.',
    buckets: ['match_journey_v2__match_ongoing'],
  },
  {
    id: 'free-play',
    label: 'Free play',
    description: 'The match is beyond week 10 and still active.',
    buckets: ['match_journey_v2__match_free_play'],
  },
  {
    id: 'completed',
    label: 'Completed',
    description: 'The match completed on or off platform.',
    buckets: ['match_journey_v2__completed_match'],
  },
  {
    id: 'closed',
    label: 'Closed',
    description: 'The match was reported, removed, or contact stopped.',
    buckets: [
      'match_journey_v2__contact_stopped',
      'match_journey_v2__reported_or_removed',
    ],
  },
];

type WeeklyActivity = {
  week: number;
  start_at: string;
  end_at: string;
  messages: number;
  video_calls: number;
  is_current_week: boolean;
  is_free_play_week: boolean;
};

const StyledStatusMessage = styled(StatusMessage)`
  margin-bottom: ${({ theme }) => theme.spacing.small};
`;

const JourneyGrid = styled.div`
  display: grid;
  grid-template-columns: minmax(0, 1fr);
  gap: ${({ theme }) => theme.spacing.medium};

  @media (min-width: ${({ theme }) => theme.breakpoints.large}) {
    grid-template-columns: minmax(280px, 0.8fr) minmax(0, 1.2fr);
  }
`;

const JourneyColumn = styled.div`
  display: flex;
  flex-direction: column;
  gap: ${({ theme }) => theme.spacing.small};
`;

const PanelCard = styled.div`
  background: ${({ theme }) => theme.color.surface.primary};
  border: 1px solid ${({ theme }) => theme.color.border.subtle};
  border-radius: ${({ theme }) => theme.radius.small};
  padding: ${({ theme }) => theme.spacing.small};
`;

const SummaryGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(140px, 1fr));
  gap: ${({ theme }) => theme.spacing.xsmall};
`;

const SummaryCard = styled.div`
  background: ${({ theme }) => theme.color.surface.secondary};
  border: 1px solid ${({ theme }) => theme.color.border.subtle};
  border-radius: ${({ theme }) => theme.radius.xsmall};
  padding: ${({ theme }) => theme.spacing.xsmall};
`;

const BadgeRow = styled.div`
  display: flex;
  flex-wrap: wrap;
  gap: ${({ theme }) => theme.spacing.xxsmall};
`;

const StatusBadge = styled.div<{ $tone: 'success' | 'info' | 'warning' }>`
  border-radius: ${({ theme }) => theme.radius.full};
  padding: ${({ theme }) => theme.spacing.xxxsmall}
    ${({ theme }) => theme.spacing.xxsmall};
  background: ${({ $tone }) =>
    $tone === 'success' ? GREEN_10 : $tone === 'info' ? BLUE_10 : ORANGE_10};
  color: ${({ $tone }) =>
    $tone === 'success' ? GREEN_40 : $tone === 'info' ? BLUE_40 : ORANGE_40};
`;

const WeeklyGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(180px, 1fr));
  gap: ${({ theme }) => theme.spacing.xsmall};
`;

const WeekCard = styled.div<{ $isCurrentWeek: boolean }>`
  border: 1px solid
    ${({ $isCurrentWeek, theme }) =>
      $isCurrentWeek
        ? theme.color.border.selected
        : theme.color.border.subtle};
  border-radius: ${({ theme }) => theme.radius.xsmall};
  padding: ${({ theme }) => theme.spacing.xsmall};
  background: ${({ $isCurrentWeek, theme }) =>
    $isCurrentWeek ? theme.color.surface.accent : theme.color.surface.primary};
`;

const WeekHeader = styled.div`
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  gap: ${({ theme }) => theme.spacing.xxsmall};
  margin-bottom: ${({ theme }) => theme.spacing.xxsmall};
`;

const ActivityRows = styled.div`
  display: flex;
  flex-direction: column;
  gap: ${({ theme }) => theme.spacing.xxsmall};
`;

const ActivityRow = styled.div`
  display: grid;
  grid-template-columns: 72px minmax(0, 1fr) 28px;
  align-items: center;
  gap: ${({ theme }) => theme.spacing.xxsmall};
`;

const ActivityTrack = styled.div`
  height: ${({ theme }) => theme.spacing.xxxsmall};
  border-radius: ${({ theme }) => theme.radius.full};
  background: ${({ theme }) => theme.color.surface.secondary};
  overflow: hidden;
`;

const ActivityBar = styled.div<{
  $value: number;
  $max: number;
  $activity: 'messages' | 'video';
}>`
  width: ${({ $value, $max }) => `${Math.round(($value / $max) * 100)}%`};
  min-width: ${({ $value }) => ($value > 0 ? '4px' : '0')};
  height: 100%;
  border-radius: ${({ theme }) => theme.radius.full};
  background: ${({ $activity }) =>
    $activity === 'messages' ? BLUE_40 : ORANGE_40};
`;

const EmptyState = styled.div`
  border: 1px dashed ${({ theme }) => theme.color.border.moderate};
  border-radius: ${({ theme }) => theme.radius.xsmall};
  padding: ${({ theme }) => theme.spacing.small};
  text-align: center;
`;

const StreakRows = styled.div`
  display: flex;
  flex-direction: column;
  gap: ${({ theme }) => theme.spacing.xxsmall};
`;

const StreakRow = styled.div`
  display: grid;
  grid-template-columns: minmax(72px, 1fr) auto auto;
  align-items: center;
  gap: ${({ theme }) => theme.spacing.xxsmall};
`;

const getJourneyStageIndex = (match: any) => {
  const bucket = match?.bucket;

  if (match?.completed_off_plattform) {
    return MATCH_JOURNEY_STAGES.findIndex(stage => stage.id === 'completed');
  }

  const index = MATCH_JOURNEY_STAGES.findIndex(stage =>
    stage.buckets.includes(bucket),
  );

  if (index >= 0) {
    return index;
  }

  if (match?.journey?.is_free_play) {
    return MATCH_JOURNEY_STAGES.findIndex(stage => stage.id === 'free-play');
  }

  if (!match?.active) {
    return MATCH_JOURNEY_STAGES.findIndex(stage => stage.id === 'closed');
  }

  if (match?.confirmed) {
    return MATCH_JOURNEY_STAGES.findIndex(stage => stage.id === 'ongoing');
  }

  return 0;
};

const getStreakStats = (
  weeklyActivity: WeeklyActivity[],
  predicate: (week: WeeklyActivity) => boolean,
  currentWeek: number,
) => {
  const elapsedWeeks = weeklyActivity
    .filter(week => week.week <= currentWeek)
    .sort((a, b) => a.week - b.week);
  let runningRecord = 0;
  let record = 0;

  elapsedWeeks.forEach(week => {
    if (predicate(week)) {
      runningRecord += 1;
      record = Math.max(record, runningRecord);
      return;
    }

    runningRecord = 0;
  });

  let current = 0;
  for (let i = elapsedWeeks.length - 1; i >= 0; i--) {
    const week = elapsedWeeks[i];
    if (predicate(week)) {
      current += 1;
      continue;
    }

    break;
  }

  return { current, record };
};

const StreakSummaryRow = ({
  label,
  current,
  record,
}: {
  label: string;
  current: number;
  record: number;
}) => (
  <StreakRow>
    <Text type={TextTypes.Body6}>{label}</Text>
    <Text type={TextTypes.Body7}>
      Current: <strong>{pluralizeWeeks(current)}</strong>
    </Text>
    <Text type={TextTypes.Body7}>
      Record: <strong>{pluralizeWeeks(record)}</strong>
    </Text>
  </StreakRow>
);

const pluralizeWeeks = (count: number) =>
  `${count} ${count === 1 ? 'week' : 'weeks'}`;

const formatWeekRange = (week: WeeklyActivity) =>
  `${formatDate(new Date(week.start_at), 'dd MMM', LANGUAGES.en)} - ${formatDate(
    new Date(week.end_at),
    'dd MMM',
    LANGUAGES.en,
  )}`;

const MatchJourney = ({ match }: { match: any }) => {
  const weeklyActivity: WeeklyActivity[] = match?.journey?.weekly_activity ?? [];
  const activeStepIndex = getJourneyStageIndex(match);
  const currentWeek = match?.journey?.current_week ?? 1;
  const desiredDurationWeeks = match?.journey?.desired_duration_weeks ?? 10;
  const maxActivity = Math.max(
    1,
    ...weeklyActivity.flatMap(week => [week.messages, week.video_calls]),
  );
  const messageStreak = getStreakStats(
    weeklyActivity,
    week => week.messages > 0,
    currentWeek,
  );
  const videoCallStreak = getStreakStats(
    weeklyActivity,
    week => week.video_calls > 0,
    currentWeek,
  );
  const activeStreak = getStreakStats(
    weeklyActivity,
    week => week.messages > 0 || week.video_calls > 0,
    currentWeek,
  );
  const stepperSteps = MATCH_JOURNEY_STAGES.map(
    ({ id, label, description }) => ({
      id,
      label,
      description,
    }),
  );

  return (
    <JourneyGrid>
      <JourneyColumn>
        <PanelCard>
          <Text type={TextTypes.Body4} bold>
            Match Journey
          </Text>
          <Text type={TextTypes.Body6}>
            {match.bucket_label ?? 'Unknown journey position'}
          </Text>
          <Stepper
            steps={stepperSteps}
            activeStepIndex={activeStepIndex}
            orientation={StepperOrientations.Vertical}
            size={StepperSizes.Medium}
          />
        </PanelCard>
        <SummaryGrid>
          <SummaryCard>
            <Text type={TextTypes.Body7}>Current week</Text>
            <Text type={TextTypes.Body4} bold>
              Week {currentWeek}
            </Text>
            <Text type={TextTypes.Body7}>
              Planned journey: {desiredDurationWeeks} weeks
            </Text>
          </SummaryCard>
          <SummaryCard>
            <Text type={TextTypes.Body7}>Status</Text>
            <BadgeRow>
              <StatusBadge $tone={match.active ? 'success' : 'warning'}>
                <Text type={TextTypes.Body7} tag="span" bold>
                  {match.active ? 'Active' : 'Inactive'}
                </Text>
              </StatusBadge>
              {match.journey?.is_free_play && (
                <StatusBadge $tone="info">
                  <Text type={TextTypes.Body7} tag="span" bold>
                    Free play
                  </Text>
                </StatusBadge>
              )}
              {match.completed_off_plattform && (
                <StatusBadge $tone="success">
                  <Text type={TextTypes.Body7} tag="span" bold>
                    Completed off-platform
                  </Text>
                </StatusBadge>
              )}
            </BadgeRow>
          </SummaryCard>
          <SummaryCard>
            <Text type={TextTypes.Body7}>Weekly streaks</Text>
            <StreakRows>
              <StreakSummaryRow
                label="Messages"
                current={messageStreak.current}
                record={messageStreak.record}
              />
              <StreakSummaryRow
                label="Video calls"
                current={videoCallStreak.current}
                record={videoCallStreak.record}
              />
              <StreakSummaryRow
                label="Any activity"
                current={activeStreak.current}
                record={activeStreak.record}
              />
            </StreakRows>
          </SummaryCard>
        </SummaryGrid>
      </JourneyColumn>
      <PanelCard>
        <Text type={TextTypes.Body4} bold>
          Weekly Activity
        </Text>
        <Text type={TextTypes.Body6}>
          Messages and mutual video calls grouped by week since this match was
          created.
        </Text>
        {weeklyActivity.length === 0 ? (
          <EmptyState>
            <Text type={TextTypes.Body6}>No weekly activity available yet.</Text>
          </EmptyState>
        ) : (
          <WeeklyGrid>
            {weeklyActivity.map(week => (
              <WeekCard key={week.week} $isCurrentWeek={week.is_current_week}>
                <WeekHeader>
                  <div>
                    <Text type={TextTypes.Body6} bold>
                      Week {week.week}
                    </Text>
                    <Text type={TextTypes.Body7}>{formatWeekRange(week)}</Text>
                  </div>
                  <BadgeRow>
                    {week.is_current_week && (
                      <StatusBadge $tone="info">
                        <Text type={TextTypes.Body7} tag="span" bold>
                          Current
                        </Text>
                      </StatusBadge>
                    )}
                    {week.is_free_play_week && (
                      <StatusBadge $tone="success">
                        <Text type={TextTypes.Body7} tag="span" bold>
                          Free play
                        </Text>
                      </StatusBadge>
                    )}
                  </BadgeRow>
                </WeekHeader>
                <ActivityRows>
                  <ActivityRow>
                    <Text type={TextTypes.Body7}>Messages</Text>
                    <ActivityTrack>
                      <ActivityBar
                        $activity="messages"
                        $value={week.messages}
                        $max={maxActivity}
                      />
                    </ActivityTrack>
                    <Text type={TextTypes.Body7} bold>
                      {week.messages}
                    </Text>
                  </ActivityRow>
                  <ActivityRow>
                    <Text type={TextTypes.Body7}>Calls</Text>
                    <ActivityTrack>
                      <ActivityBar
                        $activity="video"
                        $value={week.video_calls}
                        $max={maxActivity}
                      />
                    </ActivityTrack>
                    <Text type={TextTypes.Body7} bold>
                      {week.video_calls}
                    </Text>
                  </ActivityRow>
                </ActivityRows>
              </WeekCard>
            ))}
          </WeeklyGrid>
        )}
      </PanelCard>
    </JourneyGrid>
  );
};

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

  if (tab === 'journey') return <MatchJourney match={match} />;

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
