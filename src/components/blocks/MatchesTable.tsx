import {
  Tag,
  TagAppearance,
  TagSizes,
  Text,
} from '@a-little-world/little-world-design-system';
import { get, isEmpty } from 'lodash';
import React, { useState } from 'react';
import { Link } from 'react-router-dom';

import { useGlobalState } from '../../store';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '../atoms/Table';
import UserImage from '../atoms/UserImage';
import { BucketTag } from './user/UserCard.styles';

const MATCHES_FIELDS = [
  { key: 'status', label: 'Status' },
  { key: 'uuid', label: 'Match ID (click to view)' },
  { key: 'user1', label: 'User 1' },
  { key: 'user2', label: 'User 2' },
  { key: 'bucket', label: 'Bucket' },
  { key: 'created_at', label: 'Created At' },
  { key: 'updated_at', label: 'Last Activity' },
];

export function MatchesTable({ matchList, list }) {
  const { selectedMatches, selectMatch, deselectMatch } = useGlobalState();
  const [fields, setFields] = useState(MATCHES_FIELDS);

  return (
    <>
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead className="w-[100px]">Selected</TableHead>
            {fields.map(({ key, label }) => (
              <TableHead key={key} className="w-[100px]">
                {label}
              </TableHead>
            ))}
          </TableRow>
        </TableHeader>
        {isEmpty(matchList?.results) ? (
          <Text className="p-4 w-full" center>
            No results.
          </Text>
        ) : (
          <TableBody>
            {matchList?.results.map(match => (
              <TableRow key={match.uuid}>
                <TableCell className="w-20">
                  <input
                    type="checkbox"
                    checked={Object.keys(selectedMatches).includes(match.uuid)}
                    className="checkbox ml-2"
                    onChange={() => {
                      if (Object.keys(selectedMatches).includes(match.uuid)) {
                        deselectMatch(match.uuid);
                      } else {
                        selectMatch(match);
                      }
                    }}
                  />
                </TableCell>

                {fields.map(({ key }) => {
                  if (key === 'user1' || key === 'user2') {
                    const user = match[key];
                    return (
                      <TableCell key={match.uuid + key}>
                        <Link to={`/user/${user.id}`}>
                          <UserImage
                            alt={
                              user.profile.first_name +
                              ' ' +
                              user.profile.second_name
                            }
                            user={user.profile}
                            dimensions={{
                              height: 32,
                              width: 32,
                            }}
                          />
                        </Link>
                      </TableCell>
                    );
                  }

                  if (key === 'uuid') {
                    return (
                      <TableCell key={match.uuid + key}>
                        <Link to={`/match/${match.uuid}`}>{match.uuid}</Link>
                      </TableCell>
                    );
                  }

                  if (key === 'status')
                    return (
                      <TableCell key={match.uuid + key}>
                        <Tag
                          appearance={
                            TagAppearance[match.status ? 'success' : 'error']
                          }
                          size={TagSizes.small}
                        >
                          {match.status}
                        </Tag>
                      </TableCell>
                    );

                  if (key === 'bucket') {
                    return (
                      <TableCell key={match.uuid + key}>
                        <BucketTag bold color="#000000">
                          {match.bucket}
                        </BucketTag>
                      </TableCell>
                    );
                  }

                  return (
                    <TableCell key={match.uuid + key}>
                      {get(match, key)}
                    </TableCell>
                  );
                })}
              </TableRow>
            ))}
          </TableBody>
        )}
      </Table>
    </>
  );
}
