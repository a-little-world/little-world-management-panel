import {
  Stepper,
  StepperOrientations,
  StepperSizes,
  Text,
  TextTypes,
} from '@a-little-world/little-world-design-system';
import React from 'react';
import styled from 'styled-components';

import { LANGUAGES } from '../../../constants';
import { formatDate } from '../../../helpers/date';

type JourneyStage = {
  id: string;
  label: string;
  description?: string;
  achieved: boolean;
  achieved_at: string | null;
};

const ProgressAside = styled.aside`
  display: flex;
  flex-direction: column;
  gap: ${({ theme }) => theme.spacing.small};
  flex: 1 1 300px;
  max-width: 400px;
  border: ${({ theme }) => theme.color.border.subtle} solid 1px;
  border-radius: ${({ theme }) => theme.radius.small};
  padding: ${({ theme }) => theme.spacing.large}
    ${({ theme }) => theme.spacing.xlarge};
  background: ${({ theme }) => theme.color.surface.primary};
`;

const ProgressHeader = styled.div`
  display: flex;
  flex-direction: column;
  gap: ${({ theme }) => theme.spacing.xxxsmall};
  padding-bottom: ${({ theme }) => theme.spacing.xsmall};
  border-bottom: ${({ theme }) => theme.color.border.subtle} solid 1px;
`;

const buildStepperSteps = (stages: JourneyStage[]) =>
  stages.map(stage => ({
    id: stage.id,
    label: stage.label,
    description:
      stage.achieved && stage.achieved_at
        ? formatDate(new Date(stage.achieved_at), 'dd MMM yyyy', LANGUAGES.en)
        : stage.description,
  }));

const MatchProgress = ({ match }: { match: any }) => {
  const stages: JourneyStage[] = match.journey?.stages ?? [];
  if (stages.length === 0) {
    return null;
  }

  const activeStepIndex = match.journey?.active_stage_index ?? 0;

  return (
    <ProgressAside>
      <ProgressHeader>
        <Text type={TextTypes.Body4} bold>
          Progress
        </Text>
        {match.bucket_label && (
          <Text type={TextTypes.Body7}>{match.bucket_label}</Text>
        )}
      </ProgressHeader>
      <Stepper
        steps={buildStepperSteps(stages)}
        activeStepIndex={activeStepIndex}
        orientation={StepperOrientations.Vertical}
        size={StepperSizes.Medium}
      />
    </ProgressAside>
  );
};

export default MatchProgress;
