import {
  Button,
  ButtonVariations,
  Link,
  Tags,
  Text,
  TextTypes,
} from '@a-little-world/little-world-design-system';
import { isEmpty } from 'lodash';
import React from 'react';

import MatchesIcons from '../atoms/MatchesIcons';
import Tag, { TagTypes } from '../atoms/Tag';
import UserImage from '../atoms/UserImage';
import { formatDate } from '../helpers/date';

type UserCardProps = {
  user: any;
  deselectUser?: (hash: string) => void;
  selectUserForDetails?: (user: any) => void;
  partial: boolean;
  horizontal: boolean;
};

export const UserCard = ({
  user,
  deselectUser,
  selectUserForDetails,
  partial = true,
  tiny = false,
  horizontal = false,
}: UserCardProps) => {
  if (!user) return <div>Undefined User</div>;

  let Content = <></>;
  if (!tiny) {
    Content = (
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
    );
  }

  let End = <></>;
  if (!partial) {
    End = (
      <>
        <div className="flex flex-col gap-4 items-start sm:flex-row">
          <div className="w-full flex flex-col content-start justify-start items-start gap-2">
            <div className="flex flex-row content-center items-start justify-start">
              <b className="text-l">Id</b>: {user.id}
            </div>
            <div className="flex flex-row content-center items-start justify-start">
              <b className="text-l">Date Joined</b>:{' '}
              {formatDate(new Date(user.date_joined))}
            </div>
            <div className="flex flex-row content-center items-start justify-start">
              <b className="text-l">Email</b>: {user.email}
            </div>
            <div className="flex flex-row content-center items-start justify-start">
              <b className="text-l">Phone Number</b>:{' '}
              {user.profile.phone_mobile} (Nofify via{' '}
              {user.profile.notify_channel})
            </div>
            <div className="flex flex-row content-center items-start justify-start">
              <b className="text-l">Matching State</b>:{' '}
              <div
                className={`badge badge-md ${
                  user.state.matching_state === 'searching'
                    ? 'bg-error'
                    : 'bg-success'
                }`}
              >
                {user.state.matching_state}
              </div>
            </div>
            <div className="flex flex-row content-center items-start justify-start">
              <b className="text-l">Group</b>: {user.profile.target_group}
            </div>
            <div className="text-l bold">Interests</div>
            <Tags content={user.profile.interests} />

            <div>About</div>
            <div>{user.profile.description}</div>
            <div className="text-l bold">Other Topics</div>
            <div>{user.profile.additional_interests}</div>
            <div className="text-l bold">
              Which languages do you speak and how well?
            </div>
            <div>{user.profile.language_skill_description}</div>
          </div>
          <div className="w-1/2 bg-white rounded-xl p-3 flex-col border border-slate-200">
            <Text type={TextTypes.Body4} center bold>
              Current Status
            </Text>
            <ul className="steps steps-vertical w-full">
              <li className="step step-primary">
                Register {new Date(user.date_joined).toDateString()}
              </li>

              <li
                className={`step ${
                  user.email_authenticated ? 'step-primary' : ''
                }`}
              >
                Email Authenticated
              </li>
              {!isEmpty(user.matches.unconfirmed.items) &&
                isEmpty(user.matches.confirmed.items) && (
                  <li className="step">Has pending match</li>
                )}
              <li
                className={`step ${
                  !isEmpty(user.matches.confirmed.items) ? 'step-primary' : ''
                }`}
              >
                First Match
              </li>
              {!isEmpty(user.matches.unconfirmed.items) &&
                !isEmpty(user.matches.confirmed.items) && (
                  <li className="step">Has pending match</li>
                )}
            </ul>
          </div>
        </div>
      </>
    );
  }

  return (
    <div
      className={`w-full flex ${
        horizontal ? 'flex-row' : 'flex-col'
      } bg-base-200 h-fit items-center content-center justify-center rounded-xl p-4 gap-2 mb-1 border border-border-slate-400`}
    >
      {partial && !tiny && (
        <div className="w-full h-fit flex flex-row justify-between">
          <Tag
            type={
              user.profile.user_type === 'volunteer'
                ? TagTypes.primary
                : TagTypes.secondary
            }
          >
            {user.profile.user_type}
          </Tag>
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
        </div>
      )}
      <div className="w-full h-fit flex flex-row items-center content-center justify-center">
        <UserImage
          alt="user profile pic"
          user={user.profile}
          dimensions={{
            height: partial ? (tiny ? 50 : 120) : 180,
            width: partial ? (tiny ? 50 : 120) : 180,
          }}
        />
      </div>
      {user.state.unresponsive && (
        <div className="w-96 max-w-ful h-10 bg-error text-3xl">
          Marked as unresponsive
        </div>
      )}
      <div
        className={`w-full h-fit text-center ${tiny ? 'text-xs' : 'text-2xl'}`}
      >
        {user.profile.first_name} {user.profile.second_name}
      </div>
      {Content}
      {partial && (
        <div className="flex gap-4 items-center mt-2">
          <Link to={`/user/${user.id}`}>View profile</Link>
          <Link to={`/user/${user.id}`} state={{ openTab: 'chat' }}>
            Open chat
          </Link>
        </div>
      )}
      {End}
    </div>
  );
};

export default UserCard;
