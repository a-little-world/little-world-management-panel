import { Text, TextTypes } from '@a-little-world/little-world-design-system';
import React from 'react';

import {
  Container,
  Description,
  SectionR,
  Sections,
  useMatchSuccessPageHeader,
} from './JourneyStyles';
import UserJourneyBuckets from './UserJourneyBuckets';
import UserJourneyV5Buckets from './UserJourneyV5Buckets';
import { UserSignUpLossStatistic } from './UserSignUpLossStatistic';

export function UserJourneyOverview() {
  useMatchSuccessPageHeader();
  return (
    <Container>
      <Text type={TextTypes.Body3} center bold tag="h1">
        User Journey Overview
      </Text>
      <Description center>
        {`All the numbers in these overviews <bold>are live statistics</bold> and are <bold>filtered down to the current users access</bold>.`}
      </Description>
      <Sections>
        <UserJourneyBuckets />
        <UserJourneyV5Buckets />
      </Sections>
      <SectionR>
        <UserSignUpLossStatistic />
      </SectionR>
    </Container>
  );
}
