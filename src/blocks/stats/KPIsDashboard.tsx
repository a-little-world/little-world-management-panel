import {
  Card,
  CardFooter,
  ChevronRightIcon,
  Link,
  Text,
  TextTypes,
} from '@a-little-world/little-world-design-system';
import useSWR from 'swr';
import { isNumber } from 'lodash';
import React from 'react';
import styled from 'styled-components';

import LoadingSpinner from '../../atoms/LoadingSpinner';
import { BarChart } from '../../atoms/Stats/HorizontalBarChart';
import Matrix, { MatrixData } from '../../atoms/Stats/Matrix';
import StackedAreaChart from '../../atoms/Stats/StackedChart';
import StackedChart from '../../atoms/Stats/StackedChart';
import Stat from '../../atoms/Stats/Stat';
import { cratePostFetcher } from '../../store';
import { BarChartTimeRangedV2, MatchingFunnelEvolution, SignupFunnelEvolution } from './BarChartTimeRanged';
import { modifyDataToPercentages } from '../../helpers/stats';
import { MatchQuality } from './MatchQualityStatistic';
import { matchJourneyBuckets, userJourneyBuckets } from './buckets';

const fetcher = (...args) => fetch(...args).then(res => res.json());

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
  flex-direction: column;
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

const KPIsContainer = styled.div`
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: ${({ theme }) => theme.spacing.medium};
  padding: ${({ theme }) => theme.spacing.small};
  width: 100%;
`;

interface KPICardProps {
  color?: string;
}

const KPICard = styled(Card)<KPICardProps>`
  border: 2px solid ${({ color }) => color || 'gray'};
  background-color: ${({ color }) => `${color}10`};
  padding: ${({ theme }) => theme.spacing.medium};
  transition: all 0.3s ease;

  &:hover {
    box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
  }
`;

const KPITitle = styled(Text)<KPICardProps>`
  color: ${({ color }) => color || 'black'};
  font-weight: bold;
  margin-bottom: ${({ theme }) => theme.spacing.small};
`;

const StatsContainer = styled.div`
  gap: ${({ theme }) => theme.spacing.xsmall};
  margin-bottom: ${({ theme }) => theme.spacing.small};
`;

const StatsGrid = styled.div`
  display: grid;
  grid-template-columns: auto 1fr;
  gap: ${({ theme }) => theme.spacing.xxxxsmall};
  margin-bottom: ${({ theme }) => theme.spacing.xxsmall};
`;

const StatLabel = styled(Text)<{ $isHeading: boolean }>`
  text-align: left;
  color: ${({ theme, $isHeading }) =>
    $isHeading ? theme.color.text.primary : theme.color.text.secondary};
`;

const StatValue = styled(Text)<{ $isHeading: boolean }>`
  text-align: right;
  color: ${({ theme, $isHeading }) =>
    $isHeading ? theme.color.text.primary : theme.color.text.secondary};
`;

const Footnote = styled(Text)`
  font-style: italic;
  color: ${({ theme }) => theme.color.text.tertiary};
  text-align: center;
  margin-top: ${({ theme }) => theme.spacing.small};
`;

const MatchSection = styled.div`
  display: flex;
  gap: ${({ theme }) => theme.spacing.medium};
  flex-wrap: wrap;
`;

interface StatItem {
  label: string;
  value: string;
}

interface KPIProps {
  title: string;
  stats: StatItem[][];
  cells?: { title: string; content: string }[];
  footnote?: string;
  color?: string;
  matrixData?: MatrixData;
}

const KPI: React.FC<KPIProps> = ({
  title,
  matrixData,
  stats,
  footnote,
  color = '#3182CE',
}) => {
  return (
    <KPICard color={color}>
      <KPITitle tag="h3" color={color} center type={TextTypes.Heading6}>
        {title}
      </KPITitle>
      <StatsContainer>
        {matrixData ? (
          <Matrix {...matrixData} />
        ) : (
          stats.map((stat, i) => (
            <StatsGrid key={title + 'grid' + i}>
              {stat.map((item, index) => (
                <React.Fragment key={title + 'item' + index}>
                  <StatLabel $isHeading={!index}>{item.label}</StatLabel>
                  <StatValue bold $isHeading={!index}>
                    {item.value}
                  </StatValue>
                </React.Fragment>
              ))}
            </StatsGrid>
          ))
        )}
      </StatsContainer>
      {footnote && (
        <CardFooter>
          <Footnote>*{footnote}</Footnote>
        </CardFooter>
      )}
    </KPICard>
  );
};

