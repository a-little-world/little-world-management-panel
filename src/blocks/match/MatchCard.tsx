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

import DataField from '../../atoms/DataField';
import Stat from '../../atoms/Stat';
import UserImage from '../../atoms/UserImage';
import { MATCH_STATUS } from '../../constants.js';
import { formatTimeDistance } from '../../helpers/date';
import ConfirmUnmatchModal from './ConfirmUnmatchModal';

const Container = styled.div`
  position: relative;
  display: flex;
  flex-direction: column;
  gap: ${({ theme }) => theme.spacing.medium};
  border: ${({ theme }) => theme.color.border.subtle} solid 1px;
  border-radius: ${({ theme }) => theme.radius.small};
  padding: ${({ theme }) => `${theme.spacing.large} ${theme.spacing.medium}`};
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
  justify-content: center;
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

const Info = styled.div`
  padding-left: 56px;
`;

const UnmatchButton = styled(Button)`
  width: 320px;
  max-width: 100%;
  margin: auto;
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
          <Logo label="Little World Logo" labelId="LW" width={'64px'} />
          <UserInfo user={match.user2} match={match} />
        </MatchUsers>
        <Info>
          <DataField title="Status" value={match.status} />
          <DataField
            title="Matched"
            value={formatTimeDistance(new Date(match.created_at), new Date())}
          />
          <DataField
            title="Last interaction"
            value={formatTimeDistance(
              new Date(match.latest_interaction_at),
              new Date(),
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

        {!isProposed && (
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

export default MatchCard;
