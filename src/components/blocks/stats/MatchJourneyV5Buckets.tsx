import * as React from 'react';

import {
  fetchMatchJourneyV5,
  fetchMatchJourneyV5Definition,
  type MatchJourneyMatchType,
  type MatchJourneyV5Request,
  type MatchJourneyV5Response,
} from '../../../api/matchJourney';
import JourneyV5Buckets from './JourneyV5Buckets';

const MATCH_TYPE_OPTIONS: { value: MatchJourneyMatchType; label: string }[] = [
  { value: 'standard', label: 'Standard' },
  { value: 'random_call', label: 'Random Calls' },
];

function MatchJourneyV5Buckets() {
  return (
    <JourneyV5Buckets<MatchJourneyV5Request, MatchJourneyV5Response>
      swrKeyPrefix="match-journey-v5"
      errorLabel="Match Journey V5"
      totalLabel="Total summed matches"
      listLinkPrefix="/matches/?list="
      initialRange={null}
      rangeLabel="Match created between"
      rangeTooltip="Matches created in this range. Leave empty, or choose All time, for every match. Buckets show current state, not state on those dates."
      filterId="match-journey-v5-source"
      filterLabel="Source"
      filterPlaceholder="Source"
      filterOptions={MATCH_TYPE_OPTIONS}
      fetchDefinition={fetchMatchJourneyV5Definition}
      fetchStatistics={fetchMatchJourneyV5}
      buildRequest={({ cohort, filterValue }) => ({
        ...(cohort ?? {}),
        ...(filterValue
          ? { match_type: filterValue as MatchJourneyMatchType }
          : {}),
      })}
      buildListLinkParams={({ cohort, filterValue }) => ({
        ...(cohort
          ? {
              created_between_after: cohort.start_date,
              created_between_before: cohort.end_date,
            }
          : {}),
        ...(filterValue ? { match_type: filterValue } : {}),
      })}
    />
  );
}

export default MatchJourneyV5Buckets;
