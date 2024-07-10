import { get, isEmpty } from 'lodash';
import { Text } from '@a-little-world/little-world-design-system';
import React, { useState } from 'react';
import { Link } from 'react-router-dom';

import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '../atoms/Table';
import Tag, { TagAppearance, TagSizes } from '../atoms/Tag';
import UserImage from '../atoms/UserImage';
import { useGlobalState } from '../store';

const PREMATCH_APPOINTMENT_FIELDS = [
  { key: 'user', label: "User" },
  { key: 'start_time', label: 'Starts At' },
];

export function PrematchingAppointmentsTable({ appointments, list }) {
  //const { selectedMatch, selectMatch, deselectMatch } = useGlobalState();
  const { selectedUsers, selectUser, deselectUser } = useGlobalState();
  console.log('selectedUsers', selectedUsers);

  const [fields, setFields] = useState(PREMATCH_APPOINTMENT_FIELDS);

  return (
    <>
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead className="w-[100px]">Selected</TableHead>
            {fields.map(({ key, label }) => (
              <TableHead key={key} className="w-[100px]">
                {label}
              </TableHead>
            ))}
          </TableRow>
        </TableHeader>
        {isEmpty(appointments?.results) ? (
          <Text className="p-4 w-full" center>
            No results.
          </Text>
        ) : (
          <TableBody>
            {appointments?.results.map(appointment => (
              <TableRow key={appointment.uuid}>
                <TableCell className="w-20">
                  <input
                    type="checkbox"
                    checked={Object.keys(selectedUsers).includes(appointment.user.hash)}
                    className="checkbox ml-2"
                    onChange={() => {
                      console.log('appointment', appointment);
                      if (Object.keys(selectedUsers).includes(appointment.user.hash)) {
                        deselectUser(appointment.user.hash);
                      } else {
                        selectUser(appointment.user);
                      }
                    }}
                  />
                </TableCell>
                {fields.map(({ key }) => {
                  if (key === 'user') {
                    const user = appointment[key];
                    return (
                      <TableCell key={appointment.uuid + key}>
                        <Link to={`/user/${user.id}`}>
                          <UserImage
                            alt={
                              user.profile.first_name +
                              ' ' +
                              user.profile.second_name
                            }
                            user={user.profile}
                            dimensions={{
                              height: 32,
                              width: 32,
                            }}
                          />
                        </Link>
                      </TableCell>
                    );
                  }

                  return (
                    <TableCell key={appointment.uuid + key}>
                      {get(appointment, key)}
                    </TableCell>
                  );
                })}
              </TableRow>
            ))}
          </TableBody>
        )}
      </Table>
    </>
  );
}
