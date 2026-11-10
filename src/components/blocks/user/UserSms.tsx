import { Text, TextTypes } from '@a-little-world/little-world-design-system';
import { isEmpty } from 'lodash';
import React from 'react';
import useSWR from 'swr';

import { formatDate, formatTime } from '../../../helpers/date';
import { dataFetcher } from '../../../store';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '../../atoms/Table';

const fields = [
  { key: 'to', label: 'Recipient' },
  { key: 'from', label: 'Sent by' },
  { key: 'message', label: 'Message' },
  { key: 'success', label: 'Status' },
  { key: 'time', label: 'Time' },
];

const UserSms = ({ user }: { user: { id: number } }) => {
  const {
    data: sms,
    error,
    isLoading,
  } = useSWR(`/api/matching/users/${user.id}/sms/`, dataFetcher);

  if (error) {
    return (
      <Text className="p-4 w-full" center>
        Error loading SMS
      </Text>
    );
  }
  if (isLoading) {
    return (
      <Text className="p-4 w-full" center>
        Loading...
      </Text>
    );
  }

  return (
    <div className="w-full flex flex-col gap-4">
      <Table>
        <TableHeader>
          <TableRow>
            {fields.map(({ key, label }) => (
              <TableHead key={key}>{label}</TableHead>
            ))}
          </TableRow>
        </TableHeader>
        {isEmpty(sms) ? (
          <Text className="p-4 w-full" center>
            No results.
          </Text>
        ) : (
          <TableBody>
            {sms?.map(item => (
              <TableRow key={item.id}>
                {fields.map(({ key }) => {
                  if (key === 'to') {
                    return (
                      <TableCell key={item.id + key}>
                        {item.recipient_email}
                      </TableCell>
                    );
                  }
                  if (key === 'from') {
                    return (
                      <TableCell key={item.id + key}>
                        {item.sender_email}
                      </TableCell>
                    );
                  }
                  if (key === 'message') {
                    return (
                      <TableCell key={item.id + key}>
                        <Text tag="span" type={TextTypes.Body5}>
                          {item.message}
                        </Text>
                      </TableCell>
                    );
                  }
                  if (key === 'success') {
                    return (
                      <TableCell key={item.id + key}>
                        {item.success ? 'Sent' : 'Failed'}
                      </TableCell>
                    );
                  }
                  if (key === 'time') {
                    return (
                      <TableCell key={item.id + key}>
                        <Text tag="span" type={TextTypes.Body5}>
                          {formatDate(new Date(item.created_at), 'P')}{' '}
                          {formatTime(new Date(item.created_at))}
                        </Text>
                      </TableCell>
                    );
                  }
                })}
              </TableRow>
            ))}
          </TableBody>
        )}
      </Table>
    </div>
  );
};

export default UserSms;