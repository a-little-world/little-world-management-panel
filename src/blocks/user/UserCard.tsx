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
import useSWR from 'swr';

import MatchesIcons from '../../atoms/MatchesIcons';
import UserImage from '../../atoms/UserImage';
import { formatDate, formatTimeDistance } from '../../helpers/date';
import { MATCHING_ROUTE } from '../../routes';
import { dataFetcher, useGlobalState } from '../../store';
import {
  AboutField,
  ActionContainer,
  BucketTag,
  DetailsContainer,
  DetailsList,
  HeaderContainer,
  ImageContainer,
  InfoRow,
  MatchesContainer,
  StatusContainer,
  StyledCard,
  UnresponsiveWarning,
  UserInfoContainer,
  UserNameContainer,
} from './UserCard.styles';
import UserLanguages from './UserLanguages';

interface UserProfile {
  first_name: string;
  second_name: string;
  phone_mobile: string;
  target_group: string;
  target_groups?: string[];
  partner_gender: string;
  job_search: boolean;
  job_skill_description: string;
  interests: string[];
  description: string;
  lang_skill: any; // Replace 'any' with proper type
  user_type: 'volunteer' | 'refugee';
}

interface UserState {
  company?: string;
  searching_state: 'searching' | 'matched';
  email_authenticated: boolean;
  user_form_state: 'filled' | 'unfilled';
  had_prematching_call: boolean;
  unresponsive: boolean;
}

interface UserMatches {
  confirmed: { results: any[] };
  unconfirmed: { results: any[] };
  proposed: { results: any[] };
}

interface User {
  id: string;
  hash: string;
  email: string;
  date_joined: string;
  profile: UserProfile;
  state: UserState;
  matches: UserMatches;
  bucket?: string;
}

interface UserCardProps {
  user: User;
  deselectUser?: (hash: string) => void;
  partial?: boolean;
  horizontal?: boolean;
  tiny?: boolean;
}

// Component parts
const UserStatus: React.FC<{ user: User }> = ({ user }) => (
  <StatusContainer>
    <Text type={TextTypes.Body4} center bold>
      Current Status
    </Text>
    <ul className="steps steps-vertical w-full">
      <li className="step step-primary text-left">
        Register {new Date(user.date_joined).toDateString()}
      </li>
      <li
        className={`step text-left ${
          user.state.email_authenticated ? 'step-primary' : ''
        }`}
      >
        Email Authenticated
      </li>
      <li
        className={`step text-left ${
          user.state.user_form_state === 'filled' ? 'step-primary' : ''
        }`}
      >
        User Form
      </li>
      <li
        className={`step text-left ${
          user.state.had_prematching_call ? 'step-primary' : ''
        }`}
      >
        Prematching Call
      </li>
      {!isEmpty(user.matches.unconfirmed.results) &&
        isEmpty(user.matches.confirmed.results) && (
          <li className="step text-left">Has pending match</li>
        )}
      <li
        className={`step text-left ${
          !isEmpty(user.matches.confirmed.results) ? 'step-primary' : ''
        }`}
      >
        First Match
      </li>
      {!isEmpty(user.matches.unconfirmed.results) &&
        !isEmpty(user.matches.confirmed.results) && (
          <li className="step text-left">Has pending match</li>
        )}
    </ul>
  </StatusContainer>
);

const DetailRow: React.FC<{ label: string; value: string }> = ({
  label,
  value,
}) => (
  <InfoRow>
    <Text tag="h4" bold>
      {label}:
    </Text>
    <Text>{value}</Text>
  </InfoRow>
);

const UserDetails: React.FC<{
  user: User;
  isVolunteer: boolean;
}> = ({ user, isVolunteer }) => (
  <DetailsContainer>
    <DetailsList>
      <DetailRow label="Id" value={user.id} />
      <DetailRow label="Email" value={user.email} />
      <DetailRow label="Company" value={user.state.company || '-'} />
      <DetailRow
        label="Phone Number"
        value={`${user.profile.phone_mobile} (Notify via ${user.profile.phone_mobile})`}
      />
      {user.state.had_prematching_call && (
        <InfoRow>
          <Text tag="h4" bold>
            Matching State:
          </Text>
          <Tag
            appearance={
              TagAppearance[
                user.state.searching_state === 'searching' ? 'error' : 'success'
              ]
            }
            size={TagSizes.small}
          >
            {user.state.searching_state}
          </Tag>
        </InfoRow>
      )}
      <DetailRow
        label={isVolunteer ? 'Target Group' : 'Group'}
        value={
          isVolunteer
            ? user.profile.target_group ?? 'No target group'
            : user.profile.target_groups?.join(', ') ?? 'No groups'
        }
      />
      <DetailRow
        label={'Gender Preference'}
        value={user.profile.partner_gender}
      />
      <InfoRow>
        <Text tag="h4" bold>
          Job Search:
        </Text>
        <Text>{user.profile.job_search ? 'Yes' : 'No'}</Text>
      </InfoRow>
      {user.profile.job_skill_description && (
        <AboutField>{user.profile.job_skill_description}</AboutField>
      )}
      <Text tag="h4" bold>
        Interests
      </Text>
      <Tags className="mb-4" content={user.profile.interests} />
      <Text tag="h4" bold>
        About
      </Text>
      <AboutField>{user.profile.description}</AboutField>
      <Text tag="h4" bold>
        Languages:
      </Text>
      <UserLanguages langSkill={user.profile.lang_skill} />
    </DetailsList>
    <UserStatus user={user} />
  </DetailsContainer>
);

