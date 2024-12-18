import {
  Button,
  ButtonAppearance,
  ButtonSizes,
  Card,
  CardHeader,
  CardSizes,
  Link,
  Modal,
  Tag,
  TagSizes,
  Text,
} from '@a-little-world/little-world-design-system';
import React from 'react';

import { removeMatch } from '../../api';
import UserImage from '../../atoms/UserImage';
import { MATCH_STATUS } from '../../constants.js';
import { formatTimeDistance } from '../../helpers/date';
import { useGlobalState } from '../../store';

const ConfirmRemoveMatchDialog = ({ dialogOpen, onClose, match, userName }) => {
  const { updateCurrentUser } = useGlobalState();

  return (
    <Modal open={dialogOpen} onClose={onClose}>
      <Card className="items-center justify-center" width={CardSizes.Medium}>
        <CardHeader>Do you want to remove this match?</CardHeader>
        <Text>
          This will remove the match between {match.user1.profile.first_name}{' '}
          and {userName}
        </Text>
        <Button
          className="mt-4"
          appearance={ButtonAppearance.Secondary}
          size={ButtonSizes.Medium}
          backgroundColor={'red'}
          color={'red'}
          onClick={() => {
            removeMatch({
              match,
              onSuccess: () => {
                updateCurrentUser();
                onClose();
              },
              onError: error => console.error(error),
            });
          }}
        >
          Remove Match
        </Button>
      </Card>
    </Modal>
  );
};

const MatchCard = ({ match }: { match: any }) => {
  const [dialogOpen, setDialogOpen] = React.useState(false);
  const isProposed = match.status === MATCH_STATUS.proposed;

  return (
    <div className="w-full max-w-[320px] flex flex-col bg-white h-fit relative items-center justify-center rounded-xl p-4 gap-2 border border-border-slate-400">
      <Link
        to={'/user/' + match.user1.profile?.id}
        key={match.id}
        className="tooltip"
        data-tip={`${match.user1.profile.first_name} ${match.user1.profile.second_name}`}
      >
        <UserImage
          alt="match profile pic"
          user={match.user1.profile}
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
          match.user1.profile.user_type === 'volunteer' ? '#9631c5' : '#ec2525'
        }
        size={TagSizes.small}
      >
        {match.user1.profile.user_type}
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
        {match.user1.profile.first_name} {match.user1.profile.second_name}
      </Text>
      {!isProposed && (
        <>
          <div className="flex gap-2 items-center">
            <Text bold>Matched:</Text>
            <Text>
              {formatTimeDistance(new Date(match.created_at), new Date())}{' '}
            </Text>
          </div>
          {/* <div className="flex gap-2 items-center">
            <Text bold>Last Message:</Text>
            <Text>
              {match.chat.newest_message?.created
                ? formatTimeDistance(
                    new Date(match.chat.newest_message.created),
                    new Date(),
                  )
                : 'No messages yet'}
            </Text>
          </div> */}
          {/* <div className="flex gap-2 items-center">
            <Text bold>User active:</Text>
            <Text>N/A</Text>
          </div> */}
        </>
      )}
      <div className="flex gap-2">
        <Link
          buttonAppearance={ButtonAppearance.Secondary}
          buttonSize={ButtonSizes.Stretch}
          to={`/user/${match.user1.profile.id}`}
        >
          View profile
        </Link>
      </div>
    </div>
  );
};

export default MatchCard;
