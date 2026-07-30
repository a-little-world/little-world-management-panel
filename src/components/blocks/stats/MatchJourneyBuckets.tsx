import * as React from 'react';
import useSWR from 'swr';

import { cratePostFetcher } from '../../../store';
import { BucketOverview } from './UserJourneyBuckets';
import { matchJourneyBucketsV4 } from './buckets';

export function MatchJourneyOverview() {
  const allBuckets = matchJourneyBucketsV4.flatMap(
    bucket => bucket.sub_buckets,
  );
  const allBucketIds = allBuckets.map(bucket => bucket.id);
  const extraBucketIds = [
    'match_journey_v2__match_ongoing',
    'match_journey_v2__match_free_play',
    'EXTRA__suggestion_match_completed_on_plattform',
    'EXTRA__suggestion_match_completed_off_plattform',
  ];

  const random = React.useRef(Date.now() + Math.random());

  const { data: _userListCounts } = useSWR(
    '/api/matching/users/statistics/match_journey_buckets/' +
      '?random=' +
      random.current,
    cratePostFetcher({
      selected_filters: allBucketIds.concat(extraBucketIds),
    }),
    {},
  );

  const userListCounts = _userListCounts?.buckets;

  let extraCounts = {};
  if (userListCounts) {
    for (let i = 0; i < userListCounts.length; i++) {
      if (extraBucketIds.includes(userListCounts[i].name))
        extraCounts[userListCounts[i].name] = userListCounts[i];
    }
  }

  return (
    <BucketOverview
      buckets={matchJourneyBucketsV4}
      bucketLink="/matches/?list"
      listCounts={userListCounts}
      excludeBucketsTotalSum={[
        'match_journey_v2__proposed_matches',
        'match_journey_v2__expired_proposals',
      ]}
      allBuckets={allBuckets}
      intersectingLists={_userListCounts?.intersecting_ids_lists}
      title="The Match Journey V4"
      showStatus
      description="Radically simplified per-match, buckets:"
    />
  );
}
