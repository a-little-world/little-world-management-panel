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

import {
  HoverCard,
  HoverCardContent,
  HoverCardTrigger,
} from '../../atoms/HoverCard';
import LoadingSpinner from '../../atoms/LoadingSpinner';
import { MatchJourneyOverview } from './MatchJourneyBuckets';
import { UserJourneyBucketsOverview } from './UserJourneyBuckets';
import { UserSignUpLossStatistic } from './UserSignUpLossStatistic';

export const SectionTitle = styled(Text)`
  font-weight: bold;
  margin-bottom: ${({ theme }) => theme.spacing.xxsmall};
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

export function MatchUserJourneyOverview() {
  return (
    <Container>
      <Text type={TextTypes.Body3} center bold tag="h1">
        User & Match Journey Overview
      </Text>
      <Description center>
        {`All the numbers in these overviews <bold>are live statistics</bold> and are <bold>filtered down to the current users access</bold>.`}
      </Description>
      <Sections>
        <UserJourneyBucketsOverview />
        <MatchJourneyOverview />
      </Sections>
      <SectionR>
        <UserSignUpLossStatistic />
      </SectionR>
    </Container>
  );
}
