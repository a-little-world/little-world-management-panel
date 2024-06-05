import {
  ButtonAppearance,
  Link,
  Text,
  TextTypes,
} from '@a-little-world/little-world-design-system';
import { isEmpty } from 'lodash';
import React from 'react';

import { formatTimeDistance } from '../helpers/date';
import Tag, { TagAppearance } from './Tag';
import UserImage from './UserImage';

const MatchCard = ({ match }: { match: any }) => {
  console.log({ match });
  return (
    <div className="w-full max-w-[320px] flex flex-col bg-white h-fit relative items-center justify-center rounded-xl p-4 gap-2 border border-border-slate-400">
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
