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

import UserImage from '../../atoms/UserImage';
import { MATCH_STATUS } from '../../constants.js';
import { formatTimeDistance } from '../../helpers/date';
import { useGlobalState } from '../../store';
import ConfirmUnmatchModal from './ConfirmUnmatchModal';

const UserMatch = ({ match, userName }: { match: any; userName: string }) => {
  const [dialogOpen, setDialogOpen] = React.useState(false);
  const isProposed = match.status === MATCH_STATUS.proposed;
  const { updateCurrentUser } = useGlobalState();

  //className="w-full max-w-[320px] flex flex-col bg-white h-fit relative items-center justify-center rounded-xl p-8 gap-2 border border-border-slate-400"
  return (
    <Card width={CardSizes.Small}>
      <ConfirmUnmatchModal
        dialogOpen={dialogOpen}
        onClose={() => setDialogOpen(false)}
        onMatchUpdate={() => updateCurrentUser()}
        matchId={match.id}
        user1Name={userName}
        user2Name={match.partner.first_name}
      />
      <CardContent $align="center" className="relative">
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
          className="absolute top-2 left-2"
          color={
            match.partner.user_type === 'volunteer' ? '#9631c5' : '#ec2525'
          }
          size={TagSizes.small}
        >
          {match.partner.user_type}
        </Tag>
        <Tag
          bold
          className="absolute top-10 left-2"
          color={'#000000'}
          size={TagSizes.small}
        >
          {match?.bucket}
        </Tag>
        {!isProposed && (
          <div className="absolute top-2 right-2">
            <Button
              appearance={ButtonAppearance.Secondary}
              color={'red'}
              backgroundColor={'red'}
              onClick={() => {
                setDialogOpen(true);
              }}
              size={ButtonSizes.Small}
            >
              Remove
            </Button>
          </div>
        )}
        <Text bold>
          {match.partner.first_name} {match.partner.second_name}
        </Text>
        {!isProposed && (
          <div>
            <div className="flex gap-2 items-center">
              <Text bold>Matched:</Text>
              <Text>
                {formatTimeDistance(new Date(match.chat.created), new Date())}{' '}
              </Text>
            </div>
            <div className="flex gap-2 items-center mb-2">
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
          </div>
        )}
        <div className="flex gap-3">
          <Link to={'/match/' + match.id}>View Match</Link>
          <Link to={`/user/${match.partner.id}`}>View profile</Link>
        </div>
      </CardContent>
    </Card>
  );
};

export default UserMatch;
