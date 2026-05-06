import {
  Button,
  ButtonAppearance,
  ButtonSizes,
  Link,
  Logo,
  Tag,
  TagSizes,
  Text,
} from '@a-little-world/little-world-design-system';
import React from 'react';
import styled, { css } from 'styled-components';

import { LANGUAGES, MATCH_STATUS } from '../../../constants';
import { formatDate, formatTimeDistance } from '../../../helpers/date';
import DataField from '../../atoms/DataField';
import MatchReport, { getMatchReportProps } from '../../atoms/MatchReport';
import Stat from '../../atoms/Stats/Stat';
import UserImage from '../../atoms/UserImage';
import ConfirmUnmatchModal from './ConfirmUnmatchModal';

const CardRoot = styled.div<{ $variant: 'full' | 'compact' }>`
  position: relative;
  display: flex;
  flex-direction: column;

  ${({ $variant, theme }) =>
    $variant === 'full'
      ? css`
          gap: ${theme.spacing.medium};
          border: ${theme.color.border.subtle} solid 1px;
          border-radius: ${theme.radius.small};
          padding: ${theme.spacing.large} ${theme.spacing.xxlarge};
          max-width: 480px;
          width: 100%;
          margin: 0 auto;
        `
      : css`
          padding: 10px;
          border: 1px solid #ccc;
          border-radius: 8px;
          width: 300px;
        `}
`;

const MatchUsersRow = styled.div<{ $variant: 'full' | 'compact' }>`
  display: flex;
  align-items: center;

  ${({ $variant, theme }) =>
    $variant === 'full'
      ? css`
          justify-content: center;
          flex-wrap: nowrap;
          gap: ${theme.spacing.small};
        `
      : css`
          justify-content: space-between;
        `}
`;

const UserInfoContainer = styled.div`
  position: relative;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  max-width: 240px;
  gap: ${({ theme }) => theme.spacing.small};
`;

const StatsRow = styled.div<{ $variant: 'full' | 'compact' }>`
  display: flex;
  width: 100%;

  ${({ $variant, theme }) =>
    $variant === 'full'
      ? css`
          align-items: center;
          gap: ${theme.spacing.medium};
          margin-bottom: ${theme.spacing.medium};
        `
      : css`
          justify-content: space-between;
          margin-top: 10px;
        `}
`;

const StyledTag = styled(Tag)`
  position: absolute;
  top: -6px;
  left: 50%;
  transform: translateX(-50%);
`;

const InfoSection = styled.div<{ $variant: 'full' | 'compact' }>`
  ${({ $variant }) =>
    $variant === 'compact' &&
    css`
      margin-top: 10px;
    `}
`;

const UnmatchButton = styled(Button)`
  width: 320px;
  max-width: 100%;
  margin: auto;
`;

const ViewDetailsButton = styled(Button)`
  margin-top: 10px;
`;

const StyledMatchReport = styled(MatchReport)`
  margin-bottom: ${({ theme }) => theme.spacing.xxsmall};
`;

const UserInfo = ({ user, match }: { match: any; user: any }) => (
  <UserInfoContainer>
    <Link to={`/user/${user.id}`} key={match.id} className="tooltip">
      <UserImage
        hasPriority={user.has_match_priority}
        alt="match user pic"
        user={user.profile}
        dimensions={{
          height: 120,
          width: 120,
        }}
      />
    </Link>
    <Text bold>
      {user.profile.first_name} {user.profile.second_name}
    </Text>
    <StyledTag
      bold
      color={user.profile.user_type === 'volunteer' ? '#9631c5' : '#ec2525'}
      size={TagSizes.small}
    >
      {user.profile.user_type}
    </StyledTag>
  </UserInfoContainer>
);

interface MatchCardPropsFull {
  variant?: 'full';
  match: any;
  onMatchUpdate: any;
}

interface MatchCardPropsCompact {
  variant: 'compact';
  match: any;
  onViewDetails: () => void;
}