const KPIs: React.FC = () => {
  // Load the current data 
  const { data: kpisDataUserSignup } = useSWR(
    '/api/matching/users/statistics/kpi_singup/',
    fetcher,
  );
  
  const { data: kpiDataMatches} = useSWR(
    '/api/matching/users/statistics/kpi_matching/',
    fetcher,
  );

  const { data: kpiDataSearching} = useSWR(
    '/api/matching/users/statistics/kpi_searching/',
    fetcher,
  );
  console.log('kpisData', kpisDataUserSignup);
  console.log('kpisDataMatches', kpiDataMatches);
  console.log('kpisDataSearching', kpiDataSearching);
  return (
    <KPIsContainer>
      <KPI
        title="Signup Funnel"
        stats={[
          [
            { label: 'Total Registered Users', value: kpisDataUserSignup  ?.total_registered_users },
            { label: 'Last 7 days', value: kpisDataUserSignup?.last_7_days },
            { label: '% Volunteers (last 7 days)', value: `${kpisDataUserSignup?.percent_volunteers_last_7_days}%` },
          ],
          [
            { label: '% Onboarded Users* (Total)', value: `${kpisDataUserSignup?.percent_onboarded_users}%` },
            { label: 'Signups der letzten 30 Tagen', value: kpisDataUserSignup?.signups_last_30_days },
          ],
        ]}
        footnote="Without too low german level"
        color="#48BB78"
      />
      <KPI
        title="Matching Quality"
        stats={[
          [
            {
              label: '% angenommenen Match proposals  (letzte 2-4 Wochen)',
              value: `${kpiDataMatches?.accepted_proposals_two_weeks_percentage}%`,
            },
          ],
          [
            {
              label: '% failed vs ongoing+finished Matches (total)',
              value: `${kpiDataMatches?.failed_vs_ongoing_finished_matches_percentage}%`,
            },
            {
              label: 'Matches gestartet vor 6 bis 12 Wochen',
              value: kpiDataMatches?.matches_started_6_12_weeks_ago,
            },
            {
              label: '% failed vs ongoing+finished Matches (6-12 Wochen)',
              value: `${kpiDataMatches?.matches_6_12_weeks_ago_failed_vs_ongoing_finished_percentage}%`,
            },
          ],
        ]}
        footnote="% failed vs ongoing+finished Matches = 100.0 - (% failed / Matches (total, ongoing+finished+failed+(in-progress)))"
        color="#ED8936"
      />
      <KPI
        title="Users Waiting"
        matrixData={{
          xLabels: [
            "Volunteers",
            "Learners",
          ],
          yLabels: ["users searching for 'first-match'", "users searching for 'another-match'"],
          cells: [
            { title: 'Volunteers', content: kpiDataSearching?.first_search_volunteers, color: '#4299E1' },
            { title: 'Learners', content: kpiDataSearching?.first_search_learners, color: '#4299E1' },
            { title: 'Volunteers', content: kpiDataSearching?.searching_again_volunteers, color: '#4299E1' },
            { title: 'Learners', content: kpiDataSearching?.searching_again_learners, color: '#4299E1' },
          ],
        }}
        color="#4299E1"
        footnote="Exludes users searching that have open proposals"
      />
    </KPIsContainer>
  );
};

const SIGN_UP_CONFIG = [
  { id: 'Finished', color: '#7acb6f' },
  { id: 'Ongoing', color: '#6a99cb' },
  { id: 'Failed', color: '#db776d' },
];

const MATCH_EVOLUTION_CONFIG = [
  { id: 'Onboarded Users', color: '#7acb6f' },
  { id: 'User Filled Form', color: '#6a99cb' },
  { id: 'Total Registered Users', color: '#84c7ec' },
];

