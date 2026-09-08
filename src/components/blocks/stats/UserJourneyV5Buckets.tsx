import {
  Select,
  Text,
  TextTypes,
} from '@a-little-world/little-world-design-system';
import * as React from 'react';
import { styled } from 'styled-components';
import useSWR from 'swr';

import {
  fetchUserJourneyV5,
  fetchUserJourneyV5Definition,
  type PartitionRollup,
  type UserJourneyUserType,
  type UserJourneyV5DefinitionResponse,
  type UserJourneyV5Request,
  type UserJourneyV5Response,
} from '../../../api/userJourney';
import LoadingSpinner from '../../atoms/LoadingSpinner';
import {
  JourneyCohortRangePicker,
  USER_JOURNEY_DEFAULT_START,
  localTodayYmd,
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

const UserTypeSelect = styled(Select)`
  div[data-radix-popper-content-wrapper] {
    z-index: 20 !important;
  }
`;

const USER_TYPE_ALL = 'all';

type UserTypeFilter = typeof USER_TYPE_ALL | UserJourneyUserType;

const USER_TYPE_OPTIONS: { value: UserTypeFilter; label: string }[] = [
  { value: USER_TYPE_ALL, label: 'All' },
  { value: 'volunteer', label: 'Volunteers' },
  { value: 'learner', label: 'Learners' },
];

function rollupsForPhase(
  phaseBucketIds: string[],
  rollups: PartitionRollup[],
): PartitionRollup[] {
  const cells = new Set(phaseBucketIds);
  return rollups.filter(rollup => rollup.members.every(id => cells.has(id)));
}

/**
 * Counting all 29 buckets takes tens of seconds, so the definition and the counts are
 * fetched separately: the journey renders as soon as its shape arrives and each number
 * fills in when the counts land. Holding a single spinner for the whole request is what
 * made this feel slower than V4, which paints instantly from a client-side copy of the
 * definition — the duplication this chart deliberately does not have.
 *
 * Counts are live partition membership, so the SWR key is cache-busted per mount the
 * same way V4's `?random=` does — a stable key would paint yesterday's numbers while a
 * fresh 18s request runs. The definition is shape only and may stay cached.
 */
function UserJourneyV5Buckets() {
  const countsCacheBust = React.useRef(Date.now() + Math.random());
  const { range, setRange, cohort, isPartialRange } = useJourneyCohortRange({
    start_date: USER_JOURNEY_DEFAULT_START,
    end_date: localTodayYmd(),
  });
  const [userType, setUserType] = React.useState<UserTypeFilter>(USER_TYPE_ALL);
  // No cohort means no date filter — what "all time" on the clear action says.
  const request: UserJourneyV5Request = {
    ...(cohort ?? {}),
    ...(userType !== USER_TYPE_ALL ? { user_type: userType } : {}),
  };

  const { data: definitionData, error: definitionError } =
    useSWR<UserJourneyV5DefinitionResponse>(
      'user-journey-v5-definition',
      fetchUserJourneyV5Definition,
    );

  const { data, error } = useSWR<UserJourneyV5Response>(
    [
      'user-journey-v5',
      countsCacheBust.current,
      cohort?.start_date ?? null,
      cohort?.end_date ?? null,
      userType,
    ],
    () => fetchUserJourneyV5(request),
  );

  const definition = definitionData?.definition ?? data?.definition;
  const loadError = definitionError ?? error;

  if (loadError) {
    return (
      <Section $fullWidth>
        <Text>Could not load User Journey V5: {String(loadError)}</Text>
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
          <UserTypeSelect
            id="user-journey-v5-user-type"
            label="User type"
            value={userType}
            options={USER_TYPE_OPTIONS}
            onValueChange={(value: string) =>
              setUserType(value as UserTypeFilter)
            }
            placeholder="User type"
            cannotError
            maxWidth="180px"
          />
          <JourneyCohortRangePicker
            label="Signed up between"
            tooltipText="Users who joined in this range. Buckets show their current state, not their state on those dates."
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
                    {`${index + 1} ${phase.title}: `}
                    <Count count={phaseTotal} label="total" />
                  </Text>
                  {phase.buckets.map(bucket => (
                    <SubBucket key={bucket.list_id}>
                      •
                      <HoverableLiveListDescription
                        title={bucket.label}
                        description={bucket.description}
                        linkTo={`/users/?list=${bucket.list_id}`}
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
          Total summed users: <Count count={data?.summed_count} /> / baseline{' '}
          <Count count={data?.baseline_count} />
          {data && !data.balanced ? ' (unbalanced)' : ''}
        </Text>
      </SectionCard>
    </Section>
  );
}

export default UserJourneyV5Buckets;
