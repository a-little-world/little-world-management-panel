import {
  ButtonSizes,
  Button as DSButton,
  Dropdown,
} from '@a-little-world/little-world-design-system';
import { ArrowsUpDownIcon } from '@heroicons/react/20/solid';
import { createColumnHelper } from '@tanstack/react-table';
import { SlidersHorizontalIcon } from 'lucide-react';
import React, { useEffect, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { Link } from 'react-router-dom';
import { createSearchParams } from 'react-router-dom';
import styled, { css } from 'styled-components';

import { Button } from '../atoms/Button';
import MatchesIcons from '../atoms/MatchesIcons';
import { PageSizeDropdown } from '../atoms/PageSizeDropdown';
import Pagination from '../atoms/Pagination';
import Tag, { TagAppearance, TagSizes } from '../atoms/Tag';
import UserImage from '../atoms/UserImage';
import { DataTable } from '../blocks/DataTable';
import Filters, { containsFilterKey } from '../blocks/Filters';
import SearchBar from '../blocks/SearchBar';
import { formatDate, formatTimeDistance } from '../helpers/date';
import { useGlobalState, useUserListData } from '../store';
import { SelectedUsersSheet } from './../blocks/SelectedUsersSheet';

const StyledDropdown = styled(Dropdown)`
  div[data-radix-popper-content-wrapper] {
    z-index: 20 !important;
  }
`;

const FilterButton = styled(DSButton)<{ $active: boolean }>`
  ${({ $active, theme }) =>
    $active &&
    css`
      border: 1px solid ${theme.color.border.selected};
      &:before {
        content: '';
        display: inline-block;
        position: absolute;
        top: -1px;
        right: -2px;
        width: 15px;
        height: 15px;
        border-radius: ${theme.radius.full};
        background-color: ${theme.color.surface.highlight};
        color: ${theme.color.text.primary};
      }
    `}
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
    value: 'date_joined',
    label: '(Asc) By Date Joined',
  },
  {
    value: '-date_joined',
    label: '(Desc) By Date Joined',
  },
  {
    value: 'last_login',
    label: '(Asc) By Last Login',
  },
  {
    value: '-last_login',
    label: '(Desc) By Last Login',
  },
];

export function Users() {
  let [searchParams, setSearchParams] = useSearchParams();
  const list = searchParams.get('list') || 'all';
  const orderBy = searchParams.get('order_by') || '-date_joined';

  const [filters, setFilters] = useState({});
  const [filtersOpen, setFiltersOpen] = useState(false);

  const {
    userList,
    isLoading: usersLoading,
    error,
  } = useUserListData(createSearchParams(searchParams));

  // Sync searchParams with filters state
  useEffect(() => {
    const paramsObject = Object.fromEntries([...searchParams]);
    setFilters(paramsObject);
  }, [searchParams]);

  const removeSearchParam = (key: string) => {
    searchParams.delete(key);
    setSearchParams(searchParams);
    setFilters(prevFilters => {
      const newFilters = { ...prevFilters };
      delete newFilters[key];
      return newFilters;
    });
  };

  const updateSearchParams = (key: string, value: string) => {
    if (!value) {
      removeSearchParam(key);
    } else {
      searchParams.set(key, value);
      setSearchParams(searchParams);
      setFilters(prevFilters => ({
        ...prevFilters,
        [key]: value,
      }));
    }
  };

  return (
    <>
      <div className="w-full flex items-end gap-5 p-4 justify-between flex-wrap">
        <div className="flex items-center gap-2">
          <SearchBar
            name="email"
            hideSubmitBtn
            isSubmitting={false}
            onSubmit={({ email }) => updateSearchParams('email', email)}
            error={null}
            placeholder="Filter by email"
          />
          <FilterButton
            backgroundColor={'black'}
            onClick={() => setFiltersOpen(true)}
            size={ButtonSizes.Small}
            $active={containsFilterKey(filters)}
          >
            <SlidersHorizontalIcon width={16} height={16} /> Filters
          </FilterButton>
        </div>
        <div className="flex items-end gap-6 flex-wrap">
          <div className="flex items-center gap-2">
            <StyledDropdown
              label={'Sort'}
              value={orderBy}
              options={orderingOptions}
              onValueChange={val => updateSearchParams('order_by', val)}
              placeholder="Select a user list..."
              cannotError
              maxWidth="160px"
            />
            <PageSizeDropdown />
          </div>
          <Pagination list={userList} />
        </div>
      </div>

      {usersLoading && (
        <div className="p-4 text-center">Loading users list '${list}'...</div>
      )}
      {error && <div className="p-4 text-center">Error: {error.message}</div>}
      {!usersLoading && !error && <UsersTable userList={userList} />}
      <Filters
        defaultValues={filters}
        open={filtersOpen}
        onClose={() => setFiltersOpen(false)}
        onUpdateFilters={updateSearchParams}
        onRemoveFilter={removeSearchParam}
      />
    </>
  );
}

export default Users;
