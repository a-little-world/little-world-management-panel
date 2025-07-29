import { Text } from '@a-little-world/little-world-design-system';
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
  const inactiveCause = isProposed
    ? match.rejected
      ? 'Proposal Rejected by Learner'
      : 'Proposal Expired'
    : capitalize(`${match.report_unmatch?.[0]?.kind}ed`);

  const date = isProposed
    ? match.rejected_at ?? match.expires_at
    : match.report_unmatch?.[0]?.time;

  const reason =
    (isProposed ? match.rejected_reason : match.report_unmatch?.[0]?.reason) ||
    UNAVAILABLE;

  // Get unmatcher info directly from enriched report_unmatch data
  const reportUnmatch = match.report_unmatch?.[0];
  const unmatcherName = reportUnmatch?.user_first_name;
  const unmatcherType = reportUnmatch?.user_type;

  const showUnmatcher = match.report_unmatch?.[0]?.kind;

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
  return (
    <MatchReportContainer className={className}>
      <Text bold center>{`${inactiveCause}${
        date
          ? ` on ${formatDate(new Date(date), 'cccc, LLLL do', LANGUAGES.en)}`
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