// Main Component
export const UserCard: React.FC<UserCardProps> = ({
  user,
  deselectUser,
  partial = true,
  tiny = false,
  horizontal = false,
}) => {
  const navigate = useNavigate();
  const { addUserToMatching } = useGlobalState();
  const {
    data: waitingTime,
    error: waitingTimeError,
    isLoading,
  } = useSWR(`/api/matching/users/${user.id}/match_waiting_time/`, dataFetcher);

  if (!user) return <div>Undefined User</div>;

  const isVolunteer = user.profile.user_type === 'volunteer';

  const onAddToMatching = () => {
    addUserToMatching(user);
    navigate(MATCHING_ROUTE);
  };

  const handleDeselectUser = (e: React.MouseEvent<HTMLButtonElement>) => {
    deselectUser?.(user.hash);
    e.stopPropagation();
  };

  return (
    <StyledCard $horizontal={horizontal}>
      {user.state.unresponsive && (
        <UnresponsiveWarning>Marked as unresponsive</UnresponsiveWarning>
      )}

      {!tiny && (
        <HeaderContainer>
          <Tag bold color={isVolunteer ? '#9631c5' : '#ec2525'}>
            {capitalize(user.profile.user_type)}
          </Tag>
          {user.bucket && (
            <BucketTag bold color="#000000" $horizontal={horizontal}>
              {user.bucket}
            </BucketTag>
          )}
          {partial && (
            <Button
              variation={ButtonVariations.Icon}
              onClick={handleDeselectUser}
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
        </HeaderContainer>
      )}

      <ImageContainer>
        <UserImage
          alt="user profile pic"
          user={user.profile}
          dimensions={{
            height: partial ? (tiny ? 50 : 120) : 180,
            width: partial ? (tiny ? 50 : 120) : 180,
          }}
        />
      </ImageContainer>

      <UserInfoContainer $partial={partial}>
        <UserNameContainer $tiny={tiny}>
          {user.profile.first_name} {user.profile.second_name}
        </UserNameContainer>
        <InfoRow>
          <Text tag="h4" bold>
            Joined:
          </Text>
          <Text>
            {formatDate(new Date(user.date_joined))} (
            {formatTimeDistance(new Date(user.date_joined), new Date())})
          </Text>
        </InfoRow>
        <InfoRow>
          <Text className="whitespace-nowrap" tag="h4" bold>
            Match eligibility:
          </Text>
          {isLoading ? (
            <Loading />
          ) : waitingTimeError ? (
            <Text>Error fetching</Text>
          ) : (
            <Text
              color={
                waitingTime?.first_search && waitingTime?.number_of_days > 0
                  ? 'red'
                  : 'black'
              }
            >
              {waitingTime.waiting_time_string}
            </Text>
          )}
        </InfoRow>
        <MatchesContainer $partial={partial}>
          <MatchesIcons
            label="Confirmed"
            matches={user?.matches.confirmed?.results}
          />
          <MatchesIcons
            label="Unconfirmed"
            matches={user?.matches.unconfirmed?.results}
          />
          <MatchesIcons
            label="Proposed"
            matches={user?.matches.proposed?.results}
          />
        </MatchesContainer>
      </UserInfoContainer>

      {!partial && (
        <>
          <div className="my-2">
            <Link
              href={`https://little-world.com/app/profile/${user.hash}`}
              target="_blank"
              buttonAppearance={ButtonAppearance.Secondary}
              buttonSize={ButtonSizes.Stretch}
            >
              View App Profile
            </Link>
          </div>
          <UserDetails user={user} isVolunteer={isVolunteer} />
        </>
      )}

      {partial && (
        <ActionContainer $horizontal={horizontal}>
          <Link to={`/user/${user.id}`}>View profile</Link>
          <Link to={`/user/${user.id}?tab=chat`} state={{ openTab: 'chat' }}>
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
        </ActionContainer>
      )}
    </StyledCard>
  );
};

export default UserCard;
