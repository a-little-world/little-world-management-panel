import {
  Card,
  ChevronRightIcon,
  Link,
  MessageTypes,
  StatusMessage,
  Text,
  TextTypes,
} from '@a-little-world/little-world-design-system';
import { isNumber } from 'lodash';
import React from 'react';
import styled from 'styled-components';
import useSWR from 'swr';

import { DatePicker } from '../../atoms/DatePicker';
import {
  HoverCard,
  HoverCardContent,
  HoverCardTrigger,
} from '../../atoms/HoverCard';
import LoadingSpinner from '../../atoms/LoadingSpinner';
import { cratePostFetcher } from '../../store';
import { BarChartCounts } from '../BarChartCounts';
import DataGraph from '../DataGraph';
import { graphEndpoints } from './RangedDataGraph';
import {
  UserSignUpLossStatistic,
  UserSignUpLossStatisticMonthly,
} from './UserSignUpLossStatistic';
import { matchJourneyBuckets, userJourneyBuckets } from './buckets';

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

const SectionR = styled.div<{ $fullWidth?: boolean }>`
  margin-bottom: ${({ theme }) => theme.spacing.small};
  display: flex;
  flex-direction: row;
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

const SubBucket = styled.li`
  gap: ${({ theme }) => theme.spacing.xxsmall};
  display: flex;
  align-items: center;
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

const Count = ({ count, label }) => (
  <>
    {isNumber(count) ? (
      <Text tag="span" bold={!!label}>
        {label ? `${label}: ${count}` : `(${count})`}
      </Text>
    ) : (
      <LoadingSpinner inline="true" />
    )}
  </>
);

export function HoverableLiveListDescription({
  title,
  description,
  linkTo,
  count,
  showCount = true,
}) {
  return (
    <HoverCard>
      <HoverCardTrigger asChild>
        <Link to={linkTo} className="flex ">
          <>
            <span>{title}</span>
            {showCount && (
              <>
                {' '}
                <Count count={count} />
              </>
            )}
          </>
        </Link>
      </HoverCardTrigger>
      <HoverCardContent>
        <Text>{description}</Text>
        <Count count={count} label={'Current users'} />
      </HoverCardContent>
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
      </SectionCard>
    </Section>
  );
}

export function DynamicUserInfluxOverview() {
  const today = new Date();
  const startDate = new Date(Date.now() - 4 * 7 * 24 * 60 * 60 * 1000); // 4 weeks ago
  const random = Math.floor(Math.random() * 1000);
  const { mutate, error, data, isLoading } = useSWR(
    `/api/matching/users/statistics/signups/?random=${random.toString()}`,
    cratePostFetcher({
      start_date: startDate.toISOString().split('T')[0],
      end_date: today.toISOString().split('T')[0],
      bucket_size: 7,
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
        <Stat>
          <KeyStat
            stat={extraMatchCounts['match_journey_v2__completed_match']?.count}
          />
          <StatDescription>Completed Matchings</StatDescription>
        </Stat>
      </StatsGrouping>
    </SectionCard>
  </Section>
);

export function DownloadCenter() {
  const [startDate, setStartDate] = React.useState('2021-01-01');
  const today = new Date();
  const [endDate, setEndDate] = React.useState(
      today.toISOString().split('T')[0],
  );

  const { data: userSignUpLossStatisticData, mutate } = useSWR(
      '/api/matching/users/statistics/user_signup_loss/',
        cratePostFetcher({
          start_date: startDate,
          end_date: endDate,
        }),
    {},
  );
  
  const onDownload = () => {
    // should start a json Download
    console.log('Download');
    
    const downloadData = JSON.stringify(userSignUpLossStatisticData);
    const blob = new Blob([downloadData], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'user_signup_loss.json';
    a.click();
  }
  
  return (
      <div className="flex flex-col">
        <SectionTitle type={TextTypes.Body4} tag="h2">
          Download Center
        </SectionTitle>
        <div className="w-full flex flex-row">
          <div>
            <SectionTitle type={TextTypes.Body4} tag="h2">
              User Sign-Up Loss Statistics
            </SectionTitle>
            <Text tag="p">This data is cleaned and buckets should be 'destinct' there is a duplication check performed by the backend, found duplicates would be outputted in 'intersecting_ids_lists' some lists maybe be ignored like 'all' they are also listed.</Text>
            <button onClick={onDownload} className="btn btn-primary">Download</button>
          </div>
          <div>
            <SectionTitle type={TextTypes.Body4} tag="h2">
              User Sign-Up Loss Statistics
            </SectionTitle>
            <Text tag="p">This data is cleaned and buckets should be 'destinct' there is a duplication check performed by the backend, found duplicates would be outputted in 'intersecting_ids_lists' some lists maybe be ignored like 'all' they are also listed.</Text>
            <button onClick={onDownload} className="btn btn-primary">Download</button>
            <div className="flex flex-row">
              <DatePicker
                  date={startDate}
                  setDate={date => {
                      setStartDate(date);
                      setTimeout(() => {
                          mutate();
                      }, 500);
                  }}
              />
              <DatePicker
                  date={endDate}
                  setDate={date => {
                      setEndDate(date);
                      setTimeout(() => {
                          mutate();
                      }, 500);
                  }}
              />
            </div>
          </div>
        </div>
    </div>
  )
}

export function MatchUserJourneyOverview() {
  const allBuckets = userJourneyBuckets.flatMap(bucket => bucket.sub_buckets);
  const allBucketIds = allBuckets.map(bucket => bucket.id);
  const extraBucketIds = [
    'needs_matching',
    'needs_matching_volunteers',
    'all',
    'journey_v2__active_matching',
  ];

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
    'match_journey_v2__completed_match',
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
      <SectionR>
        <UserSignUpLossStatistic />
      </SectionR>
      <SectionR>
        <UserSignUpLossStatisticMonthly
          startingMonth="2024-01-01"
          title="January 2024"
        />
        <UserSignUpLossStatisticMonthly
          startingMonth="2024-02-01"
          title="Feb 2024"
        />
        <UserSignUpLossStatisticMonthly
          startingMonth="2024-03-01"
          title="March 2024"
        />
        <UserSignUpLossStatisticMonthly
          startingMonth="2024-04-01"
          title="April 2024"
        />
      </SectionR>
      <SectionR>
        <UserSignUpLossStatisticMonthly
          startingMonth="2024-05-01"
          title="May 2024"
        />
        <UserSignUpLossStatisticMonthly
          startingMonth="2024-06-01"
          title="June 2024"
        />
        <UserSignUpLossStatisticMonthly
          startingMonth="2024-07-01"
          title="July 2024"
        />
        <UserSignUpLossStatisticMonthly
          startingMonth="2024-08-01"
          title="August 2024"
        />
      </SectionR>
      <DownloadCenter />
    </Container>
  );
}
