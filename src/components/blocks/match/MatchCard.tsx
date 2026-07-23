import {
  Button,
  ButtonAppearance,
  ButtonSizes,
  Link,
  Logo,
  Tag,
  TagSizes,
  Text,
  TextTypes,
} from '@a-little-world/little-world-design-system';
import React from 'react';
import styled, { css } from 'styled-components';

import { LANGUAGES, MATCH_STATUS } from '../../../constants';
import {
  formatDate,
  formatDurationSeconds,
  formatTimeDistance,
  formatRoundedDuration,
} from '../../../helpers/date';
import DataField from '../../atoms/DataField';
import MatchReport, { getMatchReportProps } from '../../atoms/MatchReport';
import Stat from '../../atoms/stats/Stat';
import {
  BreakdownLabel,
  BreakdownList,
  BreakdownRow,
  BreakdownValue,
  StatCard,
  StatCards,
  StatLabel,
  StatValue,
} from '../../atoms/stats/StatCard';
import UserImage from '../../atoms/UserImage';
import MatchProgress from './MatchProgress';

const CardRoot = styled.div<{ $variant: 'full' | 'compact' }>`
  position: relative;
  display: flex;
  flex-direction: column;
  width: 100%;

  ${({ $variant, theme }) =>
    $variant === 'full'
      ? css`
          gap: ${theme.spacing.medium};
          border: ${theme.color.border.subtle} solid 1px;
          border-radius: ${theme.radius.small};
          padding: ${theme.spacing.large} ${theme.spacing.xxlarge};
          background: ${theme.color.surface.primary};
        `
      : css`
          padding: 10px;
          border: 1px solid #ccc;
          border-radius: 8px;
        `}
`;

const FullContentGrid = styled.div`
  display: grid;
  grid-template-columns: minmax(0, 1fr);
  align-items: stretch;
  gap: ${({ theme }) => theme.spacing.large};

  @media (min-width: ${({ theme }) => theme.breakpoints.large}) {
    grid-template-columns: minmax(0, 1fr) minmax(280px, 400px);
  }
`;

const MatchDetailsColumn = styled.div`
  display: flex;
  flex-direction: column;
  gap: ${({ theme }) => theme.spacing.medium};
`;

const InfoGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(2, max-content);
  justify-content: start;
  column-gap: ${({ theme }) => theme.spacing.medium};
  row-gap: ${({ theme }) => theme.spacing.xxsmall};
`;

const TimestampSection = styled.div`
  display: flex;
  flex-direction: column;
  gap: ${({ theme }) => theme.spacing.xxsmall};
  padding-top: ${({ theme }) => theme.spacing.xsmall};
  border-top: ${({ theme }) => theme.color.border.subtle} solid 1px;
`;

const SectionLabel = styled(Text).attrs({
  type: TextTypes.Body7,
  tag: 'span' as const,
})`
  text-transform: uppercase;
  letter-spacing: 0.06em;
  color: ${({ theme }) => theme.color.text.secondary};
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

const MatchStatsCards = styled(StatCards)`
  padding: 0;
  width: 100%;
`;

const DurationStatValue = styled(StatValue)`
  font-size: 1.25rem;
  line-height: 1.2;
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

const ViewDetailsButton = styled(Button)`
  margin-top: 10px;
`;

const StyledMatchReport = styled(MatchReport)`
  margin-bottom: ${({ theme }) => theme.spacing.xxsmall};
