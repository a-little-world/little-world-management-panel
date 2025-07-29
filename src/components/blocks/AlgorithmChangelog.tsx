import { Text, TextTypes } from '@a-little-world/little-world-design-system';
import React from 'react';
import styled from 'styled-components';

import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '../atoms/Table';

interface ChangelogEntry {
  date: string;
  element: string;
  oldScore: string;
  newScore: string;
  reason: string;
}

const ChangelogContainer = styled.div`
  margin-top: ${({ theme }) => theme.spacing.large};
`;

const ChangelogTitle = styled(Text)`
  margin-bottom: ${({ theme }) => theme.spacing.small};
`;

const ChangelogDescription = styled(Text)`
  margin-bottom: ${({ theme }) => theme.spacing.medium};
`;

const algorithmChangelog: ChangelogEntry[] = [
  {
    date: '2025-07-29',
    element: 'Time Slot Overlap',
    oldScore: '0 slots = -15 points',
    newScore: '0 slots = unmatchable',
    reason:
      'To improve matching quality and reduce the time spent reviewing proposals and on our support team, we now deem users with 0 overlapping slots as unmatchable.',
  },
  {
    date: '2025-06-17',
    element: 'Learner Waiting Time',
    oldScore: 'All learners considered eligible for matching',
    newScore: 'Only learners waiting > 4 days eligible for matching',
    reason: 'Prioritise learners who have been waiting longer',
  },
  {
    date: '2025-05-16',
    element: 'Target Group',
    oldScore: 'Disabled',
    newScore: 'Enabled',
    reason:
      'Target Group incorporated into score to ensure volunteers are matched with the correct target group',
  },
];

export const AlgorithmChangelog: React.FC = () => {
  return (
    <ChangelogContainer>
      <ChangelogTitle bold tag="h3" type={TextTypes.Body3}>
        Changelog
      </ChangelogTitle>
      <ChangelogDescription type={TextTypes.Body4}>
        Details of changes to the algorithm and the reasoning.
      </ChangelogDescription>
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Date</TableHead>
            <TableHead>Element</TableHead>
            <TableHead>Old Score</TableHead>
            <TableHead>New Score</TableHead>
            <TableHead>Reason for Change</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {algorithmChangelog.map((change, index) => (
            <TableRow key={index}>
              <TableCell>
                <Text>
                  {new Date(change.date).toLocaleDateString('en-GB', {
                    day: '2-digit',
                    month: 'short',
                    year: 'numeric',
                  })}
                </Text>
              </TableCell>
              <TableCell>
                <Text bold>{change.element}</Text>
              </TableCell>
              <TableCell>
                <Text>{change.oldScore}</Text>
              </TableCell>
              <TableCell>
                <Text>{change.newScore}</Text>
              </TableCell>
              <TableCell>
                <Text>{change.reason}</Text>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </ChangelogContainer>
  );
};

export default AlgorithmChangelog;
