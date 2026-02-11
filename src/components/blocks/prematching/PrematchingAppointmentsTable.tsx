import {
  Tag,
  TagAppearance,
  TagSizes,
  Text,
} from '@a-little-world/little-world-design-system';
import { get, isEmpty } from 'lodash';
import React, { useState } from 'react';
import { Link } from 'react-router-dom';

import { useGlobalState } from '../../../store';
import SelectBox from '../../atoms/SelectBox';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '../../atoms/Table';
import UserImage from '../../atoms/UserImage';

const PREMATCH_APPOINTMENT_FIELDS = [
  { key: 'had_prematching_call', label: 'Attended Call' },
  { key: 'user', label: 'User' },
  { key: 'name', label: 'Name' },
  { key: 'email', label: 'Email' },
  { key: 'start_time', label: 'Starts At' },
];

export function PrematchingAppointmentsTable({ appointments, list }) {
  const {
    selectedPrematchingAppointmentUsers,
    selectPrematchingAppointmentUser,
    deselectPrematchingAppointmentUser,
  } = useGlobalState();

  const [fields] = useState(PREMATCH_APPOINTMENT_FIELDS);

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
                  <SelectBox
                    checked={Object.keys(
                      selectedPrematchingAppointmentUsers,
                    ).includes(appointment.user.hash)}
                    onChange={() => {
                      if (
                        Object.keys(
                          selectedPrematchingAppointmentUsers,
                        ).includes(appointment.user.hash)
                      ) {
                        deselectPrematchingAppointmentUser(
                          appointment.user.hash,
                        );
                      } else {
                        selectPrematchingAppointmentUser(appointment.user);
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
                            hasPriority={user.has_match_priority}
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

                  if (key === 'had_prematching_call') {
                    return (
                      <TableCell key={appointment.uuid + key}>
                        <Tag
                          appearance={
                            appointment.had_prematching_call
                              ? TagAppearance.success
                              : TagAppearance.error
                          }
                          size={TagSizes.small}
                        >
                          {appointment.had_prematching_call ? 'Yes' : 'No'}
                        </Tag>
                      </TableCell>
                    );
                  }

                  if (key === 'name') {
                    return (
                      <TableCell key={appointment.uuid + key}>
                        {appointment.user.profile.first_name}{' '}
                        {appointment.user.profile.second_name}
                      </TableCell>
                    );
                  }

                  if (key === 'email') {
                    return (
                      <TableCell key={appointment.uuid + key}>
                        {appointment.user.email}
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
