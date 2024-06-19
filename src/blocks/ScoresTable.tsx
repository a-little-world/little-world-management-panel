import { get, isEmpty } from 'lodash';
import React, { useState } from 'react';
import { Link } from 'react-router-dom';

import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '../atoms/Table';
import { Text } from '@a-little-world/little-world-design-system';
import Tag, { TagAppearance, TagSizes } from '../atoms/Tag';
import UserImage from '../atoms/UserImage';
import { formatDate, formatTime } from '../helpers/date';
import { useGlobalState } from '../store';

const SCORES_FIELDS = [
  { key: 'make_match', label: 'Match' },
  { key: 'user1', label: 'User 1' },
  { key: 'user2', label: 'User 2' },
  { key: 'matchable', label: 'Matchable' },
  { key: 'score', label: 'Score' },
  { key: 'latest_update', label: 'Last Updated' },
];

export function ScoresTable({ scoresList, openMatchingDialog }: { scoresList: any, openMatchingDialog: any }) {
  const { removeUserFromMatching, addUserToMatching, potentialMatch } = useGlobalState();
  const [fields, setFields] = useState(SCORES_FIELDS);

  return (
    <>
      <Table>
        <TableHeader>
          <TableRow>
            {fields.map(({ key, label }) => (
              <TableHead key={key} className="w-[100px]">
                {label}
              </TableHead>
            ))}
          </TableRow>
        </TableHeader>
        {isEmpty(scoresList?.results) ? (
          <Text className="p-4 w-full" center>
            No results.
          </Text>
        ) : (
          <TableBody>
            {scoresList?.results.map(score => (
              <TableRow key={score.uuid}>
                {fields.map(({ key }) => {
                  if (key === 'user1' || key === 'user2') {
                    const user = score[key];
                    return (
                      <TableCell key={score.uuid + key}>
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

                  if (key === 'make_match')
                    return (
                      <TableCell key={score.uuid + key}>
                        <button
                          onClick={() => {
                            addUserToMatching(score.user1)
                            addUserToMatching(score.user2)
                            openMatchingDialog(true)
                          }}
                          className="text-blue-500"
                        >
                          Match
                        </button>
                      </TableCell>
                    );

                  if (key === 'matchable')
                    return (
                      <TableCell key={score.uuid + key}>
                        <Tag
                          appearance={
                            TagAppearance[score.matchable ? 'success' : 'error']
                          }
                          size={TagSizes.small}
                        >
                          {score.matchable ? 'Matchable' : 'Not valid'}
                        </Tag>
                      </TableCell>
                    );

                  if (key === 'latest_update')
                    return (
                      <TableCell key={score.uuid + key}>
                        {formatDate(new Date(score.latest_update))}
                        {formatTime(new Date(score.latest_update))}
                      </TableCell>
                    );

                  return (
                    <TableCell key={score.uuid + key}>
                      {get(score, key)}
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
