import {
  Card,
  ChevronRightIcon,
  Link,
  StatusMessage,
  Text,
  TextTypes,
} from '@a-little-world/little-world-design-system';
import { MessageTypes } from '@a-little-world/little-world-design-system/dist/esm/components/StatusMessage/StatusMessage';
import React from 'react';
import styled from 'styled-components';
import useSWR from 'swr';

import {
  HoverCard,
  HoverCardContent,
  HoverCardTrigger,
} from '../../atoms/HoverCard';
import { cn } from '../../lib/utils';
import { cratePostFetcher } from '../../store';
import DataGraph from '../DataGraph';
import { graphEndpoints } from './RangedDataGraph';
import { matchJourneyBuckets, userJourneyBuckets } from './buckets';

const spinnerVariants =
  'w-[10px] h-[10px] border-4 border-t-4 border-gray-200 border-t-gray-600 rounded-full animate-spin';

const SectionTitle = styled(Text)`
  font-weight: bold;
  margin-bottom: ${({ theme }) => theme.spacing.small};
`;

const Container = styled.div`
  padding: ${({ theme }) => theme.spacing.small};
`;

const Sections = styled.div`
  display: flex;
  gap: ${({ theme }) => theme.spacing.medium};
  flex-wrap: wrap;
`;

const Section = styled.div<{ $fullWidth?: boolean }>`
  margin-bottom: ${({ theme }) => theme.spacing.small};
  display: flex;
  flex-direction: column;
  flex: 1;

  ${({ $fullWidth }) =>
    $fullWidth &&
    `
    flex: 1 0 100%;
    width: 100%`}
`;

const SectionCard = styled(Card)`
  flex: 1;
`;

const Description = styled(Text)`
  margin-bottom: ${({ theme }) => theme.spacing.large};
`;

const BucketsContainer = styled.ul`
  display: flex;
  gap: ${({ theme }) => theme.spacing.large};
  margin-top: ${({ theme }) => theme.spacing.small};
`;

const Bucket = styled.li`
  gap: ${({ theme }) => theme.spacing.xxsmall};
  display: flex;
  flex-direction: column;
`;

const StatsGrouping = styled.ul`
  display: flex;
  gap: ${({ theme }) => theme.spacing.small};
  align-items: flex-start;
`;

const Stat = styled.li`
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  text-align: center;
  gap: ${({ theme }) => theme.spacing.xxsmall};
  flex: 1;
`;

const StatDescription = styled(Text)``;
const Number = styled(Text)`
  line-height: 1;
  color: ${({ theme }) => theme.color.text.title};
`;

const StyledChevron = styled(ChevronRightIcon)`
  color: ${({ theme }) => theme.color.text.accent};
`;

const LoadingSpinner = React.forwardRef((props, ref) => {
  const { className = '', ...rest } = props;
  const size = '1em';
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width={size}
      height={size}
      {...props}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={cn('animate-spin', className)}
    >
      <path d="M21 12a9 9 0 1 1-6.219-8.56" />
    </svg>
  );
});

export function HoverableLiveListDescription({
  title,
  description,
  linkTo,
  count = -1,
  showCount = true,
}) {
  return (
    <HoverCard>
      <HoverCardTrigger className="flex flex-row w-fit">
        <Link to={linkTo} className={'flex flex-row text-nowrap'}>
          {title}
        </Link>
        {/* {showCount && <>{count === -1 ? <LoadingSpinner /> : count}</>},{' '} */}
      </HoverCardTrigger>
      <HoverCardContent>{description}</HoverCardContent>
    </HoverCard>
  );
}

export function DynamicBuckets({
  buckets,
  listCounts,
  bucketLink,
  title,
  description,
  showStatus,
}) {
  return (
    <Section $fullWidth>
      <SectionTitle type={TextTypes.Body4} tag="h2">
        {title}
      </SectionTitle>
      {showStatus && (
        <StatusMessage $type={MessageTypes.Error} $visible>
          ⚠️ The User Journey V2 is still in development, we are aware of some
          wrong list and will report when there are ready for user testing
        </StatusMessage>
      )}
      <SectionCard>
        <Text>{description}</Text>
        <BucketsContainer>
          {buckets.map((bucket, index) => {
            return (
              <>
                <Bucket key={bucket.id}>
                  <Text bold>{`${index + 1} ${bucket.title}:`}</Text>
                  {bucket.sub_buckets.map(sub_bucket => {
                    const count =
                      listCounts?.find(item => item.name === sub_bucket.id)
                        ?.count ?? -1;
                    return (
                      <>
                        <HoverableLiveListDescription
                          title={`• ${sub_bucket.title}`}
                          description={sub_bucket.description}
                          linkTo={`${bucketLink}=${sub_bucket.id}`}
                          count={count}
                        />
                      </>
                    );
                  })}
                </Bucket>
                {userJourneyBuckets.length !== index + 1 && <StyledChevron />}
              </>
            );
          })}
        </BucketsContainer>
      </SectionCard>
    </Section>
  );
}

