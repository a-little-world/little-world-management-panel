import {
  Tag,
  TagAppearance,
  TagSizes,
  Text,
} from '@a-little-world/little-world-design-system';
import { get, isEmpty, isObject } from 'lodash';
import React, { useState } from 'react';
import { Link } from 'react-router-dom';

import { formatDate, formatTime } from '../../helpers/date';
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

const SCORES_FIELDS = [
  { key: 'make_match', label: 'Match' },
  { key: 'user1', label: 'User 1' },
  { key: 'user2', label: 'User 2' },
  { key: 'matchable', label: 'Matchable' },
  { key: 'score', label: 'Score' },
  { key: 'latest_update', label: 'Last Updated' },
];

export function ScoresTable({
  scoresList,
  onMatchClick,
  loading,
}: {
  scoresList: any;
  onMatchClick: (score: any) => void;
  loading?: boolean;
}) {
  const { removeUserFromMatching, addUserToMatching, potentialMatch } =
    useGlobalState();
  const [fields, setFields] = useState(SCORES_FIELDS);

  return (
    <>
      <Table>
        <TableHeader>
          <TableRow>
            {fields.map(({ key, label }) => (
              <TableHead key={key + label} className="w-[100px]">
                {label}
              </TableHead>
            ))}
          </TableRow>
        </TableHeader>
        {isEmpty(scoresList) ? (
          <Text className="p-4 w-full" center>
            {loading ? 'Loading...' : 'No results.'}
          </Text>
        ) : (
          <TableBody>
            {scoresList?.map(score => (
              <TableRow key={score.id}>
                {fields.map(({ key }) => {
                  if (key === 'user1' || key === 'user2') {
                    const user = isObject(score[key])
                      ? score[key]
                      : key === 'user1'
                      ? score['from_usr']
                      : score['to_usr'];

                    return (
                      <TableCell key={score.id + key}>
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
                      <TableCell key={score.id + key}>
                        <button
                          onClick={() => {
                            addUserToMatching(score.user1);
                            addUserToMatching(score.user2);
                            onMatchClick(score);
                          }}
                          className="text-blue-500"
                        >
                          View
                        </button>
                      </TableCell>
                    );

                  if (key === 'matchable')
                    return (
                      <TableCell key={score.id + key}>
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
                      <TableCell key={score.id + key}>
                        {formatDate(new Date(score.latest_update))}
                        {formatTime(new Date(score.latest_update))}
                      </TableCell>
                    );

                  return (
                    <TableCell key={score.id + key}>
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
