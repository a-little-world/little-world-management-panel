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
} from '@a-little-world/little-world-design-system';
import { capitalize } from 'lodash';
import React from 'react';
import { useNavigate } from 'react-router-dom';
import useSWR from 'swr';

import type { MatchingPanelUser } from '../../../api/index';
import { MANAGEMENT_PERMISSION_IS_MAIN_SUPPORT_ACCOUNT } from '../../../constants/managementPermissions';
import { formatDate, formatTimeDistance } from '../../../helpers/date';
import { hasManagementPermission } from '../../../helpers/managementPermissions';
import { MATCHING_ROUTE } from '../../../router/routes';
import { dataFetcher, useGlobalState } from '../../../store';
import DataField from '../../atoms/DataField';
import MatchesIcons from '../../atoms/MatchesIcons';
import UserImage from '../../atoms/UserImage';
import UserAvailability from './UserAvailability';
import {
  AboutField,
  ActionContainer,
  BucketTag,
  ContentSection,
  DetailsColumn,
  FullContentGrid,
  FullName,
  HeaderContainer,
  ImageContainer,
  InfoGrid,
  InfoGridRow,
  InfoRow,
  InfoRowWrap,
  MatchesContainer,
  MetaFieldGroup,
  ProfileHeaderRow,
  ProfileIdentity,
  SectionLabel,
  SidebarColumn,
  SidebarSection,
  StatusContainer,
  StyledCard,
  UnresponsiveWarning,
  UserInfoContainer,
  UserNameContainer,
  ViewProfileLink,
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
  availability?: Record<string, string[]>;
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
  uuid?: string;
  hash?: string;
  email: string;
  date_joined: string;
  last_login?: string | null;
  profile: UserProfile;
  state: UserState;
  matches: UserMatches;
  bucket?: string;
}

interface UserCardProps {
  user: User;
  appointment?: { start_time: string; end_time: string };
  deselectUser?: (userId: string) => void;
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
      <SectionLabel>Current status</SectionLabel>
      <Stepper
        steps={steps}
        activeStepIndex={activeStepIndex}
        orientation={StepperOrientations.Vertical}
        size={StepperSizes.Medium}
      />
    </StatusContainer>
  );
};

const MatchEligibility: React.FC<{ userId: string }> = ({ userId }) => {
  const {
    data: waitingTime,
    error: waitingTimeError,
    isLoading,
  } = useSWR(`/api/matching/users/${userId}/match_waiting_time/`, dataFetcher);

  if (isLoading) return <Loading />;

  if (waitingTimeError) return <Text>Error fetching</Text>;

  return (
    <Text
      color={
        waitingTime?.first_search && waitingTime?.number_of_days > 0
          ? 'red'
          : undefined
      }
    >
      {waitingTime.waiting_time_string}
    </Text>
  );
};

const UserDetailsFull: React.FC<{
  user: User;
  appointment?: any;
  isVolunteer: boolean;
}> = ({ user, appointment, isVolunteer }) => (
  <FullContentGrid>
    <DetailsColumn>
      <InfoGrid>
        {user.state.is_onboarded && (
          <InfoGridRow>
            <Text tag="span" bold>
              Matching State:
            </Text>
            <Tag
              appearance={
                TagAppearance[
                  user.state.searching_state === 'searching'
                    ? 'success'
                    : 'error'
                ]
              }
              size={TagSizes.small}
            >
              {user.state.searching_state}
            </Tag>
          </InfoGridRow>
        )}
        <DataField title="Id" value={user.id} />
        <DataField title="Email" value={user.email} />
        <DataField title="Company" value={user.state.company || '-'} />
        <DataField
          title="Residence"
          value={user.profile.country_of_residence || '-'}
        />
        <DataField
          title="Phone Number"
          value={`${user.profile.phone_mobile} (Notify via ${user.profile.phone_mobile})`}
        />
        <DataField
          title={isVolunteer ? 'Target Group' : 'Group'}
          value={
            isVolunteer
              ? (user.profile.target_group ?? 'No target group')
              : (user.profile.target_groups?.join(', ') ?? 'No groups')
          }
        />
        <DataField
          title="Gender Preference"
          value={user.profile.partner_gender}
        />
        <DataField
          title="Job Search"
          value={user.profile.job_search ? 'Yes' : 'No'}
        />
        <DataField
          title="Joined"
          value={formatDate(new Date(user.date_joined), 'dd.MM.yy', 'en')}
        />
        <DataField
          title="Last login"
          value={
            user.last_login
              ? formatTimeDistance(new Date(user.last_login), new Date(), 'en')
              : 'Never'
          }
        />
      </InfoGrid>

      <ContentSection>
        <SectionLabel>About</SectionLabel>
        <AboutField tag="div">{user.profile.description}</AboutField>
      </ContentSection>

      <ContentSection>
        <SectionLabel>Availability</SectionLabel>
        <UserAvailability availability={user.profile.availability} />
      </ContentSection>

      <ContentSection>
        <SectionLabel>Interests</SectionLabel>
        <Tags content={user.profile.interests} />
      </ContentSection>

      <ContentSection>
        <SectionLabel>Languages</SectionLabel>
        <UserLanguages langSkill={user.profile.lang_skill} />
      </ContentSection>

      {user.profile.job_skill_description && (
        <ContentSection>
          <SectionLabel>Job skills</SectionLabel>
          <AboutField tag="div">
            {user.profile.job_skill_description}
          </AboutField>
        </ContentSection>
      )}
    </DetailsColumn>

    <SidebarColumn>
      <SidebarSection>
        <SectionLabel>Match eligibility</SectionLabel>
        <MatchEligibility userId={user.id} />
      </SidebarSection>

      <SidebarSection>
        <SectionLabel>Matches</SectionLabel>
        <MatchesContainer>
          <MatchesIcons
            label="Confirmed"
            matches={user.matches.confirmed?.results}
          />
          <MatchesIcons
            label="Unconfirmed"
            matches={user.matches.unconfirmed?.results}
          />
          <MatchesIcons
            label="Proposed"
            matches={user.matches.proposed?.results}
          />
        </MatchesContainer>
      </SidebarSection>

      <ViewProfileLink>
        <Link
          href={`https://little-world.com/app/profile/${user.uuid ?? user.hash}`}
          target="_blank"
          buttonAppearance={ButtonAppearance.Secondary}
          buttonSize={ButtonSizes.Stretch}
        >
          View App Profile
        </Link>
      </ViewProfileLink>

      <UserStatus user={user} appointment={appointment} />
    </SidebarColumn>
  </FullContentGrid>
);

