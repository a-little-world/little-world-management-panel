import {
  Button,
  ButtonVariations,
  CheckIcon,
  ExclamationIcon,
  Modal,
  Text,
  TextTypes,
} from '@a-little-world/little-world-design-system';
import { isEmpty } from 'lodash';
import React, { useState } from 'react';
import { useTheme } from 'styled-components';

import MatchesIcons from '../atoms/MatchesIcons';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '../atoms/Table';
import { formatDate, formatTime } from '../helpers/date';
import UserCard from './UserCard';

const fields = [
  { key: 'receiver', label: 'Reciever' },
  { key: 'template', label: 'Template' },
  { key: 'sucess', label: 'Sent status' },
  { key: 'time', label: 'Time' },
  { key: 'retrieve', label: 'View' },
];

const UserMatches = ({ user }) => {
  const [viewEmail, setViewEmail] = useState<string | null>(null);
  const theme = useTheme();

  const onViewEmail = (emailUrl: string) => {
    fetch(emailUrl)
      .then(response => response.text())
      .then(html => {
        setViewEmail(html);
      });
  };
  console.log({ user });
  return (
    <div className="w-full">
      <div className="">
        <Text type={TextTypes.Heading5}>Confirmed</Text>
        {isEmpty(user?.matches.confirmed?.items) ? (
          <Text>No confirmed matches</Text>
        ) : (
          user?.matches.confirmed?.items.map(match => (
            <UserCard user={match.partner} />
          ))
        )}
      </div>
      <div>
        <Text type={TextTypes.Heading5}>Unconfirmed</Text>
        {isEmpty(user?.matches.confirmed?.items) ? (
          <Text>No unconfirmed matches</Text>
        ) : (
          user?.matches.confirmed?.items.map(match => (
            <UserCard user={match.partner} />
          ))
        )}
      </div>
      <div>
        <Text type={TextTypes.Heading5}>Proposed</Text>
        {isEmpty(user?.matches.confirmed?.items) ? (
          <Text>No proposed matches</Text>
        ) : (
          user?.matches.confirmed?.items.map(match => (
            <UserCard user={match.partner} />
          ))
        )}
      </div>

      <div className="w-full text-xs text-center flex flex-col gap-2 items-center border-blue">
        <MatchesIcons
          label="Confirmed"
          matches={user?.matches.confirmed?.items}
        />
        <MatchesIcons
          label="Unconfirmed"
          matches={user?.matches.unconfirmed?.items}
        />
        <MatchesIcons
          label="Proposed"
          matches={user?.matches.proposed?.items}
        />
      </div>
    </div>
  );
};

export default UserMatches;
