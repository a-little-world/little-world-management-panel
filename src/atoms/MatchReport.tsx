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

interface Match {
  rejected_on?: string;
  expires_at?: string;
  unmatched: { time: string; reason: string }[];
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

  const getDate = (): string | undefined => {
    return isProposed
      ? match.rejected_on ?? match.expires_at
      : match.unmatched[0]?.time;
  };

  const getInactiveCause = (): string => {
    if (!isProposed) return 'Unmatched';
    return match.rejected ? 'Proposal Rejected' : 'Proposal Expired';
  };

  const date = getDate();
  const inactiveCause = getInactiveCause();

  return (
    <MatchReportContainer className={className}>
      <Text bold center>{`${inactiveCause}${
        date ? ` on ${formatDate(new Date(date))}` : ''
      }`}</Text>
      {!isProposed && match.unmatched && (
        <Reason>Reason: {match.unmatched[0]?.reason}</Reason>
      )}
    </MatchReportContainer>
  );
};

export default MatchReport;
