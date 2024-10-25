import {
  Accordion,
  ContentTypes,
  Tag,
  TagAppearance,
  TagSizes,
  Text,
  TextContent,
} from '@a-little-world/little-world-design-system';
import React from 'react';
import styled, { useTheme } from 'styled-components';

const scoreVariables = [
  {
    header: 'Learner vs Volunteer',
    content: (
      <Text>
        Matches are only valid between learners and volunteers. Scores between
        users of the same type are automatically labelled as unmatchable
      </Text>
    ),
  },
  {
    header: 'Gender',
    content: (
      <Text>
        {`We allow users to set a gender preference for their match. Therefore we check against each user's gender and the partner gender preference they have selected.

       If the user has a gender preference set, then scores with all other users with a differing gender to this preference will be deemed "unmatchable". e.g. user_1.partner_gender = male and user_2.gender = female => "Unmatchable"

       <bold>Scoring:</bold>
       - 20 points: Both users have gender preferences set and they align e.g. user_1.partner_gender = user_2.gender AND user_2.partner_gender = user_1.gender 
       - 10 points: Gender preferences align but at least one User has set their gender to "any" or has their preference set to "any"
       - Unmatchable: One or both user's gender preference does not align with the other user's gender.
      `}
      </Text>
    ),
  },
  {
    header: 'Time Slot Overlap',
    content: (
      <Text>{`Score calculated based on the amount of overlap in each user's time slot availability. As flexibility for our user's is very important to us, we want to make sure that users are able to communicate with the matches in the times they are available. Therefore, we currently reduce scores if users have no overlapping availability.

       <bold>Scoring:</bold>
       - 37 points: < 6 slots
       - 35 points: 5 slots
       - 32 points: 4 slots
       - 29 points: 3 slots
       - 25 points: 2 slots
       - 15 points: 1 slots
       - -15 points: 0 slots
      
      `}</Text>
    ),
  },
  {
    header: 'Language Level',
    content: (
      <Text>{`We give volunteers the opportunity to specify the minimum German language level of the learner. If the learner's German level is below that of the volunteer's preference, we deem this match "Unmatchable".

       <bold>Scoring:</bold>
       - 30 points: Language preference met e.g. user_1.min_lang_level_partner = B1 AND user_2.german_lang_level = B1 (or higher)
       - unmatchable: Language preference not met e.g. user_1.min_lang_level_partner = B1 AND user_2.german_lang_level = A1/A2
      `}</Text>
    ),
  },
  {
    header: 'Interests Overlap',
    content: (
      <Text>
        {`Scores based on the amount of interests that overlap. We currently max the scoring at 30 points (6 overlapping interests) in order for the score to not be bloated by this factor. 

       <bold>Scoring:</bold>
       - 30 points: > 5 interests
       - 25 points: 5 interests
       - 20 points: 4 interests
       - 15 points: 3 interests
       - 10 points: 2 interests
       - 5 points: 1 interests
       - 0 points: 0 overlap 
      `}
      </Text>
    ),
  },
  {
    header: 'Postal Code Distance',
    content: (
      <Text>{`Score calculated based on the distance in km between users' postal codes. Currently we score users that are closer more highly, to encourage the likelihood of in-person connections and shared experiences and overlap that comes from living in the same area.

       <bold>Scoring:</bold>
       - 18 points: < 50km
       - 16 points: < 100km
       - 14 points: < 200km
       - 12 points: < 300km
       - 10 points: < 400km
       - 5 points: < 500km
       - 0 points: > 500km
      `}</Text>
    ),
  },
  {
    header: `User's existing matches`,
    content: (
      <Text>
        {`The scoring takes into account multiple aspects of a user's current
        matching state and their existing matches. These are listed below.

        <bold>Conditions:</bold>
        - Not considered for matching: User has open proposal.
        - Unmatchable: Already unmatched or was in a reported match with the other user.`}
      </Text>
    ),
  },
  {
    header: `No match bonus`,
    content: (
      <Text>
        {`To hit our target of matching everyone and avoid some learners having multiple matches, whilst others are still waiting to be matched, we enhance the score of those users that have never been matched.

        <bold>Scoring:</bold>
        - 20 points: Learner has no match or previous match, and has not rejected a proposal.
        - 0 points: Learner already has an active match.
        `}
      </Text>
    ),
  },
];

const Wrapper = styled.div`
  padding: ${({ theme }) => theme.spacing.medium};
  height: 100%;
  overflow: scroll;
  max-width: 1000px;
  margin: auto;
`;

const Algorithm = () => {
  const theme = useTheme();
  return (
    <Wrapper>
      <TextContent
        content={[
          {
            type: ContentTypes.Title,
            text: 'Our Matching Algorithm',
            color: theme.color.text.title,
            center: true,
          },
          {
            type: ContentTypes.Subtitle,
            text: 'How it works',
          },
          {
            type: ContentTypes.Paragraph,
            text: `In order to match our users in the most effective way, using the information and preferences they provide us, we utilise our own custom algorithm. This algorithm calculates scores for all potential matches at a given point in time and returns a list of optimised match results so we can match the most people at once in an optimised way.

            The logic is based on the <a {"href": "https://en.wikipedia.org/wiki/Maximum_cardinality_matching#:~:text=Maximum%20cardinality%20matching%20is%20a,one%20edge%20of%20the%20subset.", "target": "_blank"}>"maximum cardinality matching"</a> principle, which simply put, attempts to make the most possible matches with the highest score possible whilst avoid matching the same user twice.`,
          },
          {
            type: ContentTypes.Paragraph,
            text: `We can calculate a score for two specific users or all scores for a list of users e.g. those that are searching for a match.`,
          },
          {
            type: ContentTypes.Sentence,
            text: 'The algorithm returns a score that has two main parts:',
          },
          {
            type: ContentTypes.OrderedList,
            listItems: [
              '<bold>The score</bold> - a number indicating how well two users personal information and preferences align',
              <>
                <Text>{`<bold>Matchable value</bold> - boolean value indicating whether two users are a valid match. A potential match could have a high score but not be "Matchable" due to a condition violation e.g. Gender preference`}</Text>
                <div className="flex gap-2 mt-4">
                  <Tag appearance={TagAppearance.success} size={TagSizes.small}>
                    Matchable
                  </Tag>
                  <Tag appearance={TagAppearance.error} size={TagSizes.small}>
                    Prevents Match
                  </Tag>
                </div>
              </>,
            ],
            style: { marginBottom: theme.spacing.medium },
          },
          {
            type: ContentTypes.Subtitle,
            text: 'Score Thresholds',
          },
          {
            type: ContentTypes.Paragraph,
            text: '<bold>Important:</bold> the value of the score does not determine if a potential match is "matchable" i.e. users with a score of 0 can in theory be matched. However, the score should be used as a guideline. The threshold we use to determine the viability of a match are below.',
          },
          {
            type: ContentTypes.List,
            listItems: [
              '<bold>Very good:</bold> > 120',
              '<bold>Acceptable:</bold> > 60',
              '<bold>Not matchable:</bold> < 60',
            ],
            style: { marginBottom: theme.spacing.medium },
          },
          {
            type: ContentTypes.Subtitle,
            text: 'Scoring Elements',
            style: { marginBottom: theme.spacing.medium },
          },
        ]}
      />
      <Accordion items={scoreVariables} />
    </Wrapper>
  );
};

export default Algorithm;
