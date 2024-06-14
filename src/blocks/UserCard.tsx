import {
  Button,
  ButtonAppearance,
  ButtonVariations,
  Link,
  Tags,
  Text,
  TextTypes,
} from '@a-little-world/little-world-design-system';
import { isEmpty } from 'lodash';
import React from 'react';
import { useNavigate } from 'react-router-dom';

import MatchesIcons from '../atoms/MatchesIcons';
import Tag, { TagAppearance, TagSizes } from '../atoms/Tag';
import UserImage from '../atoms/UserImage';
import { formatDate } from '../helpers/date';
import { MATCHING_ROUTE } from '../routes';
import { useGlobalState } from '../store';

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
  partial = true,
  tiny = false,
  horizontal = false,
}: UserCardProps) => {
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
                Date Joined:
              </Text>
              {formatDate(new Date(user.date_joined))}
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
              : {user.profile.target_group}
            </div>
            <Text tag="h4" bold type={TextTypes.Heading6}>
              Interests
            </Text>
            {/*<Tags content={user.profile.interests} /> */}

            <Text tag="h4" bold type={TextTypes.Heading6}>
              About
            </Text>
            <Text>{user.profile.description}</Text>
            <Text tag="h4" bold type={TextTypes.Heading6}>
              Other Topics
            </Text>
            <Text>{user.profile.additional_interests}</Text>
            <Text tag="h4" bold type={TextTypes.Heading6}>
              Which languages do you speak and how well?
            </Text>
            <Text>{user.profile.language_skill_description}</Text>
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
    <div
      className={`w-full relative flex ${
        horizontal ? 'flex-row gap-8' : 'flex-col gap-2'
      } bg-base-200 h-fit items-center content-center justify-center rounded-xl p-4  mb-2 border border-border-slate-400`}
    >
      {user.state.unresponsive && (
        <div className="w-90% p-2 z-10 rounded-md absolute top-3 right-1/2 translate-x-2/4 max-w-ful bg-error text-2xl text-center">
          Marked as unresponsive
        </div>
      )}
      {partial && !tiny && (
        <div className="w-full h-fit p-3 flex flex-row justify-between absolute top-0 left-0 z-10">
          <Tag
            className=""
            appearance={
              user.profile.user_type === 'volunteer'
                ? TagAppearance.primary
                : TagAppearance.secondary
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
          >
            View App Profile
          </Link>
        </div>
      )}
      {partial && (
        <div
          className={`flex gap-4 ${
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
    </div>
  );
};

export default UserCard;
