import {
  Loading,
  Stepper,
  StepperOrientations,
  StepperSizes,
  Text,
} from '@a-little-world/little-world-design-system';
import React from 'react';
import useSWR from 'swr';

import { LANGUAGES } from '../../../constants';
import { formatDate } from '../../../helpers/date';
import { dataFetcher } from '../../../store';
import MatchesIcons from '../../atoms/MatchesIcons';
import {
  MatchesContainer,
  SectionLabel,
  SidebarSection,
  StatusContainer,
} from './UserCard.styles';

export interface UserJourney {
  stages: Array<{
    id: string;
    label: string;
    description?: string;
    achieved: boolean;
    achieved_at: string | null;
  }>;
  active_stage_index: number;
}

export interface UserMatches {
  confirmed: { results: any[] };
  unconfirmed: { results: any[] };
  proposed: { results: any[] };
}

export const UserJourneyStatus: React.FC<{ journey?: UserJourney }> = ({
  journey,
}) => {
  const stages = journey?.stages ?? [];
  if (stages.length === 0) {
    return null;
  }

  const steps = stages.map(stage => ({
    id: stage.id,
    label: stage.label,
    description:
      stage.achieved && stage.achieved_at
        ? formatDate(new Date(stage.achieved_at), 'dd MMM yyyy', LANGUAGES.en)
        : undefined,
  }));

  return (
    <StatusContainer>
      <SectionLabel>Current status</SectionLabel>
      <Stepper
        steps={steps}
        activeStepIndex={journey?.active_stage_index ?? 0}
        orientation={StepperOrientations.Vertical}
        size={StepperSizes.Medium}
      />
    </StatusContainer>
  );
};

export const MatchEligibility: React.FC<{ userId: string }> = ({ userId }) => {
  const {
    data: waitingTime,
    error: waitingTimeError,
    isLoading,
  } = useSWR(`/api/matching/users/${userId}/match_waiting_time/`, dataFetcher);

  if (isLoading) return <Loading />;

  if (waitingTimeError) return <Text>Error fetching</Text>;

  return (
    <Text
      color={
        waitingTime?.first_search && waitingTime?.number_of_days > 0
          ? 'red'
          : undefined
      }
    >
      {waitingTime.waiting_time_string}
    </Text>
  );
};

export const UserMatchesSummary: React.FC<{ matches?: UserMatches }> = ({
  matches,
}) => (
  <SidebarSection>
    <SectionLabel>Matches</SectionLabel>
    <MatchesContainer>
      <MatchesIcons
        label="Confirmed"
        matches={matches?.confirmed?.results ?? []}
      />
      <MatchesIcons
        label="Unconfirmed"
        matches={matches?.unconfirmed?.results ?? []}
      />
      <MatchesIcons
        label="Proposed"
        matches={matches?.proposed?.results ?? []}
      />
    </MatchesContainer>
  </SidebarSection>
);
