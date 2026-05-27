import {
  Link,
  Tag,
  TagAppearance,
  TagSizes,
  Text,
} from '@a-little-world/little-world-design-system';
import { capitalize, isEmpty } from 'lodash';
import React, { useState } from 'react';
import styled from 'styled-components';

import { LANGUAGES, MATCH_STATUS } from '../../../constants';
import { formatDate, formatTimeDistance } from '../../../helpers/date';
import { useGlobalState } from '../../../store';
import MatchReport, { getMatchReportProps } from '../../atoms/MatchReport';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '../../atoms/Table';
import UserImage from '../../atoms/UserImage';
import ConfirmUnmatchModal from '../match/ConfirmUnmatchModal';

const PartnerInfo = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: ${({ theme }) => theme.spacing.xxxsmall};
`;

const ActionsCell = styled.div`
  display: flex;
  flex-wrap: wrap;
  gap: ${({ theme }) => theme.spacing.xsmall};
  align-items: center;
`;

const InactiveRow = styled(TableRow)`
  background: ${({ theme }) => theme.color.surface.error};
`;

const getMatchInactive = (match: any) => {
  const isProposed = match.status === MATCH_STATUS.proposed;
  return isProposed
    ? match.closed
    : match.closed || !match.active || match.partner?.isDeleted;
};

interface UserMatchesTableProps {
  matches: any[];
  userName: string;
  isProposed?: boolean;
}

const UserMatchesTable = ({
  matches,
  userName,
  isProposed = false,
}: UserMatchesTableProps) => {
  const { updateCurrentUser } = useGlobalState();
  const [removeMatchId, setRemoveMatchId] = useState<string | null>(null);
  const removeMatch = matches.find(match => match.id === removeMatchId);

  if (isEmpty(matches)) {
    return (
      <Text className="p-4 w-full" center>
        No results.
      </Text>
    );
  }

  return (
    <>
      <ConfirmUnmatchModal
        dialogOpen={Boolean(removeMatchId)}
        onClose={() => setRemoveMatchId(null)}
        onMatchUpdate={() => updateCurrentUser()}
        matchId={removeMatchId ?? ''}
        user1Name={userName}
        user2Name={removeMatch?.partner?.first_name ?? ''}
      />
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead center>Partner</TableHead>
            <TableHead center>Type</TableHead>
            <TableHead center>Bucket</TableHead>
            <TableHead>Created</TableHead>
            {!isProposed && <TableHead>Last Message</TableHead>}
            <TableHead center>Status</TableHead>
            {!isProposed && <TableHead>Actions</TableHead>}
          </TableRow>
        </TableHeader>
        <TableBody>
          {matches.map(match => {
            const isProposed = match.status === MATCH_STATUS.proposed;
            const inactive = getMatchInactive(match);
            const RowComponent = inactive ? InactiveRow : TableRow;

            return (
              <RowComponent key={match.id}>
                <TableCell>
                  {match.partner?.censored ? (
                    <Text>Account no longer exists</Text>
                  ) : (
                    <Link
                      to={`/user/${match.partner.id}`}
                      textDecoration={false}
                    >
                      <PartnerInfo>
                        <UserImage
                          hasPriority={match.partner.has_match_priority}
                          alt="match profile pic"
                          user={match.partner}
                          dimensions={{
                            height: 32,
                            width: 32,
                          }}
                        />
                        <Text center bold>
                          {match.partner.first_name} (
                          {capitalize(match.partner.user_type)})
                        </Text>
                      </PartnerInfo>
                    </Link>
                  )}
                </TableCell>
                <TableCell>
                  <Tag
                    bold
                    color={
                      match.match_type === 'standard' ? '#9631c5' : '#ec2525'
                    }
                    size={TagSizes.small}
                  >
                    {match.match_type}
                  </Tag>
                </TableCell>
                <TableCell>
                  {match.bucket ? (
                    <Tag bold color="#000000" size={TagSizes.small}>
                      {match.bucket_label ?? match.bucket}
                    </Tag>
                  ) : (
                    '—'
                  )}
                </TableCell>
                <TableCell>
                  {formatDate(match.created_at, 'dd.LL.yyyy', LANGUAGES.en)}
                </TableCell>
                {!isProposed && (
                  <TableCell>
                    {match.chat?.newest_message?.created
                      ? formatTimeDistance(
                          new Date(match.chat.newest_message.created),
                          new Date(),
                          LANGUAGES.en,
                        )
                      : 'No messages yet'}
                  </TableCell>
                )}
                <TableCell>
                  {inactive ? (
                    <MatchReport {...getMatchReportProps(match, isProposed)} />
                  ) : (
                    <Tag
                      appearance={TagAppearance.success}
                      size={TagSizes.small}
                    >
                      Active
                    </Tag>
                  )}
                </TableCell>
                {!isProposed && (
                  <TableCell>
                    <ActionsCell>
                      <Link to={`/match/${match.id}`}>View Match</Link>
                    </ActionsCell>
                  </TableCell>
                )}
              </RowComponent>
            );
          })}
        </TableBody>
      </Table>
    </>
  );
};

export default UserMatchesTable;
