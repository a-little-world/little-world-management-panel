import { Text, TextTypes } from '@a-little-world/little-world-design-system';
import * as React from 'react';
import useSWR from 'swr';
import { styled } from 'styled-components';

import {
  fetchUserJourneyV5,
  type PartitionRollup,
  type UserJourneyV5Response,
} from '../../../api/userJourney';
import LoadingSpinner from '../../atoms/LoadingSpinner';
import {
  Bucket,
  BucketsContainer,
  HoverableLiveListDescription,
  Section,
  SectionCard,
  SectionTitle,
  StyledChevron,
  SubBucket,
} from './JourneyStyles';

const BalanceWarning = styled(Text)`
  color: ${({ theme }) => theme.color.text.error};
  margin-top: ${({ theme }) => theme.spacing.xxsmall};
`;

const RollupLine = styled(Text)`
  margin-top: ${({ theme }) => theme.spacing.xxsmall};
  font-style: italic;
`;

function rollupsForPhase(
  phaseBucketIds: string[],
  rollups: PartitionRollup[],
): PartitionRollup[] {
  const cells = new Set(phaseBucketIds);
  return rollups.filter(rollup => rollup.members.every(id => cells.has(id)));
}

function UserJourneyV5Buckets() {
  const { data, error, isLoading } = useSWR<UserJourneyV5Response>(
    'user-journey-v5',
    () => fetchUserJourneyV5({ start_date: '2022-01-01' }),
  );

  if (isLoading) {
    return <LoadingSpinner />;
  }

  if (error || !data) {
    return (
      <Section $fullWidth>
        <Text>Could not load User Journey V5: {String(error ?? 'no data')}</Text>
      </Section>
    );
  }

  const { definition, counts, rollup_counts, baseline_count, summed_count, balanced } =
    data;
  const overlapPairs = Object.keys(data.overlap_counts ?? {}).length;

  return (
    <Section $fullWidth>
      <SectionTitle type={TextTypes.Body4} tag="h2">
        {definition.title}
      </SectionTitle>
      <SectionCard>
        <Text>{definition.description}</Text>
        {!balanced && (
          <BalanceWarning>
            Partition does not balance — {data.uncovered_count} uncovered,{' '}
            {data.outside_baseline_count} outside baseline, {overlapPairs} overlapping
            pairs. Counts still render; dig into the overlap samples before trusting the
            totals.
          </BalanceWarning>
        )}
        <BucketsContainer>
          {definition.phases.map((phase, index) => {
            const phaseTotal = phase.buckets.reduce(
              (sum, bucket) => sum + (counts[bucket.list_id] ?? 0),
              0,
            );
            const phaseRollups = rollupsForPhase(
              phase.buckets.map(bucket => bucket.list_id),
              definition.rollups,
            );

            return (
              <React.Fragment key={phase.id}>
                <Bucket>
                  <Text bold>{`${index + 1} ${phase.title}: (total: ${phaseTotal})`}</Text>
                  {phase.buckets.map(bucket => (
                    <SubBucket key={bucket.list_id}>
                      •
                      <HoverableLiveListDescription
                        title={bucket.label}
                        description={bucket.description}
                        linkTo={`/users/?list=${bucket.list_id}`}
                        count={counts[bucket.list_id]}
                      />
                    </SubBucket>
                  ))}
                  {phaseRollups.map(rollup => (
                    <RollupLine key={rollup.list_id}>
                      Σ {rollup.label}: {rollup_counts?.[rollup.list_id] ?? 0}
                    </RollupLine>
                  ))}
                </Bucket>
                {index < definition.phases.length - 1 && (
                  <StyledChevron label="Next phase" />
                )}
              </React.Fragment>
            );
          })}
        </BucketsContainer>
        <Text bold>
          Total summed users: {summed_count} / baseline {baseline_count}
          {balanced ? '' : ' (unbalanced)'}
        </Text>
      </SectionCard>
    </Section>
  );
}

export default UserJourneyV5Buckets;
