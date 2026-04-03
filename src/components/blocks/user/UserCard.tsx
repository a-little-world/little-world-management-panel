import {
  Button,
  ButtonAppearance,
  ButtonSizes,
  ButtonVariations,
  Link,
  Loading,
  Stepper,
  StepperOrientations,
  StepperSizes,
  Tag,
  TagAppearance,
  TagSizes,
  Tags,
  Text,
  TextTypes,
} from '@a-little-world/little-world-design-system';
import { capitalize } from 'lodash';
import React from 'react';
import { useNavigate } from 'react-router-dom';
import useSWR from 'swr';

import { formatDate, formatTimeDistance } from '../../../helpers/date';
import { MATCHING_ROUTE } from '../../../routes';
import { dataFetcher, useGlobalState } from '../../../store';
import MatchesIcons from '../../atoms/MatchesIcons';
import UserImage from '../../atoms/UserImage';
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
  country_of_residence?: string | null;
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
  is_onboarded: boolean;
  self_onboarding_step_id?: string | null;
  unresponsive: boolean;
  has_match_priority?: boolean;
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
  appointment?: { start_time: string; end_time: string };
  deselectUser?: (hash: string) => void;
  partial?: boolean;
  horizontal?: boolean;
  tiny?: boolean;
}

const UserStatus: React.FC<{ user: User; appointment?: any }> = ({
  user,
  appointment,
}) => {
  const hasOnboardingPath =
    !!appointment || Boolean(user.state.self_onboarding_step_id);

  const stepsWithCompletion = [
    {
      id: 'register',
      label: `Register ${new Date(user.date_joined).toDateString()}`,
      isCompleted: true,
    },
    {
      id: 'email-auth',
      label: 'Email Authenticated',
      isCompleted: user.state.email_authenticated,
    },
    {
      id: 'user-form',
      label: 'User Form',
      isCompleted: user.state.user_form_state === 'filled',
    },
    {
      id: 'onboarding-selected',
      label: 'Onboarding selected',
      description: appointment
        ? `Booked: ${new Date(appointment.start_time).toLocaleDateString()}`
        : user.state.self_onboarding_step_id
          ? 'Self onboarding'
          : 'Not selected',
      isCompleted: hasOnboardingPath,
    },
    {
      id: 'onboarded',
      label: 'Onboarded',
      isCompleted: user.state.is_onboarded,
    },
    ...(user.matches.unconfirmed.results.length > 0 &&
    user.matches.confirmed.results.length === 0
      ? [
          {
            id: 'pending-match-1',
            label: 'Has pending match',
            isCompleted: false,
          },
        ]
      : []),
    {
      id: 'first-match',
      label: 'First Match',
      isCompleted: user.matches.confirmed.results.length > 0,
    },
    ...(user.matches.unconfirmed.results.length > 0 &&
    user.matches.confirmed.results.length > 0
      ? [
          {
            id: 'pending-match-2',
            label: 'Has pending match',
            isCompleted: false,
          },
        ]
      : []),
  ];

  // Furthest completed step.
  let lastCompletedIndex = -1;
  for (let i = 0; i < stepsWithCompletion.length; i++) {
    if (stepsWithCompletion[i].isCompleted) {
      lastCompletedIndex = i;
    }
  }
  const activeStepIndex = lastCompletedIndex + 1;

  const steps = stepsWithCompletion.map(({ id, label, description }) => ({
    id,
    label,
    ...(description !== undefined ? { description } : {}),
  }));

  return (
    <StatusContainer>
      <Text type={TextTypes.Body4} center bold>
        Current Status
      </Text>
      <Stepper
        steps={steps}
        activeStepIndex={activeStepIndex}
        orientation={StepperOrientations.Vertical}
        size={StepperSizes.Medium}
      />
    </StatusContainer>
  );
};

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
  appointment?: any;
  isVolunteer: boolean;
}> = ({ user, appointment, isVolunteer }) => (
  <DetailsContainer>
    <DetailsList>
      {user.state.is_onboarded && (
        <InfoRow>
          <Text tag="h4" bold>
            Matching State:
          </Text>
          <Tag
            appearance={
              TagAppearance[
                user.state.searching_state === 'searching' ? 'success' : 'error'
              ]
            }
            size={TagSizes.small}
          >
            {user.state.searching_state}
          </Tag>
        </InfoRow>
      )}
      <DetailRow label="Id" value={user.id} />
      <DetailRow label="Email" value={user.email} />
      <DetailRow label="Company" value={user.state.company || '-'} />
      <DetailRow
        label="Residence"
        value={user.profile.country_of_residence || '-'}
      />
      <DetailRow
        label="Phone Number"
        value={`${user.profile.phone_mobile} (Notify via ${user.profile.phone_mobile})`}
      />
      <DetailRow
        label={isVolunteer ? 'Target Group' : 'Group'}
        value={
          isVolunteer
            ? (user.profile.target_group ?? 'No target group')
            : (user.profile.target_groups?.join(', ') ?? 'No groups')
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
    <UserStatus user={user} appointment={appointment} />
  </DetailsContainer>
);

// Main Component
export const UserCard: React.FC<UserCardProps> = ({
  user,
  appointment,
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
          hasPriority={user.state.has_match_priority}
          tooltipText={
            user.state.has_match_priority ? 'Match priority' : undefined
          }
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
            {formatDate(new Date(user.date_joined), 'cccc, LLLL do', 'en')} (
            {formatTimeDistance(new Date(user.date_joined), new Date(), 'en')})
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
          <UserDetails
            user={user}
            appointment={appointment}
            isVolunteer={isVolunteer}
          />
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
