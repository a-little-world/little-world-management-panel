import {
  Select,
  Text,
  TextTypes,
} from '@a-little-world/little-world-design-system';
import * as React from 'react';
import { styled } from 'styled-components';
import useSWR from 'swr';

import {
  fetchMatchJourneyV5,
  fetchMatchJourneyV5Definition,
  type MatchJourneyMatchType,
  type MatchJourneyV5DefinitionResponse,
  type MatchJourneyV5Request,
  type MatchJourneyV5Response,
} from '../../../api/matchJourney';
import type { PartitionRollup } from '../../../api/userJourney';
import LoadingSpinner from '../../atoms/LoadingSpinner';
import {
  JourneyCohortRangePicker,
  useJourneyCohortRange,
} from './JourneyCohortRange';
import {
  Bucket,
  BucketsContainer,
  Count,
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

const CohortFilters = styled.div`
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  gap: ${({ theme }) => theme.spacing.medium};
`;

const SourceSelect = styled(Select)`
  div[data-radix-popper-content-wrapper] {
    z-index: 20 !important;
  }
`;

const MATCH_TYPE_ALL = 'all';

type MatchTypeFilter = typeof MATCH_TYPE_ALL | MatchJourneyMatchType;

const MATCH_TYPE_OPTIONS: { value: MatchTypeFilter; label: string }[] = [
  { value: MATCH_TYPE_ALL, label: 'All' },
  { value: 'standard', label: 'Standard' },
  { value: 'random_call', label: 'Random Calls' },
];

function rollupsForPhase(
  phaseBucketIds: string[],
  rollups: PartitionRollup[],
): PartitionRollup[] {
  const cells = new Set(phaseBucketIds);
  return rollups.filter(rollup => rollup.members.every(id => cells.has(id)));
}

/**
 * Definition paints immediately; counts fill in later. Counts are cache-busted per
 * mount — this is live partition membership.
 */
function MatchJourneyV5Buckets() {
  const countsCacheBust = React.useRef(Date.now() + Math.random());
  const { range, setRange, cohort, isPartialRange } =
    useJourneyCohortRange(null);
  const [matchType, setMatchType] =
    React.useState<MatchTypeFilter>(MATCH_TYPE_ALL);
  const request: MatchJourneyV5Request = {
    ...(cohort ?? {}),
    ...(matchType !== MATCH_TYPE_ALL ? { match_type: matchType } : {}),
  };

  const { data: definitionData, error: definitionError } =
    useSWR<MatchJourneyV5DefinitionResponse>(
      'match-journey-v5-definition',
      fetchMatchJourneyV5Definition,
    );

  const { data, error } = useSWR<MatchJourneyV5Response>(
    [
      'match-journey-v5',
      countsCacheBust.current,
      cohort?.start_date ?? null,
      cohort?.end_date ?? null,
      matchType,
    ],
    () => fetchMatchJourneyV5(request),
  );

  const definition = definitionData?.definition ?? data?.definition;
  const loadError = definitionError ?? error;

  if (loadError) {
    return (
      <Section $fullWidth>
        <Text>Could not load Match Journey V5: {String(loadError)}</Text>
      </Section>
    );
  }

  if (!definition) {
    return <LoadingSpinner />;
  }

  const counts = data?.counts;
  const rollupCounts = data?.rollup_counts;
  const overlapPairs = Object.keys(data?.overlap_counts ?? {}).length;

  return (
    <Section $fullWidth>
      <SectionTitle type={TextTypes.Body4} tag="h2">
        {definition.title}
      </SectionTitle>
      <SectionCard>
        <Text>{definition.description}</Text>
        <CohortFilters>
          <SourceSelect
            id="match-journey-v5-source"
            label="Source"
            value={matchType}
            options={MATCH_TYPE_OPTIONS}
            onValueChange={(value: string) =>
              setMatchType(value as MatchTypeFilter)
            }
            placeholder="Source"
            cannotError
            maxWidth="180px"
          />
          <JourneyCohortRangePicker
            label="Match created between"
            tooltipText="Matches created in this range. Leave empty, or choose All time, for every match. Buckets show current state, not state on those dates."
            range={range}
            setRange={setRange}
            clearLabel="Reset to all time data"
            isPartialRange={isPartialRange}
          />
        </CohortFilters>
        {data && !data.balanced && (
          <BalanceWarning>
            Partition does not balance — {data.uncovered_count} uncovered,{' '}
            {data.outside_baseline_count} outside baseline, {overlapPairs}{' '}
            overlapping pairs. Counts still render; dig into the overlap samples
            before trusting the totals.
          </BalanceWarning>
        )}
        <BucketsContainer>
          {definition.phases.map((phase, index) => {
            const phaseTotal = counts
              ? phase.buckets.reduce(
                  (sum, bucket) => sum + (counts[bucket.list_id] ?? 0),
                  0,
                )
              : undefined;
            const phaseRollups = rollupsForPhase(
              phase.buckets.map(bucket => bucket.list_id),
              definition.rollups,
            );

            return (
              <React.Fragment key={phase.id}>
                <Bucket>
                  <Text bold>
                    {`${index + 1}. ${phase.title} (${phaseTotal})`}
                  </Text>
                  {phase.buckets.map(bucket => (
                    <SubBucket key={bucket.list_id}>
                      •
                      <HoverableLiveListDescription
                        title={bucket.label}
                        description={bucket.description}
                        linkTo={`/matches/?list=${bucket.list_id}`}
                        count={counts?.[bucket.list_id]}
                      />
                    </SubBucket>
                  ))}
                  {phaseRollups.map(rollup => (
                    <RollupLine key={rollup.list_id}>
                      Σ {rollup.label}:{' '}
                      <Count count={rollupCounts?.[rollup.list_id]} />
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
          Total summed matches: <Count count={data?.summed_count} /> / baseline{' '}
          <Count count={data?.baseline_count} />
          {data && !data.balanced ? ' (unbalanced)' : ''}
        </Text>
      </SectionCard>
    </Section>
  );
}

export default MatchJourneyV5Buckets;
