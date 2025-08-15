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
import styled from 'styled-components';

import { LANGUAGES, MATCH_STATUS } from '../../../constants';
import { formatTimeDistance } from '../../../helpers/date';
import DataField from '../../atoms/DataField';
import MatchReport, { getMatchReportProps } from '../../atoms/MatchReport';
import Stat from '../../atoms/Stats/Stat';
import UserImage from '../../atoms/UserImage';
import ConfirmUnmatchModal from './ConfirmUnmatchModal';

const Container = styled.div`
  position: relative;
  display: flex;
  flex-direction: column;
  gap: ${({ theme }) => theme.spacing.medium};
  border: ${({ theme }) => theme.color.border.subtle} solid 1px;
  border-radius: ${({ theme }) => theme.radius.small};
  padding: ${({ theme }) => `${theme.spacing.large} ${theme.spacing.xxlarge}`};
  max-width: 480px;
  width: 100%;
  margin: 0 auto;
`;

const MatchUsers = styled.div`
  display: flex;
  align-items: center;
  justify-content: center;
  flex-wrap: no-wrap;
  gap: ${({ theme }) => theme.spacing.small};
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

const Stats = styled.div`
  display: flex;
  align-items: center;
  gap: ${({ theme }) => theme.spacing.medium};
  margin-bottom: ${({ theme }) => theme.spacing.medium};
  width: 100%;
`;

const StyledTag = styled(Tag)`
  position: absolute;
  top: -6px;
  left: 50%;
  transform: translateX(-50%);
`;

const Info = styled.div``;

const UnmatchButton = styled(Button)`
  width: 320px;
  max-width: 100%;
  margin: auto;
`;

const StyledMatchReport = styled(MatchReport)`
  margin-bottom: ${({ theme }) => theme.spacing.xxsmall};
`;

const UserInfo = ({ user, match }: { match: any; user: any }) => (
  <UserInfoContainer>
    <Link to={`/user/${user.id}`} key={match.id} className="tooltip">
      <UserImage
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

const MatchCard = ({
  match,
  onMatchUpdate,
}: {
  match: any;
  onMatchUpdate: any;
}) => {
  const [dialogOpen, setDialogOpen] = React.useState(false);
  const isProposed = match.status === MATCH_STATUS.proposed;

  return (
    <>
      <Container>
        <MatchUsers>
          <UserInfo user={match.user1} match={match} />
          <Logo label="Little World Logo" width={'64px'} />
          <UserInfo user={match.user2} match={match} />
        </MatchUsers>
        <Info>
          {!match.active && (
            <StyledMatchReport {...getMatchReportProps(match, isProposed)} />
          )}
          <DataField title="Status" value={match.status} />
          <DataField
            title="Matched"
            value={formatTimeDistance(
              new Date(match.created_at),
              new Date(),
              LANGUAGES.en,
            )}
          />
          <DataField
            title="Last interaction"
            value={formatTimeDistance(
              new Date(match.latest_interaction_at),
              new Date(),
              LANGUAGES.en,
            )}
          />
        </Info>
        <Stats>
          <Stat
            label="No. of messages"
            stat={match.total_messages_counter}
            withBorder
          />
          <Stat
            label="No. of video calls"
            stat={match.total_mutal_video_calls_counter}
            withBorder
          />
        </Stats>

        {!isProposed && match.active && (
          <UnmatchButton
            appearance={ButtonAppearance.Secondary}
            size={ButtonSizes.Large}
            color={'red'}
            backgroundColor={'red'}
            onClick={() => {
              setDialogOpen(true);
            }}
          >
            Unmatch
          </UnmatchButton>
        )}
      </Container>
      <ConfirmUnmatchModal
        dialogOpen={dialogOpen}
        onClose={() => setDialogOpen(false)}
        onMatchUpdate={onMatchUpdate}
        matchId={match.uuid}
        user1Name={match.user1.profile.first_name}
        user2Name={match.user2.profile.first_name}
      />
    </>
  );
};

const SelectedMatchCardContainer = styled.div`
  padding: 10px;
  border: 1px solid #ccc;
  border-radius: 8px;
  width: 300px;
`;

const SelectedMatchUsers = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
`;

const SelectedInfo = styled.div`
  margin-top: 10px;
`;

const SelectedStats = styled.div`
  display: flex;
  justify-content: space-between;
  margin-top: 10px;
`;

const ViewDetailsButton = styled(Button)`
  margin-top: 10px;
`;

export const SelectedMatchCard = ({
  match,
  onViewDetails,
}: {
  match: any;
  onViewDetails: () => void;
}) => {
  const isProposed = match.status === MATCH_STATUS.proposed;

  return (
    <SelectedMatchCardContainer>
      <SelectedMatchUsers>
        <UserInfo user={match.user1} match={match} />
        <Logo label="Little World Logo" width={'32px'} />
        <UserInfo user={match.user2} match={match} />
      </SelectedMatchUsers>
      <SelectedInfo>
        <DataField title="Status" value={match.status} />
        <DataField
          title="Matched"
          value={formatTimeDistance(
            new Date(match.created_at),
            new Date(),
            LANGUAGES.de,
          )}
        />
        <DataField
          title="Last interaction"
          value={formatTimeDistance(
            new Date(match.latest_interaction_at),
            new Date(),
            LANGUAGES.de,
          )}
        />
      </SelectedInfo>
      <SelectedStats>
        <Stat label="Messages" stat={match.total_messages_counter} />
        <Stat
          label="Video Calls"
          stat={match.total_mutal_video_calls_counter}
        />
      </SelectedStats>
      <ViewDetailsButton
        appearance={ButtonAppearance.Secondary}
        size={ButtonSizes.Small}
        onClick={onViewDetails}
      >
        View Details
      </ViewDetailsButton>
    </SelectedMatchCardContainer>
  );
};

export default MatchCard;
