import {
  Button,
  ButtonAppearance,
  Link,
  Text,
  TextTypes,
} from '@a-little-world/little-world-design-system';
import { isEmpty } from 'lodash';
import React from 'react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '../shadcnui/ui/dialog';


import { formatTimeDistance } from '../helpers/date';
import Tag, { TagAppearance } from './Tag';
import UserImage from './UserImage';
import { getCookiesAsObject } from '../utils';

const ConfirmRemoveMatchDialog = ({
  dialogOpen,
  setDialogOpen,
  match,
}) => {
  return <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
    <DialogTrigger>
    </DialogTrigger>
    <DialogContent>
      <DialogHeader>
        <DialogTitle>Do you want to remove this match?</DialogTitle>
        <DialogDescription>
          This will remove the match between you and {match.partner.first_name}{' '}
          {match.partner.second_name}
        </DialogDescription>
        <Button
          appearance={ButtonAppearance.Secondary}
          onClick={() => {
            console.log('REMOVE MATCH');
            fetch(`/api/matching/matches/${match.id}/resolve/`, {
              method: 'POST',
              headers: {
                'Content-Type': 'application/json',
                'X-CSRFToken': getCookiesAsObject().csrftoken,
              },
            }).then((res) => {
              if (res.ok) {
                setDialogOpen(false);
              }
            })
            // TODO: mutate matches and reload so the UI updates!
          }}
        >
          Remove Match
        </Button>
      </DialogHeader>
    </DialogContent>
  </Dialog>
};


const MatchCard = ({ match }: { match: any }) => {
  const [dialogOpen, setDialogOpen] = React.useState(false);
  return (
    <div className="w-full max-w-[320px] flex flex-col bg-white h-fit relative items-center justify-center rounded-xl p-4 gap-2 border border-border-slate-400">
      <ConfirmRemoveMatchDialog dialogOpen={dialogOpen} setDialogOpen={setDialogOpen} match={match} />
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
        className="absolute top-2 left-2"
        appearance={
          match.partner.user_type === 'volunteer'
            ? TagAppearance.primary
            : TagAppearance.secondary
        }
      >
        {match.partner.user_type}
      </Tag>
      <div className='absolute top-2 right-2'>
        <Button appearance={ButtonAppearance.Secondary} onClick={() => {
          setDialogOpen(true);
        }}>Remove</Button>
      </div>
      <p>
        {match.partner.first_name} {match.partner.second_name}
      </p>
      <p>Created: {formatTimeDistance(new Date('04.11.23'), new Date())} </p>
      <p>
        Last Message: {formatTimeDistance(new Date('04.05.24'), new Date())}
      </p>
      <p>Group: {match.partner.target_group}</p>
      <p>Languages: {match.language_skills} </p>
      <div className="flex gap-2">
        <Link
          buttonAppearance={ButtonAppearance.Secondary}
          to={`/user/${match.partner.id}`}
        >
          View profile
        </Link>
      </div>
    </div>
  );
};

export default MatchCard;
