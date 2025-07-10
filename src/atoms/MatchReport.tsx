import { Text } from '@a-little-world/little-world-design-system';
import React from 'react';
import styled from 'styled-components';

import { formatDate } from '../helpers/date';

const MatchReportContainer = styled.div`
  padding: ${({ theme }) => theme.spacing.xxsmall};
  background-color: ${({ theme }) => theme.color.surface.secondary};
  border: 1px solid ${({ theme }) => theme.color.border.moderate};
  border-radius: ${({ theme }) => theme.radius.xxsmall};
`;

const Reason = styled(Text)`
  text-align: left;
`;

const getDate = ({
  isProposed,
  match,
}: {
  isProposed: boolean;
  match: Match;
}): string | undefined => {
  console.log({ match });
  return isProposed
    ? match.rejected_on ?? match.expires_at
    : match.report_unmatch?.[0]?.time;
};

const getInactiveCause = ({
  isProposed,
  rejected,
}: {
  isProposed: boolean;
  rejected: boolean;
}) => {
  if (!isProposed) return 'Unmatched';
  return rejected ? 'Proposal Rejected' : 'Proposal Expired';
};

interface Match {
  rejected_on?: string;
  expires_at?: string;
  report_unmatch: { time: string; reason: string }[];
  rejected?: boolean;
}

interface MatchReportProps {
  className?: string;
  match: Match;
  isProposed: boolean;
  inactive: boolean;
}

const MatchReport: React.FC<MatchReportProps> = ({
  className,
  match,
  isProposed,
  inactive,
}) => {
  if (!inactive) {
    return null;
  }

  const date = getDate({ isProposed, match });
  const inactiveCause = getInactiveCause({
    isProposed,
    rejected: match.rejected ?? false,
  });

  return (
    <MatchReportContainer className={className}>
      <Text bold={!isProposed} center>{`${inactiveCause}${
        date ? ` on ${formatDate(new Date(date))}` : ''
      }`}</Text>
      {!isProposed && match.report_unmatch && (
        <Reason>Reason: {match.report_unmatch[0]?.reason}</Reason>
      )}
    </MatchReportContainer>
  );
};

export default MatchReport;
