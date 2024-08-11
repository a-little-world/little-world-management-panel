import {
  Button,
  ButtonAppearance,
  ButtonSizes,
  Checkbox,
  Dropdown,
  Text,
  TextTypes,
} from '@a-little-world/little-world-design-system';
import { isEmpty } from 'lodash';
import React, { useState } from 'react';

import {
  calculateAllScoresForUser,
  calculateScoreBetweenUsers,
  matchUsers,
} from '../api/index';
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '../atoms/Card';
import { ScoresTable } from '../blocks/ScoresTable';
import { SelectedUsersSheet } from '../blocks/SelectedUsersSheet';
import UserCard from '../blocks/UserCard';
import { useGlobalState } from '../store';

const MATCHING_OPTIONS = [
  { value: 'match', label: 'Match Users' },
  { value: 'proposal', label: 'Make Proposal' },
  { value: 'score', label: 'Calculate Matching Score' },
];

const Matching = ({
  preselectOption = 'proposal',
  onPerformedMatch = () => {},
}) => {
  const [option, setOption] = useState<string>(preselectOption);
  const [forceMatch, setForceMatch] = useState<boolean>(false);
  const [submitError, setSubmitError] = useState<string>('');
  const [matchSucces, setMatchSuccess] = useState<string>('');
  const [score, setScore] = useState<string | number>('To Be Calculated');
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
          setScore(res.score);
          setMatchSuccess('Score Calculated');
        },
      });
    } else {
      const data = {
        user1: potentialMatch[0].id,
        user2: potentialMatch[1].id,
        force: forceMatch,
        proposal: option === MATCHING_OPTIONS[1].value ? true : false,
      };

      matchUsers({
        data,
        onError: error =>
          setSubmitError(error?.message || 'Issue with request'),
        onSuccess: message => {
          setMatchSuccess(message);
          onPerformedMatch();
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
              <Text type={TextTypes.Body3} bold>
                Score: {loadingScore ? 'Loading Score...' : score}
              </Text>
              {potentialMatch.map(user => (
                <UserCard
                  user={user}
                  deselectUser={removeUserFromMatching}
                  horizontal
                />
              ))}
            </>
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

        <CardFooter>
          <div
            className={`${
              matchSucces || submitError ? 'opacity-100' : 'opacity-0'
            } w-full h-12 p-4 flex flex-column items-center justify-center ${
              submitError ? 'bg-red-200' : 'bg-green-200'
            }`}
          >
            {matchSucces || submitError}
          </div>
        </CardFooter>
      </Card>

      <SelectedUsersSheet />
    </main>
  );
};

export default Matching;
