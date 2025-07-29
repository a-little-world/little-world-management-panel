import { Text } from '@a-little-world/little-world-design-system';
import { get, isEmpty } from 'lodash';
import React from 'react';
import useSWR from 'swr';

import { cratePostFetcher } from '../../../store';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '../../atoms/Table';

const MATCHES_FIELDS = [
  { key: 'count_type', label: 'Amount of' },
  { key: 'user1', label: 'User 1' },
  { key: 'user2', label: 'User 2' },
  { key: 'created_at', label: 'Created At' },
  { key: 'updated_at', label: 'Last Activity' },
];

const tableCategories = [
  {
    id: 'in-reg',
    title: 'Users still in Registration Process',
    filters: [
      'ujv2_user_created',
      'ujv2_email_verified',
      'ujv2_user_form_completed',
      'ujv2_booked_onboarding_call',
      'ujv2_no_show',
    ],
  },
];

const tb = tableCategories[0];

export function UserCountsBucketTable({ category = tb }) {
  const random = React.useRef(Date.now() + Math.random());
  const { mutate, error, data, isLoading } = useSWR(
    '/api/matching/users/statistics/user_journey_buckets/' +
      '?random=' +
      random.current,
    cratePostFetcher({
      selected_filters: category.filters,
    }),
    {},
  );

  const tableFields = [
    {
      key: 'count_type',
      label: 'Buckets:',
    },
    ...tb.filters.map(filter => {
      return {
        key: filter,
        label: filter,
      };
    }),
  ];

  // Now we need to tranfor the data
  let row: { [key: string]: any } = {};
  let description_row: { [key: string]: any } = {};

  if (data) {
    row['count_type'] = 'Users';
    description_row['count_type'] = 'Bucket Description';
    data?.buckets.forEach((item: any) => {
      let count_type = item.name;
      row[count_type] = item.count;

      description_row[count_type] = item.description;
    });
  }

  return (
    <BucketTable
      tableFields={tableFields}
      results={isEmpty(row) ? [] : [row, description_row]}
    />
  );
}

export function BucketTable({
  tableFields = [
    {
      key: 'count_type',
      label: 'Buckets:',
    },
    ...tb.filters.map(filter => {
      return {
        key: filter,
        label: filter,
      };
    }),
  ],
  results = [
    {
      count_type: 'Users',
    },
  ],
}) {
  return (
    <>
      <Table>
        <TableHeader>
          <TableRow>
            {tableFields.map(({ key, label }) => (
              <TableHead key={key} className="w-[100px]">
                {label}
              </TableHead>
            ))}
          </TableRow>
        </TableHeader>
        {isEmpty(results) ? (
          <Text className="p-4 w-full" center>
            No results.
          </Text>
        ) : (
          <TableBody>
            {results.map(result => (
              <TableRow key={0}>
                {tableFields.map(({ key }) => {
                  return <TableCell key={key}>{get(result, key)}</TableCell>;
                })}
              </TableRow>
            ))}
          </TableBody>
        )}
      </Table>
    </>
  );
}
