import {
  Button,
  ButtonAppearance,
  ButtonSizes,
  Card,
  CardContent,
  CardSizes,
  Link,
  Tag,
  TagSizes,
  Text,
} from '@a-little-world/little-world-design-system';
import React from 'react';
import styled, { css } from 'styled-components';

import MatchReport from '../../atoms/MatchReport';
import UserImage from '../../atoms/UserImage';
import { MATCH_STATUS } from '../../constants';
import { formatTimeDistance } from '../../helpers/date';
import { useGlobalState } from '../../store';
import ConfirmUnmatchModal from './ConfirmUnmatchModal';

const UserMatchCard = styled(Card)<{ $inactive: boolean }>`
 display: inline-flex;
 margin-bottom: ${({ theme }) => theme.spacing.xsmall};
 vertical-align: top;

 &:not(:last-child) {
    margin-right: ${({ theme }) => theme.spacing.xsmall};
  } 
}

${({ $inactive, theme }) =>
  $inactive &&
  css`
    background: ${theme.color.surface.error};
    border: 1px solid ${theme.color.border.error};
  `}
`;

const Overview = styled.div`
  text-align: center;
  width: 100%;
`;

const Info = styled.div`
  width: 100%;
  margin-bottom: ${({ theme }) => theme.spacing.xxsmall};
`;

const StyledMatchReport = styled(MatchReport)`
  margin-top: ${({ theme }) => theme.spacing.xxsmall};
`;

const Bucket = styled(Tag)`
  margin: ${({ theme }) => theme.spacing.xxsmall} auto;
`;

const UserMatch = ({ match, userName }: { match: any; userName: string }) => {
  const [dialogOpen, setDialogOpen] = React.useState(false);
  const isProposed = match.status === MATCH_STATUS.proposed;
  const inactive = isProposed ? match.closed : match.closed || !match.active;
  const { updateCurrentUser } = useGlobalState();

  return (
    <UserMatchCard width={CardSizes.Small} $inactive={inactive}>
      <ConfirmUnmatchModal
        dialogOpen={dialogOpen}
        onClose={() => setDialogOpen(false)}
        onMatchUpdate={() => updateCurrentUser()}
        matchId={match.id}
        user1Name={userName}
        user2Name={match.partner.first_name}
      />
      <CardContent $align="center" className="relative" $marginBottom="0">
        <Link to={'/user/' + match.partner?.id} textDecoration={false}>
          <UserImage
            alt="match profile pic"
            user={match.partner}
            dimensions={{
              height: 120,
              width: 120,
            }}
          />
        </Link>

        <Tag
          bold
          className="absolute top-0 left-0"
          color={
            match.partner.user_type === 'volunteer' ? '#9631c5' : '#ec2525'
          }
          size={TagSizes.small}
        >
          {match.partner.user_type}
        </Tag>
        <Overview>
          <Text bold>
            {match.partner.first_name} {match.partner.second_name}
          </Text>
          {match.bucket && (
            <Bucket bold color={'#000000'} size={TagSizes.small}>
              {match?.bucket}
            </Bucket>
          )}
          <StyledMatchReport
            match={match}
            inactive={inactive}
            isProposed={isProposed}
          />
        </Overview>
        {!isProposed && (
          <Info>
            <div className="flex gap-2 items-center">
              <Text bold>Matched:</Text>
              <Text>
                {formatTimeDistance(new Date(match.chat.created), new Date())}{' '}
              </Text>
            </div>
            <div className="flex gap-2 items-center">
              <Text bold>Last Message:</Text>
              <Text>
                {match.chat.newest_message?.created
                  ? formatTimeDistance(
                      new Date(match.chat.newest_message.created),
                      new Date(),
                    )
                  : 'No messages yet'}
              </Text>
            </div>
          </Info>
        )}
        <div className="flex gap-3">
          {!isProposed && <Link to={'/match/' + match.id}>View Match</Link>}
          <Link to={`/user/${match.partner.id}`}>View Profile</Link>
        </div>
        {!isProposed && !inactive && (
          <Button
            appearance={ButtonAppearance.Secondary}
            color={'red'}
            backgroundColor={'red'}
            onClick={() => {
              setDialogOpen(true);
            }}
            size={ButtonSizes.Large}
          >
            Remove
          </Button>
        )}
      </CardContent>
    </UserMatchCard>
  );
};

export default UserMatch;
