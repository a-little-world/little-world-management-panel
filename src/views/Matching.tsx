import {
  Button,
  ButtonAppearance,
  ButtonSizes,
  Card as CardDS,
  Checkbox,
  Dropdown,
  Link,
  Tag,
  TagAppearance,
  TagSizes,
  Text,
  TextTypes,
} from '@a-little-world/little-world-design-system';
import { isEmpty } from 'lodash';
import React, { useState } from 'react';
import styled from 'styled-components';

import {
  calculateAllScoresForUser,
  calculateScoreBetweenUsers,
  matchUsers,
} from '../api/index';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '../atoms/Card';
import { ScoresTable } from '../blocks/ScoresTable';
import { SelectedUsersSheet } from '../blocks/SelectedUsersSheet';
import UserCard from '../blocks/UserCard';
import { ALGORITHM_ROUTE } from '../routes';
import { useGlobalState } from '../store';

const MATCHING_OPTIONS = [
  { value: 'match', label: 'Match Users' },
  { value: 'proposal', label: 'Make Proposal' },
  { value: 'score', label: 'Calculate Matching Score' },
];

const SCORE_FUNCTION_LABELS = {
  time_slot_overlap: 'Time Slot Overlap',
  postal_code_distance: 'Postal Code Distance',
  gender: 'Gender Preference',
  interest_overlap: 'Interest Overlap',
};

const ScoreCategory = styled.div<{ $matchable: boolean }>`
  position: relative;
  border-bottom: 1px solid ${({ theme }) => theme.color.border.subtle};
  padding: ${({ theme }) =>
    `${theme.spacing.xxsmall} ${theme.spacing.xxxsmall}`};
  margin-bottom: ${({ theme }) => theme.spacing.xxxsmall};
`;

const Title = styled.div`
  display: flex;
  gap: ${({ theme }) => theme.spacing.xxsmall};
  align-items: center;
`;

const ScoreBreakdown = ({ data }) => {
  return (
    <CardDS>
      <div className="flex gap-4 items-center justify-between">
        <Text type={TextTypes.Body4}>Score Breakdown</Text>
        <Link to={ALGORITHM_ROUTE}>More Info</Link>
      </div>
      {data.slice(2).map(result => (
        <ScoreCategory $matchable={result.res.matchable}>
          <Title>
            <Text type={TextTypes.Body5} bold>
              {SCORE_FUNCTION_LABELS[result.score_function]}
            </Text>
            <Tag
              appearance={
                result.res.matchable
                  ? TagAppearance.success
                  : TagAppearance.error
              }
              size={TagSizes.small}
            >
              {result.res.matchable ? 'Matchable' : 'Prevents Match'}
            </Tag>
          </Title>
          <Text type={TextTypes.Body5}>{result.res.markdown_info}</Text>
          <Text type={TextTypes.Body5}>
            Score Contributor: {result.res.score}
          </Text>
        </ScoreCategory>
      ))}
    </CardDS>
  );
};

