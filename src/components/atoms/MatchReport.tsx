import { Text } from '@a-little-world/little-world-design-system';
import { isValid } from 'date-fns';
import { capitalize } from 'lodash';
import React from 'react';
import styled from 'styled-components';

import { LANGUAGES, UNAVAILABLE } from '../../constants';
import { formatDate } from '../../helpers/date';

const MatchReportContainer = styled.div`
  padding: ${({ theme }) => theme.spacing.xxsmall};
  background-color: ${({ theme }) => theme.color.surface.secondary};
  border: 1px solid ${({ theme }) => theme.color.border.moderate};
  border-radius: ${({ theme }) => theme.radius.xxsmall};
`;

const Reason = styled(Text)`
  text-align: left;
`;

const Reporter = styled(Text)`
  text-align: left;
`;

// The latest close, not the first: a match that was reactivated and closed again has
// several entries. `reactivated` entries record the reopening, not a close.
const getClosingEntry = (reportUnmatch: any[] | undefined) =>
  [...(reportUnmatch ?? [])]
    .reverse()
    .find(entry => entry?.kind && entry.kind !== 'reactivated');

export const getMatchReportProps = (
  match: any,
  isProposed: boolean,
): {
  date?: string;
  inactiveCause: string;
  reason?: string;
  unmatcherName?: string;
  unmatcherType?: string;
  showUnmatcher: boolean;
} => {
  const reportUnmatch =
    getClosingEntry(match.report_unmatch) ||
    (match.partner?.isDeleted
      ? { kind: 'user_deleted', reason: 'User account was deleted' }
      : {});
  const inactiveCause = isProposed
    ? match.rejected
      ? 'Proposal Rejected by Learner'
      : 'Proposal Expired'
    : match.partner?.isDeleted
      ? 'Account deleted'
      : capitalize(
          `${reportUnmatch.kind}${reportUnmatch.kind?.endsWith('ed') ? '' : 'ed'}`,
        );

  const date = isProposed
    ? (match.rejected_at ?? match.expires_at)
    : reportUnmatch?.time;

  const reason =
    (isProposed ? match.rejected_reason : reportUnmatch?.reason) || UNAVAILABLE;

  // Get unmatcher info directly from enriched report_unmatch data
  const unmatcherName = reportUnmatch?.user_first_name;
  const unmatcherType = reportUnmatch?.user_type;

  const showUnmatcher = !!reportUnmatch?.kind;

  return {
    date,
    inactiveCause,
    reason,
    unmatcherName,
    unmatcherType,
    showUnmatcher,
  };
};

interface MatchReportProps {
  className?: string;
  inactiveCause: string;
  date?: string;
  reason?: string;
  unmatcherName?: string;
  unmatcherType?: string;
  showUnmatcher: boolean;
}

const MatchReport: React.FC<MatchReportProps> = ({
  className,
  inactiveCause,
  date,
  reason,
  unmatcherName,
  unmatcherType,
  showUnmatcher,
}) => {
  // The time comes from free-form JSON history. An unparseable value (old rows, censored
  // dev data) would make date-fns throw and take the whole page down, so it is dropped.
  const parsedDate = date ? new Date(date) : null;
  const hasValidDate = !!parsedDate && isValid(parsedDate);

  return (
    <MatchReportContainer className={className}>
      <Text bold center>{`${inactiveCause}${
        hasValidDate
          ? ` on ${formatDate(parsedDate, 'dd.LL.yyyy', LANGUAGES.en)}`
          : ''
      }`}</Text>
      {reason && <Reason>{`<bold>Reason</bold>: ${reason}`}</Reason>}
      {showUnmatcher && unmatcherName && (
        <Reporter>
          {`<bold>${inactiveCause} by</bold>: ${unmatcherName}${
            unmatcherType ? ` (${unmatcherType})` : ''
          }`}
        </Reporter>
      )}
    </MatchReportContainer>
  );
};

export default MatchReport;
