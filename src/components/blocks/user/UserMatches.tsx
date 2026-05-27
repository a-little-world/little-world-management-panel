import {
  Accordion,
  AccordionContent,
  Text,
} from '@a-little-world/little-world-design-system';
import React from 'react';
import styled, { useTheme } from 'styled-components';

import { formatDate, formatTime } from '../../../helpers/date';
import UserMatchesTable from './UserMatchesTable';

const PrematchingAppointment = styled.div`
  display: flex;
  gap: ${({ theme }) => theme.spacing.xxsmall};
  align-items: center;
  margin-bottom: ${({ theme }) => theme.spacing.small};
`;

const ContentWrapper = styled(AccordionContent)`
  padding: 0;
  padding-bottom: ${({ theme }) => theme.spacing.small};
  gap: 0;
  background-color: ${({ theme }) => theme.color.surface.primary};
`;

const renderMatchTable = ({
  matches,
  isProposed,
  userName,
}: {
  matches: any[];
  isProposed?: boolean;
  userName: string;
}) => (
  <UserMatchesTable
    matches={matches}
    userName={userName}
    isProposed={isProposed}
  />
);

interface UserMatchesProps {
  user: any;
  appointment?: { start_time: string; end_time: string };
}

const UserMatches = ({ user, appointment }: UserMatchesProps) => {
  const theme = useTheme();

  const activeProposals = user?.matches.proposed?.results.length ?? 0;
  const oldProposals = user?.matches.old_proposals?.results.length ?? 0;
  const proposedText =
    activeProposals || oldProposals
      ? `${activeProposals} active | ${oldProposals} old`
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
        ContentWrapper={ContentWrapper}
        items={[
          {
            content: renderMatchTable({
              matches: user?.matches.confirmed?.results ?? [],
              userName: user.profile.first_name,
            }),
            header: `Confirmed (${user?.matches.confirmed?.results.length ?? 0}${user?.matches.confirmed?.count > (user?.matches.confirmed?.results.length ?? 0) ? ` of ${user?.matches.confirmed?.count}` : ''})`,
          },
          {
            content: renderMatchTable({
              matches: user?.matches.inactive?.results ?? [],
              userName: user.profile.first_name,
            }),
            header: `Inactive (${user?.matches.inactive?.results.length ?? 0}${user?.matches.inactive?.count > (user?.matches.inactive?.results.length ?? 0) ? ` of ${user?.matches.inactive?.count}` : ''})`,
          },
          {
            content: renderMatchTable({
              matches: user?.matches.unconfirmed?.results ?? [],
              userName: user.profile.first_name,
            }),
            header: `Unconfirmed (${user?.matches.unconfirmed?.results.length ?? 0}${user?.matches.unconfirmed?.count > (user?.matches.unconfirmed?.results.length ?? 0) ? ` of ${user?.matches.unconfirmed?.count}` : ''})`,
          },
          {
            content: renderMatchTable({
              matches: [
                ...(user?.matches.proposed?.results ?? []),
                ...(user?.matches.old_proposals?.results ?? []),
              ],
              userName: user.profile.first_name,
              isProposed: true,
            }),
            header: `Proposed (${proposedText})`,
          },
          {
            content: renderMatchTable({
              matches: user?.matches.support?.results ?? [],
              userName: user.profile.first_name,
            }),
            header: `Support (${user?.matches.support?.results.length ?? 0}${user?.matches.support?.count > (user?.matches.support?.results.length ?? 0) ? ` of ${user?.matches.support?.count}` : ''})`,
          },
        ]}
      />
    </div>
  );
};

export default UserMatches;
