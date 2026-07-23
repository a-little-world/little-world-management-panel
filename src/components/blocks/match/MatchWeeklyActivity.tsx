import {
  Button,
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardSizes,
  Modal,
  Text,
  TextTypes,
} from '@a-little-world/little-world-design-system';
import { isEmpty } from 'lodash';
import React, { useMemo } from 'react';
import styled from 'styled-components';
import useSWR from 'swr';

import { LANGUAGES } from '../../../constants';
import {
  formatDate,
  formatDurationSeconds,
  formatEventTime,
  formatTime,
} from '../../../helpers/date';
import { dataFetcher } from '../../../store';
import LoadingSpinner from '../../atoms/LoadingSpinner';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '../../atoms/Table';

type WeeklyActivityDetails = {
  week: number;
  start_at: string;
  end_at: string;
  video_calls: Array<{
    created_at: string;
    end_time: string | null;
    duration_seconds: number | null;
  }>;
  messages: Array<{
    created_at: string;
    sender_id: number;
    sender_name: string;
  }>;
};

const DetailsSection = styled.div`
  display: flex;
  flex-direction: column;
  gap: ${({ theme }) => theme.spacing.xsmall};
  width: 100%;
`;

const FullWidthTable = styled(Table)`
  width: 100%;
`;

const SectionTitle = styled(Text)``;

const ParticipantCounts = styled(Text)`
  color: ${({ theme }) => theme.color.text.secondary};
`;

const EmptyListText = styled(Text)`
  padding: ${({ theme }) => theme.spacing.xsmall} 0;
`;

const formatCallDate = (value: string) =>
  formatDate(new Date(value), 'dd MMM yy', LANGUAGES.en);

const formatCallTimeRange = (startValue: string, endValue: string | null) => {
  const startDate = new Date(startValue);
  if (!endValue) {
    return formatTime(startDate);
  }

  const endDate = new Date(endValue);
  return formatEventTime(startDate, endDate);
};

const formatMessageDateTime = (value: string) => {
  const date = new Date(value);
  return `${formatDate(date, 'dd MMM yy', LANGUAGES.en)} ${formatTime(date)}`;
};

const MatchWeeklyActivityDetailsModal = ({
  open,
  onClose,
  matchUuid,
  week,
  weekLabel,
  user1Id,
  user1Name,
  user2Id,
  user2Name,
}: {
  open: boolean;
  onClose: () => void;
  matchUuid: string;
  week: number | null;
  weekLabel: string;
  user1Id: number;
  user1Name: string;
  user2Id: number;
  user2Name: string;
}) => {
  const { data, error, isLoading } = useSWR<WeeklyActivityDetails>(
    open && week !== null
      ? `/api/matching/matches/${matchUuid}/weekly_activity_details/?week=${week}`
      : null,
    dataFetcher,
  );

  const videoCallCount = data?.video_calls.length ?? 0;
  const messageCount = data?.messages.length ?? 0;

  const messageCountsByParticipant = useMemo(() => {
    const counts: Record<number, number> = {
      [user1Id]: 0,
      [user2Id]: 0,
    };

    data?.messages.forEach(message => {
      if (counts[message.sender_id] !== undefined) {
        counts[message.sender_id] += 1;
      }
    });

    return counts;
  }, [data?.messages, user1Id, user2Id]);

  return (
    <Modal open={open} onClose={onClose}>
      <Card width={CardSizes.Medium}>
        <CardHeader>Week {week} activity details</CardHeader>
        <CardContent align="stretch">
          <Text type={TextTypes.Body6}>{weekLabel}</Text>
          {isLoading ? (
            <LoadingSpinner />
          ) : error ? (
            <Text type={TextTypes.Body6}>Error loading activity details.</Text>
          ) : (
            <>
              <DetailsSection>
                <SectionTitle type={TextTypes.Body5} bold>
                  Video calls ({videoCallCount})
                </SectionTitle>
                {isEmpty(data?.video_calls) ? (
                  <EmptyListText type={TextTypes.Body6}>
                    No video calls this week.
                  </EmptyListText>
                ) : (
                  <FullWidthTable>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Date</TableHead>
                        <TableHead>Time</TableHead>
                        <TableHead>Duration</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {data?.video_calls.map((call, index) => (
                        <TableRow key={`${call.created_at}-${index}`}>
                          <TableCell>
                            {formatCallDate(call.created_at)}
                          </TableCell>
                          <TableCell>
                            {formatCallTimeRange(
                              call.created_at,
                              call.end_time,
                            )}
                          </TableCell>
                          <TableCell>
                            {call.duration_seconds != null
                              ? formatDurationSeconds(call.duration_seconds)
                              : '—'}
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </FullWidthTable>
                )}
              </DetailsSection>
              <DetailsSection>
                <SectionTitle type={TextTypes.Body5} bold>
                  Messages ({messageCount})
                </SectionTitle>
                <ParticipantCounts type={TextTypes.Body6}>
                  {user1Name}: {messageCountsByParticipant[user1Id]} ·{' '}
                  {user2Name}: {messageCountsByParticipant[user2Id]}
                </ParticipantCounts>
                {isEmpty(data?.messages) ? (
                  <EmptyListText type={TextTypes.Body6}>
                    No messages this week.
                  </EmptyListText>
                ) : (
                  <FullWidthTable>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Date</TableHead>
                        <TableHead>Sender</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {data?.messages.map((message, index) => (
                        <TableRow
                          key={`${message.created_at}-${message.sender_id}-${index}`}
                        >
                          <TableCell>
                            {formatMessageDateTime(message.created_at)}
                          </TableCell>
                          <TableCell>{message.sender_name}</TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </FullWidthTable>
                )}
              </DetailsSection>
            </>
          )}
        </CardContent>
        <CardFooter align="flex-end">
          <Button onClick={onClose}>Close</Button>
        </CardFooter>
      </Card>
    </Modal>
  );
};

export default MatchWeeklyActivityDetailsModal;
