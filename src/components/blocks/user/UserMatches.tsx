import { Accordion, Text } from '@a-little-world/little-world-design-system';
import React from 'react';
import styled, { useTheme } from 'styled-components';

import { formatDate, formatTime } from '../../../helpers/date';
import UserMatch from '../match/UserMatch';

const PrematchingAppointment = styled.div`
  display: flex;
  gap: ${({ theme }) => theme.spacing.xxsmall};
  align-items: center;
  margin-bottom: ${({ theme }) => theme.spacing.small};
`;

interface UserMatchesProps {
  user: any;
  appointment?: { start_time: string; end_time: string };
}

const UserMatches = ({ user, appointment }: UserMatchesProps) => {
  const theme = useTheme();

  const proposedText =
    user?.matches.proposed?.results.length ||
    user?.matches.old_proposals?.results.length
      ? `${user?.matches.proposed?.results.length} active | ${user?.matches.old_proposals?.results.length} old`
      : '0';

  return (
    <div className="w-full">
      <PrematchingAppointment>
        <Text bold tag="h3">
          Prematching call:
        </Text>
        {appointment ? (
          <>
            <Text color={theme.color.text.title}>
              {formatDate(
                new Date(appointment?.start_time),
                'cccc, do LLLL',
                'en',
              )}
            </Text>
            <Text color={theme.color.text.title}>
              {formatTime(new Date(appointment?.start_time))} -{' '}
              {formatTime(new Date(appointment?.end_time))}
            </Text>
            <Text color={theme.color.text.secondary}>
              {user.state.had_prematching_call
                ? '(Attended)'
                : '(Not Attended)'}
            </Text>
          </>
        ) : (
          <Text color={theme.color.text.secondary}>Not booked</Text>
        )}
      </PrematchingAppointment>
      <Accordion
        items={[
          {
            content: user?.matches.confirmed?.results.map((match: any) => (
              <UserMatch
                key={match.id}
                match={match}
                userName={user.profile.first_name}
              />
            )),
            header: `Confirmed (${user?.matches.confirmed?.results.length})`,
          },
          {
            content: user?.matches.inactive?.results.map((match: any) => (
              <UserMatch
                key={match.id}
                match={match}
                userName={user.profile.first_name}
              />
            )),
            header: `Inactive (${user?.matches.inactive?.results.length})`,
          },
          {
            content: user?.matches.unconfirmed?.results.map((match: any) => (
              <UserMatch
                key={match.id}
                match={match}
                userName={user.profile.first_name}
              />
            )),
            header: `Unconfirmed (${user?.matches.unconfirmed?.results.length})`,
          },
          {
            content: [
              ...user?.matches.proposed?.results,
              ...user?.matches.old_proposals?.results,
            ].map((match: any) => (
              <UserMatch
                key={match.id}
                match={match}
                userName={user.profile.first_name}
              />
            )),
            header: `Proposed (${proposedText})`,
          },
          {
            content: user?.matches.support?.results.map((match: any) => (
              <UserMatch
                key={match.id}
                match={match}
                userName={user.profile.first_name}
              />
            )),
            header: `Support (${user?.matches.support?.results.length})`,
          },
        ]}
      />
    </div>
  );
};

export default UserMatches;