export const UserCard: React.FC<UserCardProps> = ({
  user,
  appointment,
  deselectUser,
  partial = true,
  tiny = false,
  horizontal = false,
}) => {
  const navigate = useNavigate();
  const { addUserToMatching, panelUser } = useGlobalState();
  const canViewProfile = hasManagementPermission(
    panelUser as MatchingPanelUser | undefined,
    MANAGEMENT_PERMISSION_IS_MAIN_SUPPORT_ACCOUNT,
  );

  if (!user) return <div>Undefined User</div>;

  const isVolunteer = user.profile.user_type === 'volunteer';
  const isFull = !partial;

  const onAddToMatching = () => {
    addUserToMatching(user);
    navigate(MATCHING_ROUTE);
  };

  const handleDeselectUser = (e: React.MouseEvent<HTMLButtonElement>) => {
    deselectUser?.(user.uuid ?? user.hash ?? '');
    e.stopPropagation();
  };

  if (isFull) {
    return (
      <StyledCard $full>
        {user.state.unresponsive && (
          <UnresponsiveWarning>Marked as unresponsive</UnresponsiveWarning>
        )}

        <HeaderContainer>
          <Tag bold color={isVolunteer ? '#9631c5' : '#ec2525'}>
            {capitalize(user.profile.user_type)}
          </Tag>
          {user.bucket && (
            <Tag bold color="#000000">
              {user.bucket}
            </Tag>
          )}
        </HeaderContainer>

        <ProfileHeaderRow>
          <UserImage
            hasPriority={user.state.has_match_priority}
            tooltipText={
              user.state.has_match_priority ? 'Match priority' : undefined
            }
            alt="user profile pic"
            user={user.profile}
            dimensions={{ height: 120, width: 120 }}
          />
          <ProfileIdentity>
            <FullName>
              {user.profile.first_name} {user.profile.second_name}
            </FullName>
          </ProfileIdentity>
        </ProfileHeaderRow>

        <UserDetailsFull
          user={user}
          appointment={appointment}
          isVolunteer={isVolunteer}
        />
      </StyledCard>
    );
  }

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
        <InfoRowWrap>
          <MetaFieldGroup>
            <Text tag="h4" bold>
              Joined:
            </Text>
            <Text>
              {formatDate(new Date(user.date_joined), 'dd.MM.yy', 'en')}
            </Text>
          </MetaFieldGroup>
          <MetaFieldGroup>
            <Text tag="h4" bold>
              Last login:
            </Text>
            <Text>
              {user.last_login
                ? formatTimeDistance(
                    new Date(user.last_login),
                    new Date(),
                    'en',
                  )
                : 'Never'}
            </Text>
          </MetaFieldGroup>
        </InfoRowWrap>
        {canViewProfile && <Link to={`/user/${user.id}`}>View profile</Link>}
        <InfoRow>
          <Text className="whitespace-nowrap" tag="h4" bold>
            Match eligibility:
          </Text>
          <MatchEligibility userId={user.id} />
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

      <ActionContainer $horizontal={horizontal}>
        <Link to={`/user/${user.id}?tab=chat`} state={{ openTab: 'chat' }}>
          Open chat
        </Link>
        {!horizontal && (
          <Button variation={ButtonVariations.Inline} onClick={onAddToMatching}>
            Match
          </Button>
        )}
      </ActionContainer>
    </StyledCard>
  );
};

export default UserCard;