export function DynamicUserInfluxOverview() {
  const today = new Date();
  const startDate = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000); // 7 days ago
  const { mutate, error, data, isLoading } = useSWR(
    graphEndpoints[0].endpoint,
    cratePostFetcher({
      start_date: startDate.toISOString().split('T')[0],
      end_date: today.toISOString().split('T')[0],
      bucket_size: 1,
    }),
    {},
  );

  return (
    <Section>
      <SectionTitle type={TextTypes.Body4} tag="h2">
        User Influx
      </SectionTitle>
      <SectionCard>
        <DataGraph
          data={data}
          dataLabel={'New registrations in the last week'}
          maxHeight="240px"
          minHeight="auto"
        />
      </SectionCard>
    </Section>
  );
}

const KeyStat = ({ stat }: { stat?: number }) => (
  <Number bold type={TextTypes.Heading3}>
    {stat ?? <LoadingSpinner />}
  </Number>
);

const MatchingOverview = ({ extraCounts, extraMatchCounts }) => (
  <Section>
    <SectionTitle tag="h2" type={TextTypes.Body4}>
      Matching
    </SectionTitle>
    <SectionCard>
      <StatsGrouping>
        <Stat>
          <KeyStat stat={extraCounts['needs_matching']?.count} />
          <StatDescription>
            {`No. of users that need matching.
            <bold>${
              (extraCounts['needs_matching']?.count ?? 0) -
              (extraCounts['needs_matching_volunteers']?.count ?? 0)
            } Learners</bold>
            <bold>${
              extraCounts['needs_matching_volunteers']?.count ?? 0
            } Volunteers</bold>`}
          </StatDescription>
        </Stat>
        <Stat>
          <KeyStat
            stat={extraMatchCounts['match_journey_v2__match_ongoing']?.count}
          />
          <StatDescription>
            Ongoing matchings: matches in their first 10 weeks and have
            interacted within the last 3 weeks.
          </StatDescription>
        </Stat>
        <Stat>
          <KeyStat
            stat={extraMatchCounts['match_journey_v2__match_free_play']?.count}
          />
          <StatDescription>
            Free-play matchings: matches still interacting but already past
            their first 10 weeks.
          </StatDescription>
        </Stat>
      </StatsGrouping>
    </SectionCard>
  </Section>
);

export function MatchUserJourneyOverview() {
  const allBuckets = userJourneyBuckets.flatMap(bucket => bucket.sub_buckets);
  const allBucketIds = allBuckets.map(bucket => bucket.id);
  const extraBucketIds = ['needs_matching', 'needs_matching_volunteers'];

  const { data: userListCounts } = useSWR(
    '/api/matching/users/statistics/user_journey_buckets/',
    cratePostFetcher({
      selected_filters: allBucketIds.concat(extraBucketIds),
    }),
    {},
  );

  const allMatchBuckets = matchJourneyBuckets.flatMap(
    bucket => bucket.sub_buckets,
  );
  const allMatchBucketIds = allMatchBuckets.map(bucket => bucket.id);
  const extraMatchBucketIds = [
    'match_journey_v2__match_ongoing',
    'match_journey_v2__match_free_play',
  ];

  const { data: matchJourneyListCounts } = useSWR(
    '/api/matching/users/statistics/match_journey_buckets/',
    cratePostFetcher({
      selected_filters: allMatchBucketIds.concat(extraMatchBucketIds),
    }),
    {},
  );

  let extraCounts = {};
  if (userListCounts) {
    for (let i = 0; i < userListCounts.length; i++) {
      if (extraBucketIds.includes(userListCounts[i].name))
        extraCounts[userListCounts[i].name] = userListCounts[i];
    }
  }

  let extraMatchCounts = {};
  if (matchJourneyListCounts) {
    for (let i = 0; i < matchJourneyListCounts.length; i++) {
      if (extraMatchBucketIds.includes(matchJourneyListCounts[i].name))
        extraMatchCounts[matchJourneyListCounts[i].name] =
          matchJourneyListCounts[i];
    }
  }

  console.log({ extraCounts });

  return (
    <Container>
      <Text type={TextTypes.Body3} center bold tag="h1">
        Little World Statistics & User Journey Overview
      </Text>
      <Description center>
        {`All the numbers in these overviews <bold>are live statistics</bold> and are <bold>filtered down to the current users access</bold>.`}
      </Description>
      <Sections>
        <DynamicUserInfluxOverview />
        <MatchingOverview
          extraCounts={extraCounts}
          extraMatchCounts={extraMatchCounts}
        />

        <DynamicBuckets
          buckets={userJourneyBuckets}
          bucketLink="/users/?list"
          listCounts={userListCounts}
          title="The User Journey"
          showStatus
          description="We currently define our user journey in the following buckets:"
        />

        <DynamicBuckets
          buckets={matchJourneyBuckets}
          bucketLink="/matches/?list"
          listCounts={matchJourneyListCounts}
          title="The Match Journey"
          description="We currently define our match journey in the following buckets:"
        />
      </Sections>
    </Container>
  );
}
