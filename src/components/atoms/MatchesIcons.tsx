import { Text, TextTypes } from '@a-little-world/little-world-design-system';
import { isEmpty } from 'lodash';
import React from 'react';
import { Link } from 'react-router-dom';
import styled from 'styled-components';

import UserImage from './UserImage';

const DeletedAvatar = styled.span`
  display: inline-flex;
  border-radius: ${({ theme }) => theme.radius.full};
  border: 2px solid ${({ theme }) => theme.color.surface.error};
  opacity: 0.5;
`;

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
          const deleted = Boolean(match.partner?.isDeleted);
          const avatar = (
            <UserImage
              hasPriority={match.partner.has_match_priority}
              alt="match profile pic"
              user={match.partner}
              dimensions={{
                height: 20,
                width: 20,
              }}
            />
          );
          return (
            <Link
              to={'/user/' + match.partner?.id}
              key={match.id}
              className="tooltip"
              data-tip={`${match.partner.first_name}${
                deleted ? ' (deleted)' : ''
              }`}
            >
              {deleted ? <DeletedAvatar>{avatar}</DeletedAvatar> : avatar}
            </Link>
          );
        })
      )}
    </div>
  );
};

export default MatchesIcons;
