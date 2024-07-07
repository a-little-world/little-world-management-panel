import { Dropdown, Text } from '@a-little-world/little-world-design-system';
import { createColumnHelper } from '@tanstack/react-table';
import { get, isEmpty } from 'lodash';
import React, { useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { Link } from 'react-router-dom';
import { createSearchParams } from 'react-router-dom';
import styled from 'styled-components';

import MatchesIcons from '../atoms/MatchesIcons';
import Pagination from '../atoms/Pagination';
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
import { DataTable } from '../blocks/DataTable';
import { formatDate } from '../helpers/date';
import { useFilterOptions, useGlobalState, useUserListData } from '../store';
import { SelectedUsersSheet } from './../blocks/SelectedUsersSheet';

const StyledDropdown = styled(Dropdown)`
  div[data-radix-popper-content-wrapper] {
    z-index: 20 !important;
  }
`;

const DEFAULT_FIELDS = [
  { key: 'profile.image', label: 'Image' },
  { key: 'profile.user_type', label: 'Type' },
  { key: 'profile.name', label: 'Name' },
  { key: 'profile.target_group', label: 'Target Group' },
  { key: 'matches.unconfirmed', label: 'Unconfirmed' },
  { key: 'matches.confirmed', label: 'Confirmed' },
  { key: 'date_joined', label: 'Joined' },
];

const columnHelper = createColumnHelper();

const userColumns = [
  columnHelper.display({
    id: 'select',
    header: 'Selected',
    cell: props => (
      <input
        type="checkbox"
        checked={Object.keys(props.selectedUsers).includes(props.user.hash)}
        className="checkbox ml-2"
        onChange={() => {
          if (Object.keys(props.selectedUsers).includes(props.user.hash)) {
            props.deselectUser(user.hash);
          } else {
            props.selectUser(user);
          }
        }}
      />
    ),
  }),
  columnHelper.accessor('profile.image', {
    header: 'Image',
    cell: ({ row }) => (
      <Link to={`/user/${row.id}`}>
        <UserImage
          alt={'user profile image'}
          user={row.profile}
          dimensions={{
            height: 32,
            width: 32,
          }}
        />
      </Link>
    ),
  }),
  columnHelper.accessor('profile.name', {
    header: 'Name',
    cell: ({ row }) => `${row.profile.first_name} ${row.profile.second_name}`,
  }),
  columnHelper.accessor('profile.user_type', {
    header: 'Type',
    cell: ({ row }) => (
      <Tag
        size={TagSizes.small}
        appearance={
          row.profile.user_type === 'volunteer'
            ? TagAppearance.primary
            : TagAppearance.secondary
        }
      >
        {row.profile.user_type}
      </Tag>
    ),
  }),
  columnHelper.accessor('matches.confirmed', {
    header: 'Confirmed',
    cell: ({ row }) => <MatchesIcons matches={row.matches.confirmed.items} />,
  }),
  columnHelper.accessor('matches.unconfirmed', {
    header: 'Unconfirmed',
    cell: ({ row }) => <MatchesIcons matches={row.matches.unconfirmed.items} />,
  }),

  columnHelper.accessor('date_joined', {
    cell: ({ row }) => formatDate(new Date(row.date_joined)),
  }),
];

export function UsersTable({ userList }) {
  const { selectedUsers, selectUser, deselectUser } = useGlobalState();
  const [fields, setFields] = useState(DEFAULT_FIELDS);

  return <DataTable columns={userColumns} data={userList?.results} />;
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
        {isEmpty(userList?.results) ? (
          <Text className="p-4 w-full" center>
            No results.
          </Text>
        ) : (
          <TableBody>
            {userList?.results.map(user => (
              <TableRow key={user.hash}>
                <TableCell className="w-20">
                  <input
                    type="checkbox"
                    checked={Object.keys(selectedUsers).includes(user.hash)}
                    className="checkbox ml-2"
                    onChange={() => {
                      if (Object.keys(selectedUsers).includes(user.hash)) {
                        deselectUser(user.hash);
                      } else {
                        selectUser(user);
                      }
                    }}
                  />
                </TableCell>
                {fields.map(({ key }) => {
                  if (key === 'profile.image') {
                    return (
                      <TableCell key={user.hash + key}>
                        <Link to={`/user/${user.id}`}>
                          <UserImage
                            alt={'user profile image'}
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

                  if (key === 'profile.user_type')
                    return (
                      <TableCell key={user.hash + key}>
                        <Tag
                          size={TagSizes.small}
                          appearance={
                            user.profile.user_type === 'volunteer'
                              ? TagAppearance.primary
                              : TagAppearance.secondary
                          }
                        >
                          {user.profile.user_type}
                        </Tag>
                      </TableCell>
                    );

                  if (key.includes('matches.'))
                    return (
                      <TableCell key={user.hash + key}>
                        <MatchesIcons matches={get(user, key).items} />
                      </TableCell>
                    );

                  if (key === 'date_joined')
                    return (
                      <TableCell key={user.hash + key}>
                        {formatDate(new Date(user.date_joined))}
                      </TableCell>
                    );

                  if (key === 'profile.name')
                    return (
                      <TableCell key={user.hash + key}>
                        {`${user.profile.first_name} ${user.profile.second_name}`}
                      </TableCell>
                    );

                  return (
                    <TableCell key={user.hash + key}>
                      {get(user, key)}
                    </TableCell>
                  );
                })}
              </TableRow>
            ))}
          </TableBody>
        )}
      </Table>
      <SelectedUsersSheet />
    </>
  );
}

export function Users() {
  let [searchParams, setSearchParams] = useSearchParams();
  const list = searchParams.get('list') || 'all';
  const { filterOptions, isLoading: filtersLoading } = useFilterOptions();

  const { userList, isLoading: usersLoading } = useUserListData(
    createSearchParams(searchParams),
  );

  const changeList = (list: string) => {
    setSearchParams(createSearchParams({ ...searchParams, list }));
  };

  console.log({ userList });

  return (
    <>
      {filtersLoading ? (
        <div className="flex w-full overflow-scroll gap-2 p-4 align-center justify-center items-center">
          Loading filters...
        </div>
      ) : (
        <div className="w-full flex items-center w-full gap-4 p-4 justify-between flex-wrap">
          <StyledDropdown
            value={list}
            options={filterOptions.lists.map(({ name, description }) => ({
              value: name,
              label: description,
            }))}
            onValueChange={val => changeList(val)}
            placeholder="Select a user list..."
            cannotError
          />
          <Pagination list={userList} />
        </div>
      )}

      {usersLoading ? (
        <div className="p-4 text-center">Loading users list '${list}'...</div>
      ) : (
        <UsersTable userList={userList} />
      )}
    </>
  );
}

export default Users;
