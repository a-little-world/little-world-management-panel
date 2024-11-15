import {
  Button,
  ButtonAppearance,
  ButtonSizes,
  ButtonVariations,
  Link,
  Loading,
  Tag,
  TagAppearance,
  TagSizes,
  Tags,
  Text,
  TextTypes,
} from '@a-little-world/little-world-design-system';
import { capitalize, isEmpty } from 'lodash';
import React from 'react';
import { useNavigate } from 'react-router-dom';
import styled, { css } from 'styled-components';
import useSWR from 'swr';

import MatchesIcons from '../atoms/MatchesIcons';
import UserImage from '../atoms/UserImage';
import { formatDate, formatTimeDistance } from '../helpers/date';
import { MATCHING_ROUTE } from '../routes';
import { dataFetcher, useGlobalState } from '../store';
import UserLanguages from './UserLanguages';

const StyledCard = styled.div<{ $horizontal?: boolean }>`
  width: 100%;
  position: relative;
  display: flex;
  align-items: center;
  justify-content: center;
  background: ${({ theme }) => theme.color.surface.tertiary};
  margin-bottom: ${({ theme }) => theme.spacing.xxsmall};
  padding: ${({ theme }) => theme.spacing.small};
  border: 1px solid ${({ theme }) => theme.color.border.subtle};
  border-radius: ${({ theme }) => theme.radius.large};
  height: fit-content;

  ${({ theme, $horizontal }) =>
    $horizontal
      ? css`
          gap: ${theme.spacing.xlarge};
        `
      : css`
          flex-direction: column;
          gap: ${theme.spacing.small};
        `}
`;

type UserCardProps = {
  user: any;
  deselectUser?: (hash: string) => void;
  selectUserForDetails?: (user: any) => void;
  partial?: boolean;
  horizontal?: boolean;
  tiny?: boolean;
};

