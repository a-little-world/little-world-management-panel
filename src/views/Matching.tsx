import {
  Button,
  ButtonAppearance,
  ButtonSizes,
  ButtonVariations,
  Dropdown,
  Text,
  TextTypes,
} from '@a-little-world/little-world-design-system';
import { isEmpty } from 'lodash';
import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { useLocation, useParams } from 'react-router-dom';
import { useSearchParams } from 'react-router-dom';
import useSWR from 'swr';

import { calculateScoreBetweenUsers, matchUsers } from '../api/index';
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '../atoms/Card';
import { SelectedUsersSheet } from '../blocks/SelectedUsersSheet';
import UserCard from '../blocks/UserCard';
import { useGlobalState } from '../store';

const MATCHING_OPTIONS = [
  { value: 'match', label: 'Match Users' },
  { value: 'proposal', label: 'Make Proposal' },
  { value: 'score', label: 'Calculate Matching Score' },
];

const Matching = () => {
  const { userId } = useParams();
  const { state } = useLocation();
  const [option, setOption] = useState<string>('');
  const [submitError, setSubmitError] = useState<string>('');
  const [matchSucces, setMatchSuccess] = useState<string>('');
  const [score, setScore] = useState<string | number>('To Be Calculated');
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  let [searchParams, setSearchParams] = useSearchParams();
  const { removeUserFromMatching, addUserToMatching, potentialMatch } =
    useGlobalState();

  // if (isLoading && !error)
  //   return <div className="w-full p-3 text-center">Loading</div>;
  // if (error)
  //   return (
  //     <div className="w-full p-3 text-center">
  //       Issue fetching this user. Please ensure the user id is correct
  //     </div>
  //   );

  const onMatchAction = () => {
    setSubmitError('');
    setMatchSuccess('');
    if (option === MATCHING_OPTIONS[2]?.value) {
      calculateScoreBetweenUsers({
        user1Id: potentialMatch[0].id,
        user2Id: potentialMatch[1].id,
        onError: error =>
          setSubmitError(error?.message || 'Issue with request'),
        onSuccess: setMatchSuccess,
      });
    } else {
      const data = {
        user1: potentialMatch[0].id,
        user2: potentialMatch[1].id,
        proposal: option === MATCHING_OPTIONS[1].value ? true : false,
      };

      matchUsers({
        data,
        onError: error =>
          setSubmitError(error?.message || 'Issue with request'),
        onSuccess: setMatchSuccess,
      });
    }
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
            <Button
              disabled={isSubmitting || potentialMatch.length !== 2 || !option}
              onClick={onMatchAction}
              size={ButtonSizes.Small}
              appearance={ButtonAppearance.Secondary}
            >
              Submit
            </Button>
          </div>
        </CardHeader>
        <CardContent className="space-y-2 flex flex-col">
          {isEmpty(potentialMatch) ? (
            <Text>
              No users selected for Match. This can be done via the Selected
              Users panel or directly on a user's profile
            </Text>
          ) : (
            <>
              <Text type={TextTypes.Body3} bold>
                Score: {score}
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
