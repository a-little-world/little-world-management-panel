import { Accordion, Text } from '@a-little-world/little-world-design-system';
import React from 'react';
import styled, { useTheme } from 'styled-components';
import useSWR from 'swr';

import { formatDate, formatTime } from '../../helpers/date';
import { dataFetcher } from '../../store';
import UserMatch from '../match/UserMatch';

const PrematchingAppointment = styled.div`
  display: flex;
  gap: ${({ theme }) => theme.spacing.xxsmall};
  align-items: center;
  margin-bottom: ${({ theme }) => theme.spacing.small};
`;

const UserMatches = ({ user }) => {
  const { data: appointment } = useSWR(
    `/api/matching/users/${user.hash}/prematching_appointments/`,
    dataFetcher,
  );
  const theme = useTheme();

  return (
    <div className="w-full">
      {appointment && (
        <PrematchingAppointment>
          <Text bold tag="h3">
            Prematching call:
          </Text>
          <Text color={theme.color.text.title} bold>
            {formatDate(
              new Date(appointment?.start_time),
              'cccc, do LLLL',
              'en',
            )}
          </Text>
          <Text color={theme.color.text.title} bold>
            {formatTime(new Date(appointment?.start_time))} -{' '}
            {formatTime(new Date(appointment?.end_time))}
          </Text>
        </PrematchingAppointment>
      )}
      <Accordion
        items={[
          {
            content: user?.matches.confirmed?.items.map(match => (
              <UserMatch match={match} userName={user.profile.first_name} />
            )),
            header: `Confirmed (${user?.matches.confirmed?.items.length})`,
          },
          {
            content: user?.matches.unconfirmed?.items.map(match => (
              <UserMatch match={match} userName={user.profile.first_name} />
            )),
            header: `Unconfirmed (${user?.matches.unconfirmed?.items.length})`,
          },
          {
            content: user?.matches.proposed?.items.map(match => (
              <UserMatch match={match} userName={user.profile.first_name} />
            )),
            header: `Proposed (${user?.matches.proposed?.items.length})`,
          },
          {
            content: user?.matches.support?.items.map(match => (
              <UserMatch match={match} userName={user.profile.first_name} />
            )),
            header: `Support (${user?.matches.support?.items.length})`,
          },
        ]}
      />
    </div>
  );
};

export default UserMatches;