export const UserCard = ({
  user,
  deselectUser,
  partial = true,
  tiny = false,
  horizontal = false,
}: UserCardProps) => {
  const {
    data: waitingTime,
    error: waitingTimeError,
    isLoading,
  } = useSWR(`/api/matching/users/${user.id}/match_waiting_time/`, dataFetcher);
  console.log({ waitingTime, waitingTimeError });
  const { addUserToMatching } = useGlobalState();
  const navigate = useNavigate();
  const onAddToMatching = () => {
    addUserToMatching(user);
    navigate(MATCHING_ROUTE);
  };
  if (!user) return <div>Undefined User</div>;

  let End = <></>;
  if (!partial) {
    End = (
      <>
        <div className="flex flex-col gap-4 items-start sm:flex-row mt-2">
          <div className="w-full flex flex-col content-start justify-start items-start gap-2">
            <div className="flex flex-row content-center items-start justify-start gap-1">
              <Text tag="h4" bold type={TextTypes.Heading6}>
                Id
              </Text>
              {user.id}
            </div>
            <div className="flex flex-row content-center items-start justify-start gap-1">
              <Text tag="h4" bold type={TextTypes.Heading6}>
                Email:
              </Text>
              {user.email}
            </div>
            <div className="flex flex-row content-center items-start justify-start gap-1">
              <Text tag="h4" bold type={TextTypes.Heading6}>
                Phone Number:
              </Text>
              {user.profile.phone_mobile} (Nofify via{' '}
              {user.profile.notify_channel})
            </div>
            <div className="flex content-center items-start justify-center gap-1">
              <Text tag="h4" bold type={TextTypes.Heading6}>
                Matching State:
              </Text>
              <Tag
                appearance={
                  TagAppearance[
                    user.state.matching_state === 'searching'
                      ? 'error'
                      : 'success'
                  ]
                }
                size={TagSizes.small}
              >
                {user.state.matching_state}
              </Tag>
            </div>
            <div className="flex flex-row content-center items-start justify-start">
              <Text tag="h4" bold type={TextTypes.Heading6}>
                Group
              </Text>
              : {user.profile.target_groups?.join(', ')}
            </div>
            <Text tag="h4" bold type={TextTypes.Heading6}>
              Interests
            </Text>
            <Tags content={user.profile.interests} />

            <Text tag="h4" bold type={TextTypes.Heading6}>
              About
            </Text>
            <Text>{user.profile.description}</Text>
            <Text tag="h4" bold type={TextTypes.Heading6}>
              Languages:
            </Text>
            <UserLanguages langSkill={user.profile.lang_skill} />
          </div>
          <div className="w-full md:w-1/2 bg-white rounded-xl p-3 flex-col border border-slate-200">
            <Text type={TextTypes.Body4} center bold>
              Current Status
            </Text>
            <ul className="steps steps-vertical w-full">
              <li className="step step-primary text-left">
                Register {new Date(user.date_joined).toDateString()}
              </li>

              <li
                className={`step text-left ${
                  user.email_authenticated ? 'step-primary' : ''
                }`}
              >
                Email Authenticated
              </li>
              {!isEmpty(user.matches.unconfirmed.items) &&
                isEmpty(user.matches.confirmed.items) && (
                  <li className="step text-left">Has pending match</li>
                )}
              <li
                className={`step text-left ${
                  !isEmpty(user.matches.confirmed.items) ? 'step-primary' : ''
                }`}
              >
                First Match
              </li>
              {!isEmpty(user.matches.unconfirmed.items) &&
                !isEmpty(user.matches.confirmed.items) && (
                  <li className="step text-left">Has pending match</li>
                )}
            </ul>
          </div>
        </div>
      </>
    );
  }

  return (
    <StyledCard $horizontal={horizontal}>
      {user.state.unresponsive && (
        <div className="w-90% p-2 z-10 rounded-md absolute top-3 right-1/2 translate-x-2/4 max-w-ful bg-error text-2xl text-center">
          Marked as unresponsive
        </div>
      )}
      {!tiny && (
        <div className="w-full h-fit p-3 flex flex-row justify-between absolute top-0 left-0 z-10">
          <Tag
            bold
            color={
              user.profile.user_type === 'volunteer' ? '#9631c5' : '#ec2525'
            }
          >
            {capitalize(user.profile.user_type)}
          </Tag>
          {partial && (
            <Button
              variation={ButtonVariations.Icon}
              onClick={e => {
                deselectUser?.(user.hash);
                e.stopPropagation();
              }}
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-6 w-6"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                  d="M6 18L18 6M6 6l12 12"
                />
              </svg>
            </Button>
          )}
        </div>
      )}

      <div className="h-fit flex flex-row items-center content-center justify-center">
        <UserImage
          alt="user profile pic"
          user={user.profile}
          dimensions={{
            height: partial ? (tiny ? 50 : 120) : 180,
            width: partial ? (tiny ? 50 : 120) : 180,
          }}
        />
      </div>

      <div className="flex flex-col gap-2">
        <div
          className={`w-full h-fit text-center ${
            tiny ? 'text-xs' : 'text-2xl'
          }`}
        >
          {user.profile.first_name} {user.profile.second_name}
        </div>
        <div className="flex flex-row content-center items-start justify-center gap-1">
          <Text tag="h4" bold>
            Joined:
          </Text>
          <Text>
            {formatDate(new Date(user.date_joined))} (
            {formatTimeDistance(new Date(user.date_joined), new Date())})
          </Text>
        </div>
        <div className="flex flex-row content-center items-center justify-center gap-1">
          <Text className="whitespace-nowrap" tag="h4" bold>
            Match eligibility:
          </Text>
          {isLoading ? (
            <Loading />
          ) : (
            <Text color={waitingTime.includes('Waiting') ? 'red' : 'black'}>
              {waitingTime}
            </Text>
          )}
        </div>
        <div className="w-full text-xs text-center flex flex-col gap-2 items-center border-blue">
          <MatchesIcons
            label="Confirmed"
            matches={user?.matches.confirmed?.items}
          />
          <MatchesIcons
            label="Unconfirmed"
            matches={user?.matches.unconfirmed?.items}
          />
          <MatchesIcons
            label="Proposed"
            matches={user?.matches.proposed?.items}
          />
        </div>
      </div>

      {!partial && (
        <div className="flex flex-row content-center items-start justify-start gap-1 my-2">
          <Link
            href={`https://little-world.com/app/profile/${user.hash}`}
            target="_blank"
            buttonAppearance={ButtonAppearance.Secondary}
            buttonSize={ButtonSizes.Stretch}
          >
            View App Profile
          </Link>
        </div>
      )}
      {partial && (
        <div
          className={`flex gap-4 z-50 ${
            horizontal ? 'flex-col ' : 'items-center mt-2'
          }`}
        >
          <Link to={`/user/${user.id}`}>View profile</Link>
          <Link to={`/user/${user.id}`} state={{ openTab: 'chat' }}>
            Open chat
          </Link>
          {!horizontal && (
            <Button
              variation={ButtonVariations.Inline}
              onClick={onAddToMatching}
            >
              Match
            </Button>
          )}
        </div>
      )}
      {End}
    </StyledCard>
  );
};

export default UserCard;