`;

const UserInfo = ({ user, match }: { match: any; user: any }) => (
  <UserInfoContainer>
    <Link
      to={`/user/${user.id}`}
      key={match.id}
      className="tooltip"
      textDecoration={false}
    >
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
}

interface MatchCardPropsCompact {
  variant: 'compact';
  match: any;
  onViewDetails: () => void;
}

export type MatchCardProps = MatchCardPropsFull | MatchCardPropsCompact;

const formatPanelInstant = (iso: string | null | undefined, locale: string) =>
  iso ? formatDate(new Date(iso), 'dd.MM.yy HH:mm', locale) : 'n/a';

const formatAverageVideoCallDuration = (
  seconds: number | null | undefined,
) => (seconds != null ? formatDurationSeconds(seconds) : 'n/a');

const formatTotalVideoCallDuration = (
  seconds: number | null | undefined,
) =>
  seconds != null ? formatRoundedDuration(seconds) : 'n/a';

const MatchCard = (props: MatchCardProps) => {
  const { match } = props;
  const variant = props.variant ?? 'full';
  const isCompact = variant === 'compact';
  const onViewDetails = isCompact
    ? (props as MatchCardPropsCompact).onViewDetails
    : undefined;

  const isProposed = match.status === MATCH_STATUS.proposed;
  const timeLocale = isCompact ? LANGUAGES.de : LANGUAGES.en;

  const compactCard = (
    <CardRoot $variant={variant}>
      <MatchUsersRow $variant={variant}>
        <UserInfo user={match.user1} match={match} />
        <Logo label="Little World Logo" width="32px" />
        <UserInfo user={match.user2} match={match} />
      </MatchUsersRow>
      <InfoSection $variant={variant}>
        <DataField title="Status" value={match.status} />
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
      </InfoSection>
      <StatsRow $variant={variant}>
        <Stat label="Messages" stat={match.total_messages_counter} />
        <Stat
          label="Video Calls"
          stat={match.total_mutal_video_calls_counter}
        />
        <Stat
          label="Avg. call duration"
          stat={formatAverageVideoCallDuration(
            match.average_video_call_duration_seconds,
          )}
        />
        <Stat
          label="Median call duration"
          stat={formatAverageVideoCallDuration(
            match.median_video_call_duration_seconds,
          )}
        />
      </StatsRow>
      <ViewDetailsButton
        appearance={ButtonAppearance.Secondary}
        size={ButtonSizes.Small}
        onClick={onViewDetails}
      >
        View Details
      </ViewDetailsButton>
    </CardRoot>
  );

  const fullCard = (
    <CardRoot $variant={variant}>
      <MatchUsersRow $variant={variant}>
        <UserInfo user={match.user1} match={match} />
        <Logo label="Little World Logo" width="64px" />
        <UserInfo user={match.user2} match={match} />
      </MatchUsersRow>
      {!match.active && (
        <StyledMatchReport {...getMatchReportProps(match, isProposed)} />
      )}
      <FullContentGrid>
        <MatchDetailsColumn>
          <InfoGrid>
            <DataField title="Status" value={match.status} />
            <DataField title="Type" value={match.match_type} />
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
          </InfoGrid>
          <TimestampSection>
            <SectionLabel>Recent activity</SectionLabel>
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
          </TimestampSection>
          <MatchStatsCards>
            <StatCard>
              <StatValue>{match.total_messages_counter}</StatValue>
              <StatLabel>Total messages</StatLabel>
            </StatCard>
            <StatCard>
              <StatValue>{match.total_mutal_video_calls_counter}</StatValue>
              <StatLabel>Total video calls</StatLabel>
            </StatCard>
            <StatCard>
              <DurationStatValue>
                {formatTotalVideoCallDuration(
                  match.total_video_call_duration_seconds,
                )}
              </DurationStatValue>
              <StatLabel>Total video call duration</StatLabel>
              <BreakdownList>
                <BreakdownRow>
                  <BreakdownLabel>Average</BreakdownLabel>
                  <BreakdownValue>
                    {formatAverageVideoCallDuration(
                      match.average_video_call_duration_seconds,
                    )}
                  </BreakdownValue>
                </BreakdownRow>
                <BreakdownRow>
                  <BreakdownLabel>Median</BreakdownLabel>
                  <BreakdownValue>
                    {formatAverageVideoCallDuration(
                      match.median_video_call_duration_seconds,
                    )}
                  </BreakdownValue>
                </BreakdownRow>
              </BreakdownList>
            </StatCard>
          </MatchStatsCards>
        </MatchDetailsColumn>
        <MatchProgress match={match} />
      </FullContentGrid>
    </CardRoot>
  );

  return <>{isCompact ? compactCard : fullCard}</>;
};

export default MatchCard;
