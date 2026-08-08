import { Text, TextTypes } from '@a-little-world/little-world-design-system';
import React from 'react';

import { Container, Description, SectionR, Sections } from './JourneyStyles';
import MatchJourneyBuckets from './MatchJourneyBuckets';
import MatchJourneyV5Buckets from './MatchJourneyV5Buckets';
import { UserSignUpLossStatistic } from './UserSignUpLossStatistic';

export function MatchJourneyOverview() {
  return (
    <Container>
      <Text type={TextTypes.Body3} center bold tag="h1">
        Match Journey Overview
      </Text>
      <Description center>
        {`All the numbers in these overviews <bold>are live statistics</bold> and are <bold>filtered down to the current users access</bold>.`}
      </Description>
      <Sections>
        <MatchJourneyBuckets />
        <MatchJourneyV5Buckets />
      </Sections>
      <SectionR>
        <UserSignUpLossStatistic />
      </SectionR>
    </Container>
  );
}
