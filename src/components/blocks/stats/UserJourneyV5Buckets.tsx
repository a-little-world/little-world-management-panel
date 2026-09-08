import * as React from 'react';

import {
  fetchUserJourneyV5,
  fetchUserJourneyV5Definition,
  type UserJourneyUserType,
  type UserJourneyV5Request,
  type UserJourneyV5Response,
} from '../../../api/userJourney';
import {
  USER_JOURNEY_DEFAULT_START,
  localTodayYmd,
} from './JourneyCohortRange';
import JourneyV5Buckets from './JourneyV5Buckets';

const USER_TYPE_OPTIONS: { value: UserJourneyUserType; label: string }[] = [
  { value: 'volunteer', label: 'Volunteers' },
  { value: 'learner', label: 'Learners' },
];

function UserJourneyV5Buckets() {
  return (
    <JourneyV5Buckets<UserJourneyV5Request, UserJourneyV5Response>
      swrKeyPrefix="user-journey-v5"
      errorLabel="User Journey V5"
      totalLabel="Total summed users"
      listLinkPrefix="/users/?list="
      initialRange={{
        start_date: USER_JOURNEY_DEFAULT_START,
        end_date: localTodayYmd(),
      }}
      rangeLabel="Signed up between"
      rangeTooltip="Users who joined in this range. Buckets show their current state, not their state on those dates."
      filterId="user-journey-v5-user-type"
      filterLabel="User type"
      filterPlaceholder="User type"
      filterOptions={USER_TYPE_OPTIONS}
      fetchDefinition={fetchUserJourneyV5Definition}
      fetchStatistics={fetchUserJourneyV5}
      buildRequest={({ cohort, filterValue }) => ({
        ...(cohort ?? {}),
        ...(filterValue
          ? { user_type: filterValue as UserJourneyUserType }
          : {}),
      })}
      buildListLinkParams={({ cohort, filterValue }) => ({
        ...(cohort
          ? {
              joined_between_after: cohort.start_date,
              joined_between_before: cohort.end_date,
            }
          : {}),
        ...(filterValue ? { profile__user_type: filterValue } : {}),
      })}
    />
  );
}

export default UserJourneyV5Buckets;
