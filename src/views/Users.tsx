import { Dropdown } from '@a-little-world/little-world-design-system';
import { ArrowsUpDownIcon } from '@heroicons/react/20/solid';
import { createColumnHelper } from '@tanstack/react-table';
import React from 'react';
import { useSearchParams } from 'react-router-dom';
import { Link } from 'react-router-dom';
import { createSearchParams } from 'react-router-dom';
import styled from 'styled-components';

import MatchesIcons from '../atoms/MatchesIcons';
import Pagination from '../atoms/Pagination';
import Tag, { TagAppearance, TagSizes } from '../atoms/Tag';
import UserImage from '../atoms/UserImage';
import { DataTable } from '../blocks/DataTable';
import { formatDate, formatTimeDistance } from '../helpers/date';
import { Button } from '../shadcnui/ui/button';
import { useFilterOptions, useGlobalState, useUserListData } from '../store';
import { SelectedUsersSheet } from './../blocks/SelectedUsersSheet';

const StyledDropdown = styled(Dropdown)`
  div[data-radix-popper-content-wrapper] {
    z-index: 20 !important;
  }
`;

const columnHelper = createColumnHelper();

const userColumns = [
  columnHelper.display({
    id: 'select',
    header: 'Selected',
    cell: ({ table, row }) => (
      <input
        type="checkbox"
        checked={Object.keys(table.options.meta.selectedUsers).includes(
          row.original.hash,
        )}
        className="checkbox ml-2"
        onChange={() => {
          if (
            Object.keys(table.options.meta.selectedUsers).includes(
              row.original.hash,
            )
          ) {
            table.options.meta.deselectUser(row.original.hash);
          } else {
            table.options.meta.selectUser(row.original);
          }
        }}
      />
    ),
  }),
  columnHelper.accessor('profile.image', {
    header: 'Image',
    cell: ({ row }) => (
      <Link to={`/user/${row?.original.id}`}>
        <UserImage
          alt={'user profile image'}
          user={row?.original.profile}
          dimensions={{
            height: 32,
            width: 32,
          }}
        />
      </Link>
    ),
  }),
  columnHelper.accessor('profile.first_name', {
    header: ({ column }) => {
      return (
        <Button
          variant="ghost"
          onClick={() => column.toggleSorting(column.getIsSorted() === 'asc')}
        >
          Name
          <ArrowsUpDownIcon className="ml-2 h-4 w-4" />
        </Button>
      );
    },
    cell: ({ row, cell }) => {
      console.log({ row, val: cell.getValue() });
      return `${row?.original.profile.first_name} ${row?.original.profile.second_name}`;
    },
  }),
  columnHelper.accessor('profile.user_type', {
    header: ({ column }) => {
      return (
        <Button
          variant="ghost"
          onClick={() => column.toggleSorting(column.getIsSorted() === 'asc')}
        >
          Type
          <ArrowsUpDownIcon className="ml-2 h-4 w-4" />
        </Button>
      );
    },
    cell: ({ row }) => (
      <Tag
        size={TagSizes.small}
        appearance={
          row.original.profile.user_type === 'volunteer'
            ? TagAppearance.primary
            : TagAppearance.secondary
        }
      >
        {row.original.profile.user_type}
      </Tag>
    ),
  }),
  columnHelper.accessor('profile.target_groups', {
    header: ({ column }) => {
      return (
        <Button
          variant="ghost"
          onClick={() => column.toggleSorting(column.getIsSorted() === 'asc')}
        >
          Group
          <ArrowsUpDownIcon className="ml-2 h-4 w-4" />
        </Button>
      );
    },
    cell: ({ row }) => (
      <div>{row.original.profile.target_groups?.join(', ')}</div>
    ),
  }),
  columnHelper.accessor('matches.confirmed', {
    header: 'Confirmed',
    cell: ({ row }) => {
      return <MatchesIcons matches={row.original.matches.confirmed.items} />;
    },
  }),
  columnHelper.accessor('matches.unconfirmed', {
    header: 'Unconfirmed',
    cell: ({ row }) => (
      <MatchesIcons matches={row.original.matches.unconfirmed.items} />
    ),
  }),
  columnHelper.accessor('date_joined', {
    header: ({ column }) => {
      return (
        <Button
          variant="ghost"
          onClick={() => column.toggleSorting(column.getIsSorted() === 'asc')}
        >
          Joined
          <ArrowsUpDownIcon className="ml-2 h-4 w-4" />
        </Button>
      );
    },
    cell: ({ row }) =>
      `${formatDate(new Date(row.original.date_joined))} (${formatTimeDistance(
        new Date(row.original.date_joined),
        new Date(),
      )})`,
  }),
];

export function UsersTable({ userList }) {
  const { selectedUsers, selectUser, deselectUser } = useGlobalState();

  return (
    <>
      <DataTable
        columns={userColumns}
        data={userList?.results}
        tableMeta={{ selectedUsers, deselectUser, selectUser }}
      />
      <SelectedUsersSheet />
    </>
  );
}

const orderingOptions = [
  {
    value: '-date_joined',
    label: 'By Date Joined',
  },
  {
    value: '-last_login',
    label: 'By Last Login',
  },
];

export function Users() {
  let [searchParams, setSearchParams] = useSearchParams();
  const list = searchParams.get('list') || 'all';
  const orderBy = searchParams.get('order_by') || '-date_joined';
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
          <StyledDropdown
            value={orderBy}
            options={orderingOptions}
            onValueChange={val =>
              setSearchParams(
                createSearchParams({ ...searchParams, order_by: val }),
              )
            }
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