const Matching = ({
  preselectOption = 'proposal',
  onMatch,
  preCalculatedScoreData,
}: {
  preCalculatedScoreData?: any;
  onMatch?: () => void;
  preselectOption?: string;
}) => {
  const [option, setOption] = useState<string>(preselectOption);
  const [forceMatch, setForceMatch] = useState<boolean>(false);
  const [submitError, setSubmitError] = useState<string>('');
  const [matchSucces, setMatchSuccess] = useState<string>('');
  const [scoreData, setScoreData] = useState<any>(preCalculatedScoreData ?? {});
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [loadingScore, setLoadingScore] = useState<boolean>(false);

  const { removeUserFromMatching, addUserToMatching, potentialMatch } =
    useGlobalState();
  const [scoresList, setScoresList] = useState(null);
  const [loadingPotentialMatches, setLoadingPotentialMatches] = useState(false);

  const calculateScores = () => {
    setLoadingPotentialMatches(true);
    calculateAllScoresForUser({
      user1Id: potentialMatch[0].id,
      onError: error => {
        setLoadingPotentialMatches(false);
        setSubmitError(error?.message || 'Issue with request');
      },
      onSuccess: response => {
        setLoadingPotentialMatches(false);
        setScoresList(response?.results || []);
      },
    });
  };

  const onMatchAction = () => {
    setSubmitError('');
    setMatchSuccess('');

    if (option === MATCHING_OPTIONS[2]?.value) {
      setLoadingScore(true);
      calculateScoreBetweenUsers({
        user1Id: potentialMatch[0].id,
        user2Id: potentialMatch[1].id,
        onError: error => {
          setSubmitError(error?.message || 'Issue with request');
          setLoadingScore(false);
        },
        onSuccess: res => {
          setLoadingScore(false);

          setScoreData(res);
          setMatchSuccess('Score Calculated');
        },
      });
    } else {
      setIsSubmitting(true);
      const data = {
        user1: potentialMatch[0].id,
        user2: potentialMatch[1].id,
        force: forceMatch,
        proposal: option === MATCHING_OPTIONS[1].value ? true : false,
      };

      matchUsers({
        data,
        onError: error => {
          setSubmitError(error?.message || 'Issue with request');
          setIsSubmitting(false);
        },
        onSuccess: message => {
          setMatchSuccess(message);
          setIsSubmitting(false);
          onMatch?.();
        },
      });
    }
  };

  const handlePotentialMatchClick = score => {
    addUserToMatching(score.to_usr);
  };

  return (
    <main className="overflow-y-scroll">
      <Card className={'border-none shadow-none'}>
        <CardHeader>
          <CardTitle>Matching Dashboard</CardTitle>
          <CardDescription>
            Select a matching option and then hit submit
          </CardDescription>
          <div className="flex gap-6 w-full items-center">
            <Dropdown
              value={option}
              options={MATCHING_OPTIONS}
              onValueChange={val => setOption(val)}
              placeholder="Select an option..."
              cannotError
            />
            <Checkbox
              id="completed"
              name={name}
              inputRef={null}
              onCheckedChange={setForceMatch}
              onBlur={() => {}}
              value={forceMatch}
              defaultChecked={false}
              error={null}
              label={'Force Match'}
              required={false}
            />
            <Button
              disabled={
                loadingPotentialMatches ||
                isSubmitting ||
                potentialMatch.length !== 2 ||
                !option
              }
              onClick={onMatchAction}
              size={ButtonSizes.Small}
              appearance={ButtonAppearance.Secondary}
            >
              Submit
            </Button>
            {isEmpty(preCalculatedScoreData) && (
              <Button
                disabled={
                  loadingPotentialMatches ||
                  isSubmitting ||
                  potentialMatch.length !== 1 ||
                  !option
                }
                onClick={calculateScores}
                size={ButtonSizes.Small}
              >
                Calculate Scores for first user
              </Button>
            )}
          </div>
        </CardHeader>
        <CardContent className="space-y-2 flex flex-col gap-4">
          {isEmpty(potentialMatch) ? (
            <Text>
              No users selected for Match. This can be done via the Selected
              Users panel or directly on a user's profile
            </Text>
          ) : (
            <>
              <div className="flex gap-4 items-center">
                <Text type={TextTypes.Body3} bold>
                  Score:{' '}
                  {loadingScore
                    ? 'Loading Score...'
                    : scoreData.score ?? 'to be calculated'}
                </Text>
                {!isEmpty(scoreData) && (
                  <>
                    <Tag
                      appearance={
                        TagAppearance[
                          scoreData?.matchable ? 'success' : 'error'
                        ]
                      }
                      size={TagSizes.small}
                    >
                      {scoreData?.matchable ? 'Matchable' : 'Not valid'}
                    </Tag>
                    <Link to={ALGORITHM_ROUTE}>How is this calculated?</Link>
                  </>
                )}
              </div>
              {(matchSucces || submitError) && (
                <div
                  className={`${
                    matchSucces || submitError ? 'opacity-100' : 'opacity-0'
                  } w-full h-12 p-4 flex flex-column items-center justify-center ${
                    submitError ? 'bg-red-200' : 'bg-green-200'
                  }`}
                >
                  {matchSucces || submitError}
                </div>
              )}
              {potentialMatch.map(user => (
                <UserCard
                  user={user}
                  deselectUser={removeUserFromMatching}
                  horizontal
                />
              ))}
            </>
          )}
          {!isEmpty(scoreData?.scoring_results) && (
            <ScoreBreakdown data={scoreData.scoring_results} />
          )}
          {(scoresList || loadingPotentialMatches) && (
            <div>
              {loadingPotentialMatches ? (
                <Text center>Loading scores...</Text>
              ) : (
                <div>
                  <Text type={TextTypes.Body3}>
                    Matching Scores for {potentialMatch[0]?.profile?.first_name}
                  </Text>
                  {isEmpty(scoresList) ? (
                    <Text center>No available matches.</Text>
                  ) : (
                    <ScoresTable
                      scoresList={scoresList}
                      onMatchClick={handlePotentialMatchClick}
                    />
                  )}
                </div>
              )}
            </div>
          )}
        </CardContent>
      </Card>

      <SelectedUsersSheet />
    </main>
  );
};

export default Matching;
