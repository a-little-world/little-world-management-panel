import {
  Tag,
  TagAppearance,
  TagSizes,
  Text,
} from '@a-little-world/little-world-design-system';
import { isEmpty } from 'lodash';
import React from 'react';

import { MatchProposal } from '../../../api/randomCalls';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '../../atoms/Table';

interface MatchProposalsTableProps {
  matches: MatchProposal[];
  showCompletedColumn?: boolean;
  emptyMessage?: string;
}

function getUserLabel(match: MatchProposal, userNumber: 1 | 2): string {
  const name = userNumber === 1 ? match.u1_name : match.u2_name;
  const type = userNumber === 1 ? match.u1_user_type : match.u2_user_type;
  const userUuid = userNumber === 1 ? match.u1_uuid : match.u2_uuid;
  return `${name} - ${type ?? '—'} (${userUuid})`;
}

export default function MatchProposalsTable({
  matches,
  showCompletedColumn = false,
  emptyMessage = 'No matches in this category.',
}: MatchProposalsTableProps) {
  if (isEmpty(matches)) {
    return (
      <Text className="p-4 w-full" center>
        {emptyMessage}
      </Text>
    );
  }

  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead>Match UUID</TableHead>
          <TableHead>User 1</TableHead>
          <TableHead>User 2</TableHead>
          <TableHead>Created at</TableHead>
          <TableHead>U1 Accepted</TableHead>
          <TableHead>U2 Accepted</TableHead>
          <TableHead>Status</TableHead>
          {showCompletedColumn && <TableHead>Completed</TableHead>}
        </TableRow>
      </TableHeader>
      <TableBody>
        {matches.map(match => (
          <TableRow key={match.uuid}>
            {<TableCell>{match.uuid}</TableCell>}
            <TableCell>{getUserLabel(match, 1)}</TableCell>
            <TableCell>{getUserLabel(match, 2)}</TableCell>
            <TableCell>
              {match.created_at
                ? new Date(match.created_at).toLocaleString()
                : '—'}
            </TableCell>
            <TableCell>
              <Tag
                appearance={
                  match.u1_accepted
                    ? TagAppearance.success
                    : TagAppearance.error
                }
                size={TagSizes.small}
              >
                {match.u1_accepted ? 'Yes' : 'No'}
              </Tag>
            </TableCell>
            <TableCell>
              <Tag
                appearance={
                  match.u2_accepted
                    ? TagAppearance.success
                    : TagAppearance.error
                }
                size={TagSizes.small}
              >
                {match.u2_accepted ? 'Yes' : 'No'}
              </Tag>
            </TableCell>
            <TableCell>
              {match.accepted ? (
                <Tag appearance={TagAppearance.success} size={TagSizes.small}>
                  Accepted
                </Tag>
              ) : match.rejected ? (
                <Tag appearance={TagAppearance.error} size={TagSizes.small}>
                  Rejected
                </Tag>
              ) : (
                <Tag appearance={TagAppearance.outline} size={TagSizes.small}>
                  Pending
                </Tag>
              )}
            </TableCell>
            {showCompletedColumn && (
              <TableCell>
                {match.completed ? (
                  <Tag appearance={TagAppearance.success} size={TagSizes.small}>
                    true
                  </Tag>
                ) : match.in_session ? (
                  <Tag appearance={TagAppearance.outline} size={TagSizes.small}>
                    Call ongoing
                  </Tag>
                ) : (
                  <Tag appearance={TagAppearance.outline} size={TagSizes.small}>
                    Connection pending
                  </Tag>
                )}
              </TableCell>
            )}
          </TableRow>
        ))}
      </TableBody>
    </Table>
  );
}
