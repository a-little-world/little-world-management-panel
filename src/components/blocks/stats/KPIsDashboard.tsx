import {
  Card,
  CardFooter,
  Text,
  TextTypes,
} from '@a-little-world/little-world-design-system';
import React from 'react';
import styled from 'styled-components';
import useSWR from 'swr';

import { modifyDataToPercentages } from '../../../helpers/stats';
import { dataFetcher } from '../../../store';
import Matrix, { MatrixData } from '../../atoms/stats/Matrix';
import {
  BarChartTimeRanged,
  MatchingFunnelEvolution,
} from './BarChartTimeRanged';
import { MatchQuality } from './MatchQualityStatistic';

const Container = styled.div`
  padding: ${({ theme }) => theme.spacing.small};
`;

const Sections = styled.div`
  display: flex;
  gap: ${({ theme }) => theme.spacing.medium};
  flex-wrap: wrap;
  flex-direction: column;
`;

const Description = styled(Text)`
  margin-bottom: ${({ theme }) => theme.spacing.large};
`;

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
  const { data: kpisDataUserSignup } = useSWR(
    '/api/matching/users/statistics/kpi_singup/',
    dataFetcher,
  );

  const { data: kpiDataMatches } = useSWR(
    '/api/matching/users/statistics/kpi_matching/',
    dataFetcher,
  );

  const { data: kpiDataSearching } = useSWR(
    '/api/matching/users/statistics/kpi_searching/',
    dataFetcher,
  );

  return (
    <KPIsContainer>
      <KPI
        title="Signup Funnel"
        stats={[
          [
            {
              label: 'Total Registered Users',
              value: kpisDataUserSignup?.total_registered_users,
            },
            { label: 'Last 7 days', value: kpisDataUserSignup?.last_7_days },
            {
              label: '% Volunteers (last 7 days)',
              value: `${kpisDataUserSignup?.percent_volunteers_last_7_days}%`,
            },
          ],
          [
            {
              label: '% Onboarded Users* (Total)',
              value: `${kpisDataUserSignup?.percent_onboarded_users}%`,
            },
            {
              label: 'Signups der letzten 30 Tagen',
              value: kpisDataUserSignup?.signups_last_30_days,
            },
            {
              label: 'Onboarded volunteers† (form completed from 6 Apr 2026)',
              value: `${kpisDataUserSignup?.volunteers_onboarded_after_2026_04_06_count ?? 0}`,
            },
            {
              label: '% onboarded via self-onboarding',
              value: `${kpisDataUserSignup?.volunteers_onboarded_after_2026_04_06_self_onboarding_pct ?? 0}%`,
            },
            {
              label: '% onboarded via call',
              value: `${kpisDataUserSignup?.volunteers_onboarded_after_2026_04_06_prematching_call_pct ?? 0}%`,
            },
            {
              label: '% with no path or both flags without timestamps.',
              value: `${kpisDataUserSignup?.volunteers_onboarded_after_2026_04_06_unclassified_pct ?? 0}%`,
            },
          ],
        ]}
        footnote="Without too low german level. †Volunteers, is_onboarded, user_form_completed_at after 6 Apr 2026. Each user counted once: if both paths apply, bucket is whichever of self_onboarding_completed_at vs onboarding_call_completed_at is earlier"
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
          xLabels: ['Volunteers', 'Learners'],
          yLabels: [
            "users searching for 'first-match'",
            "users searching for 'another-match'",
          ],
          cells: [
            {
              title: 'Volunteers',
              content: kpiDataSearching?.first_search_volunteers,
              color: '#4299E1',
            },
            {
              title: 'Learners',
              content: kpiDataSearching?.first_search_learners,
              color: '#4299E1',
            },
            {
              title: 'Volunteers',
              content: kpiDataSearching?.searching_again_volunteers,
              color: '#4299E1',
            },
            {
              title: 'Learners',
              content: kpiDataSearching?.searching_again_learners,
              color: '#4299E1',
            },
          ],
        }}
        color="#4299E1"
        footnote="Exludes users searching that have open proposals"
      />
    </KPIsContainer>
  );
};

function KPIsDashboard() {
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
        <BarChartTimeRanged
          displayTimeSelection={true}
          displayVolunteersOnlyCheckbox={true}
          listDescriptionMap={{
            all: 'Total registered users',
            journey_v2__never_active_or_deleted: 'Registered users (adjusted)',
            journey_v2__user_created: 'Users unverified',
            journey_v2__email_verified: 'Users verified',
            journey_v2__user_form_completed: 'User filled form',
            journey_v2__too_low_german_level: 'Users with B1+ German level',
            journey_v2__user_form_completed_volunteer:
              'Users filled form (volunteers)',
            journey_v2__booked_onboarding_call: 'Booked call',
            journey_v2__self_onboarding_started: 'Self-onboarding in progress',
            journey_v2__no_show: 'Onboarded users',
          }}
        />
        <MatchingFunnelEvolution
          dataModFunc={modifyDataToPercentages}
          dataset="match-journey"
        />
        <MatchSection>
          <MatchQuality />
        </MatchSection>
      </Sections>
    </Container>
  );
}

export default KPIsDashboard;
