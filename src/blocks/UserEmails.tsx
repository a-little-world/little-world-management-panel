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
import React, { useEffect, useState } from 'react';
import { createSearchParams, useSearchParams } from 'react-router-dom';
import { useTheme } from 'styled-components';
import useSWR from 'swr';

import Pagination from '../atoms/Pagination';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '../atoms/Table';
import { formatDate, formatTime } from '../helpers/date';
import { dataFetcher } from '../store';

const fields = [
  { key: 'receiver', label: 'Reciever' },
  { key: 'template', label: 'Template' },
  { key: 'sucess', label: 'Sent status' },
  { key: 'time', label: 'Time' },
  { key: 'retrieve', label: 'View' },
];

const UserEmails = ({ user }) => {
  let [searchParams, setSearchParams] = useSearchParams();
  const {
    data: emails,
    error,
    isLoading,
  } = useSWR(
    `/api/matching/users/${user.id}/emails/?${createSearchParams(
      searchParams,
    )}`,
    dataFetcher,
  );

  const [viewEmail, setViewEmail] = useState<string | null>(null);
  const theme = useTheme();

  const onViewEmail = (emailUrl: string) => {
    fetch(emailUrl)
      .then(response => response.text())
      .then(html => {
        setViewEmail(html);
      });
  };

  useEffect(() => {
    return () => searchParams.delete('page');
  }, [searchParams]);

  if (error) {
    return (
      <Text className="p-4 w-full" center>
        Error loading emails
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
      {user ? (
        <>
          <Table>
            <TableHeader>
              <TableRow>
                {fields.map(({ key, label }) => (
                  <TableHead key={key} className="w-[100px]">
                    {label}
                  </TableHead>
                ))}
              </TableRow>
            </TableHeader>
            {isEmpty(emails?.results) ? (
              <Text className="p-4 w-full" center>
                No results.
              </Text>
            ) : (
              <TableBody>
                {emails?.results.map(email => (
                  <TableRow key={email.id}>
                    {fields.map(({ key }) => {
                      if (key === 'retrieve') {
                        return (
                          <TableCell key={email + key}>
                            <Button
                              variation={ButtonVariations.Inline}
                              onClick={() => onViewEmail(email.retrieve)}
                              color={theme.color.text.link}
                            >
                              View Email
                            </Button>
                          </TableCell>
                        );
                      }
                      if (key === 'receiver') {
                        return (
                          <TableCell key={email + key}>
                            {email.receiver.email}
                          </TableCell>
                        );
                      }
                      if (key === 'template') {
                        return (
                          <TableCell key={email + key}>
                            {email.template}
                          </TableCell>
                        );
                      }
                      if (key === 'time') {
                        return (
                          <TableCell key={email + key}>
                            <Text tag="span" type={TextTypes.Body5}>
                              {formatDate(new Date(email.time))}{' '}
                              {formatTime(new Date(email.time))}
                            </Text>
                          </TableCell>
                        );
                      }
                      if (key === 'sucess') {
                        return (
                          <TableCell key={email + key}>
                            {email.sucess ? (
                              <CheckIcon
                                height={12}
                                width={12}
                                circular
                                backgroundColor="green"
                                color="white"
                                label="email successful icon"
                                labelId="emailSuccess"
                              />
                            ) : (
                              <ExclamationIcon
                                label="email unsuccessful icon"
                                labelId="emailUnsuccessful"
                                height={24}
                                width={24}
                              />
                            )}
                          </TableCell>
                        );
                      }
                    })}
                  </TableRow>
                ))}
              </TableBody>
            )}
          </Table>
          <Pagination list={emails} />
        </>
      ) : (
        <Text className="p-4 align-center w-full" center>
          Loading...
        </Text>
      )}
      <Modal open={Boolean(viewEmail)} onClose={() => setViewEmail(null)}>
        <div className="h-full overflow-scroll rounded-2xl">
          {viewEmail && <div dangerouslySetInnerHTML={{ __html: viewEmail }} />}
        </div>
      </Modal>
    </div>
  );
};

export default UserEmails;
