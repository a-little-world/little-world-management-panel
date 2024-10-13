import { Accordion } from '@a-little-world/little-world-design-system';
import React from 'react';

import MatchCard from '../atoms/MatchCard';
import { formatDate, formatTime } from '../helpers/date';

const UserMatches = ({ preMatchingAppointment, user }) => {
  return (
    <div className="w-full">
      {preMatchingAppointment && (
        <div className="flex gap-2 items-center mb-4">
          <h3>Prematching call booked for:</h3>
          <div>
            {formatDate(new Date())} {formatTime(new Date())}
          </div>
        </div>
      )}
      <Accordion
        items={[
          {
            content: user?.matches.confirmed?.items.map(match => (
              <MatchCard match={match} userName={user.profile.first_name} />
            )),
            header: `Confirmed (${user?.matches.confirmed?.items.length})`,
          },
          {
            content: user?.matches.unconfirmed?.items.map(match => (
              <MatchCard match={match} userName={user.profile.first_name} />
            )),
            header: `Unconfirmed (${user?.matches.unconfirmed?.items.length})`,
          },
          {
            content: user?.matches.proposed?.items.map(match => (
              <MatchCard match={match} userName={user.profile.first_name} />
            )),
            header: `Proposed (${user?.matches.proposed?.items.length})`,
          },
          {
            content: user?.matches.support?.items.map(match => (
              <MatchCard match={match} userName={user.profile.first_name} />
            )),
            header: `Support (${user?.matches.support?.items.length})`,
          },
        ]}
      />
    </div>
  );
};

export default UserMatches;