function KPIsDashboard() {
  const allBuckets = userJourneyBuckets.flatMap(bucket => bucket.sub_buckets);
  const allBucketIds = allBuckets.map(bucket => bucket.id);
  const extraBucketIds = [
    'needs_matching',
    'needs_matching_volunteers',
    'all',
    'journey_v2__active_matching',
  ];

  // const random = React.useRef(Date.now() + Math.random());

  // const { data: userListCounts } = useSWR(
  //   '/api/matching/users/statistics/user_journey_buckets/' +
  //     '?random=' +
  //     random.current,
  //   cratePostFetcher({
  //     selected_filters: allBucketIds.concat(extraBucketIds),
  //   }),
  //   {},
  // );

  // const allMatchBuckets = matchJourneyBuckets.flatMap(
  //   bucket => bucket.sub_buckets,
  // );
  // const allMatchBucketIds = allMatchBuckets.map(bucket => bucket.id);
  // const extraMatchBucketIds = [
  //   'match_journey_v2__match_ongoing',
  //   'match_journey_v2__match_free_play',
  //   'match_journey_v2__completed_match',
  // ];

  // const { data: matchJourneyListCounts } = useSWR(
  //   '/api/matching/users/statistics/match_journey_buckets/',
  //   cratePostFetcher({
  //     selected_filters: allMatchBucketIds.concat(extraMatchBucketIds),
  //   }),
  //   {},
  // );

  // let extraCounts = {};
  // if (userListCounts) {
  //   for (let i = 0; i < userListCounts?.buckets.length; i++) {
  //     if (extraBucketIds.includes(userListCounts?.buckets[i].name))
  //       extraCounts[userListCounts?.buckets[i].name] =
  //         userListCounts?.buckets[i];
  //   }
  // }

  // let extraMatchCounts = {};
  // if (matchJourneyListCounts) {
  //   for (let i = 0; i < matchJourneyListCounts?.buckets.length; i++) {
  //     if (extraMatchBucketIds.includes(matchJourneyListCounts?.buckets[i].name))
  //       extraMatchCounts[matchJourneyListCounts?.buckets[i].name] =
  //         matchJourneyListCounts?.buckets[i];
  //   }
  // }

  // const today = new Date();
  // const startDate = new Date(Date.now() - 12 * 7 * 24 * 60 * 60 * 1000); // 12 weeks ago
  // const {
  //   mutate,
  //   error,
  //   data: userSignupsData,
  //   isLoading,
  // } = useSWR(
  //   `/api/matching/users/statistics/signups/?random=${random.current}`,
  //   cratePostFetcher({
  //     start_date: startDate.toISOString().split('T')[0],
  //     end_date: today.toISOString().split('T')[0],
  //     bucket_size: 7,
  //   }),
  //   {},
  // );

  return (
    <Container>
      <Text type={TextTypes.Body3} center bold tag="h1">
        Little World KPIs & Overview
      </Text>
      <Description center>
        {`All the numbers in these overviews <bold>are live statistics</bold> and are <bold>filtered down to the current users access</bold>.`}
      </Description>
      <Sections>
        <KPIs />
        <BarChartTimeRangedV2 
          displayTimeSelection={false} 
          listDescriptionMap={{
            all: "Total registered users",
            journey_v2__never_active_or_deleted: "Registered users (adjusted)",
            journey_v2__user_created: "Users unverified",
            journey_v2__email_verified: "Users verified",
            journey_v2__user_form_completed: "User filled form",
            journey_v2__too_low_german_level: "Users with B1+ German level",
            journey_v2__user_form_completed_volunteer: "Users filled form (volunteers)",
            journey_v2__booked_onboarding_call: "Users booked onboarding call in the past",
            journey_v2__no_show: "Onboarded users"
          }}
        />
        
          <SignupFunnelEvolution dataModFunc={modifyDataToPercentages} dataset="simplified-user-signup-funnel" />
          <MatchingFunnelEvolution dataModFunc={modifyDataToPercentages} dataset="match-journey" />
        <MatchSection>
          {/* <StackedChart title="Match Evolution" elementsConfig={MATCH_EVOLUTION_CONFIG} /> */}
          <MatchQuality />
        </MatchSection>

        {}
        {/* <UserJourneyBucketsOverview />
        <MatchJourneyOverview /> */}
      </Sections>
    </Container>
  );
}

export default KPIsDashboard;
