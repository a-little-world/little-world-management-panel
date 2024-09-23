import { Text, TextTypes } from '@a-little-world/little-world-design-system';
import { isEmpty } from 'lodash';
import React from 'react';
import { Link } from 'react-router-dom';

import UserImage from './UserImage';

const MatchesIcons = ({
  matches,
  label,
}: {
  matches: any[];
  label?: string;
}) => {
  return (
    <div className="h-fit flex flex-row items-center content-center gap-2">
      {label && (
        <Text bold type={TextTypes.Body5}>
          {label}:
        </Text>
      )}
      {isEmpty(matches) ? (
        <Text type={TextTypes.Body5}>None</Text>
      ) : (
        matches?.map(match => {
          return (
            <Link
              to={'/user/' + match.partner?.id}
              key={match.id}
              className="tooltip"
              data-tip={`${match.partner.first_name}`}
            >
              <UserImage
                alt="match profile pic"
                user={match.partner}
                dimensions={{
                  height: 20,
                  width: 20,
                }}
              />
            </Link>
          );
        })
      )}
    </div>
  );
};

export default MatchesIcons;