export type MatchCardProps = MatchCardPropsFull | MatchCardPropsCompact;

const formatPanelInstant = (iso: string | null | undefined, locale: string) =>
  iso ? formatDate(new Date(iso), 'dd.MM.yy HH:mm', locale) : 'n/a';

const MatchCard = (props: MatchCardProps) => {
  const { match } = props;
  const variant = props.variant ?? 'full';
  const isCompact = variant === 'compact';
  const onMatchUpdate = !isCompact
    ? (props as MatchCardPropsFull).onMatchUpdate
    : undefined;
  const onViewDetails = isCompact
    ? (props as MatchCardPropsCompact).onViewDetails
    : undefined;

  const [dialogOpen, setDialogOpen] = React.useState(false);
  const isProposed = match.status === MATCH_STATUS.proposed;
  const timeLocale = isCompact ? LANGUAGES.de : LANGUAGES.en;

  return (
    <>
      <CardRoot $variant={variant}>
        <MatchUsersRow $variant={variant}>
          <UserInfo user={match.user1} match={match} />
          <Logo label="Little World Logo" width={isCompact ? '32px' : '64px'} />
          <UserInfo user={match.user2} match={match} />
        </MatchUsersRow>
        <InfoSection $variant={variant}>
          {!isCompact && !match.active && (
            <StyledMatchReport {...getMatchReportProps(match, isProposed)} />
          )}
          <DataField title="Status" value={match.status} />
          {!isCompact && <DataField title="Type" value={match.match_type} />}
          <DataField
            title="Matched"
            value={formatTimeDistance(
              new Date(match.created_at),
              new Date(),
              timeLocale,
            )}
          />
          <DataField
            title="Last interaction"
            value={formatTimeDistance(
              new Date(match.latest_interaction_at),
              new Date(),
              timeLocale,
            )}
          />
          {!isCompact && (
            <>
              <DataField
                title="Last video call"
                value={formatPanelInstant(match.last_video_call_at, timeLocale)}
              />
              <DataField
                title={`Last message by ${match.user1.profile.first_name} at`}
                value={formatPanelInstant(
                  match.user1_last_message_at,
                  timeLocale,
                )}
              />
              <DataField
                title={`Last message sent by ${match.user2.profile.first_name} at`}
                value={formatPanelInstant(
                  match.user2_last_message_at,
                  timeLocale,
                )}
              />
            </>
          )}
        </InfoSection>
        <StatsRow $variant={variant}>
          <Stat
            label={isCompact ? 'Messages' : 'No. of messages'}
            stat={match.total_messages_counter}
            withBorder={!isCompact}
          />
          <Stat
            label={isCompact ? 'Video Calls' : 'No. of video calls'}
            stat={match.total_mutal_video_calls_counter}
            withBorder={!isCompact}
          />
        </StatsRow>

        {!isCompact && !isProposed && match.active && (
          <UnmatchButton
            appearance={ButtonAppearance.Secondary}
            size={ButtonSizes.Large}
            color={'#faf4f4'}
            backgroundColor={'red'}
            onClick={() => {
              setDialogOpen(true);
            }}
          >
            Unmatch
          </UnmatchButton>
        )}
        {isCompact && (
          <ViewDetailsButton
            appearance={ButtonAppearance.Secondary}
            size={ButtonSizes.Small}
            onClick={onViewDetails}
          >
            View Details
          </ViewDetailsButton>
        )}
      </CardRoot>
      {!isCompact && onMatchUpdate !== undefined && (
        <ConfirmUnmatchModal
          dialogOpen={dialogOpen}
          onClose={() => setDialogOpen(false)}
          onMatchUpdate={onMatchUpdate}
          matchId={match.uuid}
          user1Name={match.user1.profile.first_name}
          user2Name={match.user2.profile.first_name}
        />
      )}
    </>
  );
};

export default MatchCard;
