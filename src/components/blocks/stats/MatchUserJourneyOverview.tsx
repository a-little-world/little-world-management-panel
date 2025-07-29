import {
  Card,
  ChevronRightIcon,
  Link,
  Text,
  TextTypes,
} from '@a-little-world/little-world-design-system';
import { isNumber } from 'lodash';
import React from 'react';
import styled from 'styled-components';
import useSWR from 'swr';

import { cratePostFetcher } from '../../../store';
import { DatePicker } from '../../atoms/DatePicker';
import {
  HoverCard,
  HoverCardContent,
  HoverCardTrigger,
} from '../../atoms/HoverCard';
import LoadingSpinner from '../../atoms/LoadingSpinner';
import Stat from '../../atoms/Stats/Stat';
import { DataGraphTwoCounts } from '../DataGraph';
import { MatchJourneyOverview } from './MatchJourneyBuckets';
import { UserJourneyBucketsOverview } from './UserJourneyBuckets';
import { UserSignUpLossStatistic } from './UserSignUpLossStatistic';
import { matchJourneyBuckets, userJourneyBuckets } from './buckets';

export const SectionTitle = styled(Text)`
  font-weight: bold;
  margin-bottom: ${({ theme }) => theme.spacing.small};
`;

export const Container = styled.div`
  padding: ${({ theme }) => theme.spacing.small};
`;

export const Sections = styled.div`
  display: flex;
  gap: ${({ theme }) => theme.spacing.medium};
  flex-wrap: wrap;
`;

export const Section = styled.div<{ $fullWidth?: boolean }>`
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

export const SectionR = styled.div<{ $fullWidth?: boolean }>`
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

export const SectionCard = styled(Card)`
  flex: 1;
`;

export const Description = styled(Text)`
  margin-bottom: ${({ theme }) => theme.spacing.large};
`;

export const BucketsContainer = styled.ul`
  display: flex;
  gap: ${({ theme }) => theme.spacing.large};
  margin-top: ${({ theme }) => theme.spacing.small};
`;

export const Bucket = styled.li`
  gap: ${({ theme }) => theme.spacing.xxsmall};
  display: flex;
  flex-direction: column;
`;

export const SubBucket = styled.li`
  gap: ${({ theme }) => theme.spacing.xxsmall};
  display: flex;
  align-items: center;
`;

export const StatsGrouping = styled.ul`
  display: flex;
  gap: ${({ theme }) => theme.spacing.small};
  align-items: flex-start;
`;

