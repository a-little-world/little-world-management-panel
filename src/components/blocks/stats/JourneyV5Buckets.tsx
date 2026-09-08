import {
  Select,
  Text,
  TextTypes,
} from '@a-little-world/little-world-design-system';
import * as React from 'react';
import { styled } from 'styled-components';
import useSWR from 'swr';

import type { PartitionDefinitionPayload, PartitionRollup } from '../../../api/userJourney';
import LoadingSpinner from '../../atoms/LoadingSpinner';
import {
  JourneyCohortRangePicker,
  type JourneyCohortDates,
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

const FilterSelect = styled(Select)`
  div[data-radix-popper-content-wrapper] {
    z-index: ${({ theme }) => theme.zIndex.dropdown} !important;
  }
`;

function rollupsForPhase(
  phaseBucketIds: string[],
  rollups: PartitionRollup[],
): PartitionRollup[] {
  const cells = new Set(phaseBucketIds);
  return rollups.filter(rollup => rollup.members.every(id => cells.has(id)));
}

/** The subset of a V5 statistics response every journey shares — the rest (dates, the
 * segment field itself) differs per domain and is owned by that domain's own type. */
export type JourneyV5StatsResponse = {
  definition: PartitionDefinitionPayload;
  counts?: Record<string, number>;
  rollup_counts?: Record<string, number>;
  summed_count?: number;
  baseline_count?: number;
  balanced: boolean;
  uncovered_count: number;
  outside_baseline_count: number;
  overlap_counts: Record<string, number>;
};

export type JourneyV5FilterOption = { value: string; label: string };

export type JourneyV5BucketsProps<
  TReq extends Record<string, unknown>,
  TRes extends JourneyV5StatsResponse,
> = {
  /** Distinguishes this journey's SWR cache keys and identifies it in error text. */
  swrKeyPrefix: string;
  errorLabel: string;
  totalLabel: string;
  /** Prepended to a bucket's `list_id` to link to its drill-down list. */
  listLinkPrefix: string;
  initialRange: JourneyCohortDates | null;
  rangeLabel: string;
  rangeTooltip: string;
  filterId: string;
  filterLabel: string;
  filterPlaceholder: string;
  filterOptions: JourneyV5FilterOption[];
  /** Sentinel option value meaning "no filter" — never sent to the API. */
  filterAllValue?: string;
  fetchDefinition: () => Promise<{ definition: PartitionDefinitionPayload }>;
  fetchStatistics: (body: TReq) => Promise<TRes>;
  /** Builds the request body from the current date range and filter selection — the
   * only place that needs to know the domain's field name (`user_type`/`match_type`). */
  buildRequest: (args: {
    cohort: JourneyCohortDates | null;
    filterValue: string | null;
  }) => TReq;
  /** Builds the query params appended to every bucket's drill-down link, so "click
   * through" shows only the users/matches actually counted in that number — the list
   * page's own filter param names (e.g. `profile__user_type`, `joined_between_after`),
   * which differ from the stats request's own field names. */
  buildListLinkParams: (args: {
    cohort: JourneyCohortDates | null;
    filterValue: string | null;
  }) => Record<string, string>;
};

/**
 * Shared shape for every V5 journey chart: paint the definition immediately, fill counts
 * in as they arrive, offer one cohort segment filter alongside the date range. Domain
 * differences (which field is filtered, how it's labelled, where a bucket drills down
 * to) are all passed in as props — this component owns none of that (conventions §17).
 *
 * Counts are live partition membership, so the SWR key is cache-busted per mount — a
 * stable key would paint stale numbers while a fresh request runs. The definition is
 * shape only and may stay cached.
 */
function JourneyV5Buckets<
  TReq extends Record<string, unknown>,
  TRes extends JourneyV5StatsResponse,
>({
  swrKeyPrefix,
  errorLabel,
  totalLabel,
  listLinkPrefix,
  initialRange,
  rangeLabel,
  rangeTooltip,
  filterId,
  filterLabel,
  filterPlaceholder,
  filterOptions,
  filterAllValue = 'all',
  fetchDefinition,
  fetchStatistics,
  buildRequest,
  buildListLinkParams,
}: JourneyV5BucketsProps<TReq, TRes>) {
  const countsCacheBust = React.useRef(Date.now() + Math.random());
  const { range, setRange, cohort, isPartialRange } =
    useJourneyCohortRange(initialRange);
  const [filterValue, setFilterValue] = React.useState<string>(filterAllValue);
  const activeFilterValue = filterValue !== filterAllValue ? filterValue : null;

  const request = buildRequest({ cohort, filterValue: activeFilterValue });

  // Same cohort and filter the counts were computed from, so a bucket's number and its
  // drill-down link never disagree — appended to every bucket below rather than once,
  // since the list page reads its filters from its own URL, not from a shared session.
  const listLinkParams = new URLSearchParams(
    buildListLinkParams({ cohort, filterValue: activeFilterValue }),
  ).toString();

  const { data: definitionData, error: definitionError } = useSWR(
    `${swrKeyPrefix}-definition`,
    fetchDefinition,
  );

  const { data, error } = useSWR(
    [
      swrKeyPrefix,
      countsCacheBust.current,
      cohort?.start_date ?? null,
      cohort?.end_date ?? null,
      filterValue,
    ],
    () => fetchStatistics(request),
  );

  const definition = definitionData?.definition ?? data?.definition;
  const loadError = definitionError ?? error;

  if (loadError) {
    return (
      <Section $fullWidth>
        <Text>
          Could not load {errorLabel}: {String(loadError)}
        </Text>
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
          <FilterSelect
            id={filterId}
            label={filterLabel}
            value={filterValue}
            options={[
              { value: filterAllValue, label: 'All' },
              ...filterOptions,
            ]}
            onValueChange={(value: string) => setFilterValue(value)}
            placeholder={filterPlaceholder}
            cannotError
            maxWidth="180px"
          />
          <JourneyCohortRangePicker
            label={rangeLabel}
            tooltipText={rangeTooltip}
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
                        linkTo={`${listLinkPrefix}${bucket.list_id}${listLinkParams ? `&${listLinkParams}` : ''}`}
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
          {totalLabel}: <Count count={data?.summed_count} /> / baseline{' '}
          <Count count={data?.baseline_count} />
          {data && !data.balanced ? ' (unbalanced)' : ''}
        </Text>
      </SectionCard>
    </Section>
  );
}

export default JourneyV5Buckets;
