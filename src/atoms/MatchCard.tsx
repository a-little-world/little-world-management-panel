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

import { removeMatch } from '../api';
import { formatTimeDistance } from '../helpers/date';
import { useGlobalState } from '../store';
import UserImage from './UserImage';

const ConfirmRemoveMatchDialog = ({ dialogOpen, onClose, match, userName }) => {
  const { updateCurrentUser } = useGlobalState();

  return (
    <Modal open={dialogOpen} onClose={onClose}>
      <Card className="items-center justify-center" width={CardSizes.Medium}>
        <CardHeader>Do you want to remove this match?</CardHeader>
        <Text>
          This will remove the match between {match.partner.first_name} and{' '}
          {userName}
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

const MatchCard = ({ match, userName }: { match: any; userName: string }) => {
  const [dialogOpen, setDialogOpen] = React.useState(false);
  return (
    <div className="w-full max-w-[320px] flex flex-col bg-white h-fit relative items-center justify-center rounded-xl p-4 gap-2 border border-border-slate-400">
      <ConfirmRemoveMatchDialog
        dialogOpen={dialogOpen}
        onClose={() => setDialogOpen(false)}
        match={match}
        userName={userName}
      />
      <Link
        to={'/user/' + match.partner?.id}
        key={match.id}
        className="tooltip"
        data-tip={`${match.partner.first_name} ${match.partner.second_name}`}
      >
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
        color={match.partner.user_type === 'volunteer' ? '#9631c5' : '#ec2525'}
        size={TagSizes.small}
      >
        {match.partner.user_type}
      </Tag>
      <div className="absolute top-2 right-2">
        <Button
          appearance={ButtonAppearance.Secondary}
          color={'red'}
          backgroundColor={'red'}
          onClick={() => {
            setDialogOpen(true);
          }}
        >
          Remove
        </Button>
      </div>
      <p>
        {match.partner.first_name} {match.partner.second_name}
      </p>
      <p>Created: {formatTimeDistance(new Date('04.11.23'), new Date())} </p>
      <p>
        Last Message: {formatTimeDistance(new Date('04.05.24'), new Date())}
      </p>
      <p>Group: {match.partner.target_groups?.join(', ')}</p>
      <p>Languages: {match.language_skills} </p>
      <div className="flex gap-2">
        <Link
          buttonAppearance={ButtonAppearance.Secondary}
          buttonSize={ButtonSizes.Stretch}
          to={`/user/${match.partner.id}`}
        >
          View profile
        </Link>
      </div>
    </div>
  );
};

export default MatchCard;
