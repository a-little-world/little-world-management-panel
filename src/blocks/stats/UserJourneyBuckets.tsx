
import * as React from 'react';
import {
  Button,
  Card,
  CardHeader,
  Modal,
  Text,
  TextTypes
} from '@a-little-world/little-world-design-system';
import { cratePostFetcher } from '../../store';
import { matchJourneyBuckets, matchJourneyBucketsV4, userJourneyBuckets, userJourneyBucketsV4 } from './buckets'
import { Section, SectionTitle, SectionCard, BucketsContainer, SubBucket, Bucket, HoverableLiveListDescription, DetailsOpenLink, StyledChevron } from './MatchUserJourneyOverview';
import useSWR from 'swr';

export function DetailsDialog({
  open,
  onClose,
  children,
}: {
  open: boolean;
  onClose: () => void;
  children: React.ReactNode;
}) {
  return (
    <Modal open={open} onClose={onClose}>
      <Card height={'100%'}>
        <CardHeader>Details:</CardHeader>
        {children}
      </Card>
    </Modal>
  );
}

export function BucketOverview({
  buckets,
  listCounts,
  bucketLink,
  title,
  description,
  showStatus,
  predicate="users",
  allBuckets=[],
  missingIds=[],
  intersectingLists={},
  excludeBucketsTotalSum=[],
}) {
  const [detailsVisible, setDetailsVisible] = React.useState(false);
  const categorieTotalCounts = {};
  var totalCount = 0;
  for (let bucket of buckets) {
    let bucketTotalCount = 0;
    for(let sub_bucket of bucket.sub_buckets) {
      const count = listCounts?.find(
        item => item.name === sub_bucket.id,
      )?.count;
      if(count && !excludeBucketsTotalSum.includes(sub_bucket.id)){
        bucketTotalCount += count;
        totalCount += count;
      }
    }
    categorieTotalCounts[bucket.id] = bucketTotalCount;
  }
  var totalOverlaps = 0
  for (const [key, value] of Object.entries(intersectingLists)) {
    totalOverlaps += value.length;
  }
  return <>
    <DetailsDialog
    open={detailsVisible}
    onClose={() => setDetailsVisible(false)}
    children={<>
      All buckets: {JSON.stringify(allBuckets.map(bucket => bucket.id))}
      <ol>
          {userJourneyBucketsV4.map((bucket, index) => {
            return bucket.sub_buckets.map(sub_bucket => {
              const item = listCounts?.find(
                item => item.name === sub_bucket.id,
              )
        
              return (
                <li>
                  <Text bold>{`${sub_bucket.title}:`}</Text>
                  <Text>Query duration: {`${item?.query_duration}`}</Text> 
                </li>
              )
            })
          })}
        </ol>
        <Text bold>Overlaps:</Text>
      <ol>
          {intersectingLists && Object.keys(intersectingLists).map((item) => {
            return (
              <li>
                <Text>{item}: {intersectingLists[item].join(",")}</Text>
              </li>
            )
          })}
      </ol>
        <Text bold>Missing Ids: (count: {missingIds.length})</Text>
        {JSON.stringify(missingIds.missing_ids)}
    </>}
  />
    <Section $fullWidth>
      <SectionTitle type={TextTypes.Body4} tag="h2">
        {title}
      </SectionTitle>
      <SectionCard>
        <Text>{description}</Text>
        <BucketsContainer>
          {buckets.map((bucket, index) => {
            return (
              <>
                <Bucket key={bucket.id}>
                  <Text bold>{`${index + 1} ${bucket.title}: (total: ${categorieTotalCounts[bucket.id]})`}</Text>
                  {bucket.sub_buckets.map(sub_bucket => {
                    const count = listCounts?.find(
                      item => item.name === sub_bucket.id,
                    )?.count;
                    return (
                      <SubBucket>
                        •
                        <HoverableLiveListDescription
                          title={`${sub_bucket.title}`}
                          description={sub_bucket.description}
                          linkTo={`${bucketLink}=${sub_bucket.id}`}
                          count={count}
                        />
                      </SubBucket>
                    );
                  })}
                </Bucket>
                {userJourneyBuckets.length !== index + 1 && <StyledChevron />}
              </>
            );
          })}
        </BucketsContainer>
        <div className='flex flex-row'>
          <Text bold>Total summed {predicate}: {totalCount} ( missing {predicate}: {missingIds.length}, {totalOverlaps} overlaps in {Object.keys(intersectingLists).length} buckets)</Text>
          <div className="flex space-x-4" />
          <DetailsOpenLink title="details" description={"Click to se query / overlap details"} onClick={() => {
            setDetailsVisible(!detailsVisible);
          }}/>
        </div>
      </SectionCard>
    </Section>
</>
}

export function UserJourneyBucketsOverview() {
    const [detailsVisible, setDetailsVisible] = React.useState(false);
    const allBuckets = userJourneyBucketsV4.flatMap(bucket => bucket.sub_buckets);
    const allBucketIds = allBuckets.map(bucket => bucket.id);
    const extraBucketIds = [
      'all',
    ];
  
    const random = React.useRef(Date.now() + Math.random());
  
    const { data: _userListCounts } = useSWR(
      '/api/matching/users/statistics/user_journey_buckets/' + "?random=" + random.current,
      cratePostFetcher({
        selected_filters: allBucketIds.concat(extraBucketIds),
      }),
      {},
    );
    
    const userListCounts = _userListCounts?.buckets
    const intersectingLists = _userListCounts?.intersecting_ids_lists;
  
    let extraCounts = {};
    if (userListCounts) {
      for (let i = 0; i < userListCounts.length; i++) {
        if (extraBucketIds.includes(userListCounts[i].name))
          extraCounts[userListCounts[i].name] = userListCounts[i];
      }
    }
    
    return <BucketOverview
          buckets={userJourneyBucketsV4}
          bucketLink="/users/?list"
          listCounts={userListCounts}
          allBuckets={allBuckets}
          intersectingLists={_userListCounts?.intersecting_ids_lists}
          title="The User Journey V4"
          showStatus
          description="Radically simplified user journey, buckets:"
        />
  }
  