export const StyledChevron = styled(ChevronRightIcon)`
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

export function DetailsOpenLink({ title, description, onClick = () => {} }) {
  return (
    <HoverCard>
      <HoverCardTrigger asChild>
        <Link onClick={onClick} className="flex ">
          <>
            <span>{title}</span>
          </>
        </Link>
      </HoverCardTrigger>
      <HoverCardContent>
        <Text>{description}</Text>
      </HoverCardContent>
    </HoverCard>
  );
}

export function DynamicBucketsV2({
  buckets,
  listCounts,
  intersectingLists,
  bucketLink,
  title,
  description,
  showStatus,
  excludeBucketsTotalSum = [],
}) {
  const [detailsVisible, setDetailsVisible] = React.useState(false);
  const categorieTotalCounts = {};
  var totalCount = 0;
  for (let bucket of buckets) {
    let bucketTotalCount = 0;
    for (let sub_bucket of bucket.sub_buckets) {
      const count = listCounts?.find(
        item => item.name === sub_bucket.id,
      )?.count;
      if (count && !excludeBucketsTotalSum.includes(sub_bucket.id)) {
        bucketTotalCount += count;
        totalCount += count;
      }
    }
    categorieTotalCounts[bucket.id] = bucketTotalCount;
  }
  return (
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
                  <Text bold>{`${index + 1} ${bucket.title}: (total: ${
                    categorieTotalCounts[bucket.id]
                  })`}</Text>
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
        <Text bold>Total summed: {totalCount}</Text>
        {detailsVisible && <></>}
      </SectionCard>
    </Section>
  );
}

export function DynamicUserInfluxOverview({ data }) {
  return (
    <Section>
      <SectionTitle type={TextTypes.Body4} tag="h2">
        User Influx
      </SectionTitle>
      <SectionCard>
        <DataGraphTwoCounts
          data={data}
          dataLabel={'New registrations in the last week'}
          maxHeight="240px"
          minHeight="auto"
        />
      </SectionCard>
    </Section>
  );
}

const MatchingOverview = ({ extraCounts, extraMatchCounts }) => (
  <Section>
    <SectionTitle tag="h2" type={TextTypes.Body4}>
      Matching
    </SectionTitle>
    <SectionCard>
      <StatsGrouping>
        <Stat
          stat={extraCounts['needs_matching']?.count}
          label={`No. of users that need matching.
            <bold>${
              (extraCounts['needs_matching']?.count ?? 0) -
              (extraCounts['needs_matching_volunteers']?.count ?? 0)
            } Learners</bold>
            <bold>${
              extraCounts['needs_matching_volunteers']?.count ?? 0
            } Volunteers</bold>`}
        />

        <Stat
          stat={extraMatchCounts['match_journey_v2__match_ongoing']?.count}
          label={
            'Ongoing matchings: matches in their first 10 weeks and have interacted within the last 3 weeks.'
          }
        />

        <Stat
          stat={extraMatchCounts['match_journey_v2__match_free_play']?.count}
          label={
            'Free-play matchings: matches still interacting but already past their first 10 weeks.'
          }
        />
        <Stat
          stat={extraMatchCounts['match_journey_v2__completed_match']?.count}
          label="Completed Matchings"
        />
      </StatsGrouping>
    </SectionCard>
  </Section>
);

export function UserLossStatisticDownloadBlock() {
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
  };

  return (
    <div>
      <SectionTitle type={TextTypes.Body4} tag="h2">
        User Sign-Up Loss Statistics
      </SectionTitle>
      <Text tag="p">
        This data is cleaned and buckets should be 'destinct' there is a
        duplication check performed by the backend, found duplicates would be
        outputted in 'intersecting_ids_lists' some lists maybe be ignored like
        'all' they are also listed.
      </Text>
      <button onClick={onDownload} className="btn btn-primary">
        Download
      </button>
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
  );
}

export function AccentureReportDownloadBloack() {
  const [startDate, setStartDate] = React.useState('2021-01-01');
  const today = new Date();
  const [endDate, setEndDate] = React.useState(
    today.toISOString().split('T')[0],
  );

  const { data: accentureReport, mutate } = useSWR(
    '/api/matching/users/statistics/company_report/accenture/',
    cratePostFetcher({}),
    {},
  );

  const onDownload = () => {
    // should start a json Download
    console.log('Download');

    const text = accentureReport?.report ?? '';
    const blob = new Blob([text], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;

    a.download = 'accenture_report.txt';
    a.click();
  };

  return (
    <div>
      <SectionTitle type={TextTypes.Body4} tag="h2">
        Accenture Report
      </SectionTitle>
      <button onClick={onDownload} className="btn btn-primary">
        Download
      </button>
    </div>
  );
}

export function MatchQualitySatisticDownloadBlock() {
  const [startDate, setStartDate] = React.useState('2021-01-01');
  const today = new Date();
  const [endDate, setEndDate] = React.useState(
    today.toISOString().split('T')[0],
  );

  const { data: matchQualityStatistic, mutate } = useSWR(
    '/api/matching/users/statistics/match_quality/',
    cratePostFetcher({
      start_date: startDate,
      end_date: endDate,
    }),
    {},
  );

  const onDownload = () => {
    // should start a json Download
    console.log('Download');

    const downloadData = JSON.stringify(matchQualityStatistic);
    const blob = new Blob([downloadData], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'match_quality.json';
    a.click();
  };

  return (
    <div>
      <SectionTitle type={TextTypes.Body4} tag="h2">
        Match Quality Statistic
      </SectionTitle>
      <Text tag="p">
        This data is cleaned and buckets should be 'destinct' there is a
        duplication check performed by the backend, found duplicates would be
        outputted in 'intersecting_ids_lists' some lists maybe be ignored like
        'all' they are also listed.
      </Text>
      <button onClick={onDownload} className="btn btn-primary">
        Download
      </button>
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
  );
}

export function DownloadCenter() {
  return (
    <div className="flex flex-col">
      <SectionTitle type={TextTypes.Body4} tag="h2">
        Download Center
      </SectionTitle>
      <div className="w-full flex flex-row">
        <UserLossStatisticDownloadBlock />
        <AccentureReportDownloadBloack />
      </div>
    </div>
  );
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

  const random = React.useRef(Date.now() + Math.random());

  const { data: userListCounts } = useSWR(
    '/api/matching/users/statistics/user_journey_buckets/' +
      '?random=' +
      random.current,
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
    for (let i = 0; i < userListCounts?.buckets.length; i++) {
      if (extraBucketIds.includes(userListCounts?.buckets[i].name))
        extraCounts[userListCounts?.buckets[i].name] =
          userListCounts?.buckets[i];
    }
  }

  let extraMatchCounts = {};
  if (matchJourneyListCounts) {
    for (let i = 0; i < matchJourneyListCounts?.buckets.length; i++) {
      if (extraMatchBucketIds.includes(matchJourneyListCounts?.buckets[i].name))
        extraMatchCounts[matchJourneyListCounts?.buckets[i].name] =
          matchJourneyListCounts?.buckets[i];
    }
  }

  const today = new Date();
  const startDate = new Date(Date.now() - 12 * 7 * 24 * 60 * 60 * 1000); // 12 weeks ago
  const {
    mutate,
    error,
    data: userSignupsData,
    isLoading,
  } = useSWR(
    `/api/matching/users/statistics/signups/?random=${random.current}`,
    cratePostFetcher({
      start_date: startDate.toISOString().split('T')[0],
      end_date: today.toISOString().split('T')[0],
      bucket_size: 7,
    }),
    {},
  );

  return (
    <Container>
      <Text type={TextTypes.Body3} center bold tag="h1">
        Little World Statistics & User Journey Overview
      </Text>
      <Description center>
        {`All the numbers in these overviews <bold>are live statistics</bold> and are <bold>filtered down to the current users access</bold>.`}
      </Description>
      <Sections>
        <DynamicUserInfluxOverview data={userSignupsData} />
        <MatchingOverview
          extraCounts={extraCounts}
          extraMatchCounts={extraMatchCounts}
        />
        <UserJourneyBucketsOverview />
        <MatchJourneyOverview />
      </Sections>
      <SectionR>
        <UserSignUpLossStatistic />
      </SectionR>
      <DownloadCenter />
    </Container>
  );
}
