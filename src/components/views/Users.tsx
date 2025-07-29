import {
  Button as DSButton,
  Dropdown,
  Tag,
  TagSizes,
} from '@a-little-world/little-world-design-system';
import { ArrowsUpDownIcon } from '@heroicons/react/20/solid';
import { createColumnHelper } from '@tanstack/react-table';
import { capitalize, isNumber } from 'lodash';
import React, { useEffect, useState } from 'react';
import { Link, createSearchParams, useSearchParams } from 'react-router-dom';
import styled, { css } from 'styled-components';

import { getUserListExport } from '../../api/index';
import { formatDate, formatTimeDistance } from '../../helpers/date';
import { useGlobalState, useUserListData } from '../../store';
import { Button } from '../atoms/Button';
import MatchesIcons from '../atoms/MatchesIcons';
import UserImage from '../atoms/UserImage';
import { DataTable } from '../blocks/DataTable';
import {
  DEFAULT_HEADERS,
  DownloadSettingsModal,
} from '../blocks/DownloadSettingsModal';
import Filters, { containsFilterKey } from '../blocks/Filters';
import FiltersToolbar from '../blocks/FiltersToolbar';
import { SelectedUsersSheet } from '../blocks/SelectedUsersSheet';

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
        bold
        size={TagSizes.small}
        color={
          row.original.profile.user_type === 'volunteer' ? '#9631c5' : '#ec2525'
        }
      >
        {capitalize(row.original.profile.user_type)}
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
      return <MatchesIcons matches={row.original.matches.confirmed.results} />;
    },
  }),
  columnHelper.accessor('matches.unconfirmed', {
    header: 'Unconfirmed',
    cell: ({ row }) => (
      <MatchesIcons matches={row.original.matches.unconfirmed.results} />
    ),
  }),
  columnHelper.accessor('matches.proposed', {
    header: 'Proposed',
    cell: ({ row }) => (
      <MatchesIcons matches={row.original.matches.proposed.results} />
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
  columnHelper.accessor('waiting_time.number_of_days', {
    header: ({ column }) => {
      return (
        <Button
          variant="ghost"
          onClick={() => column.toggleSorting(column.getIsSorted() === 'asc')}
        >
          Waiting time (days)
          <ArrowsUpDownIcon className="ml-2 h-4 w-4" />
        </Button>
      );
    },
    cell: ({ row }) =>
      `${
        isNumber(row.original.waiting_time?.number_of_days)
          ? row.original.waiting_time?.number_of_days
          : row.original.waiting_time?.waiting_time_string
      }`,
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

type Filters = { [key: string]: string | string[] };

export function Users() {
  let [searchParams, setSearchParams] = useSearchParams({
    order_by: '-date_joined',
    page_size: '50',
  });
  const list = searchParams.get('list') || 'all';
  const orderBy = searchParams.get('order_by') || '-date_joined';

  const [filters, setFilters] = useState<Filters>({});
  const [filtersOpen, setFiltersOpen] = useState(false);
  const [downloadSettingsOpen, setDownloadSettingsOpen] = useState(false);
  const [selectedHeaders, setSelectedHeaders] =
    useState<string[]>(DEFAULT_HEADERS);

  const {
    userList,
    isLoading: usersLoading,
    error,
  } = useUserListData(createSearchParams(searchParams));

  // Sync searchParams with filters state
  useEffect(() => {
    const paramsObject: Filters = {};

    searchParams.forEach((value, key) => {
      if (paramsObject[key]) {
        paramsObject[key] = Array.isArray(paramsObject[key])
          ? [...(paramsObject[key] as string[]), value]
          : [paramsObject[key] as string, value];
      } else {
        paramsObject[key] = value;
      }
    });

    setFilters(paramsObject);
  }, [searchParams]);

  const removeSearchParam = (key: string) => {
    searchParams.delete('page');
    searchParams.delete(key);
    setSearchParams(searchParams);
    setFilters(prevFilters => {
      const newFilters = { ...prevFilters };
      delete newFilters[key];
      return newFilters;
    });
  };

  const updateSearchParams = (key: string, value: string | string[]) => {
    searchParams.delete('page');

    if (!value) {
      removeSearchParam(key);
    } else {
      if (Array.isArray(value)) {
        // Remove the existing parameter
        searchParams.delete(key);

        // Add each array element as a separate parameter
        value.forEach(item => {
          searchParams.append(key, item);
        });
      } else {
        searchParams.set(key, value);
      }

      setSearchParams(searchParams);
      setFilters(prevFilters => ({
        ...prevFilters,
        [key]: value,
      }));
    }
  };

  const handleDownload = () => {
    getUserListExport({
      searchParams: createSearchParams(searchParams),
      onSuccess: response => {
        const headers = selectedHeaders.join(',');
        const csvRows = response.map(row =>
          selectedHeaders
            .map(header => {
              if (header.includes('profile.')) {
                const [_, field] = header.split('.');
                return row.profile[field];
              }
              return row[header];
            })
            .join(','),
        );

        const csvContent = [headers, ...csvRows].join('\n');

        const blob = new Blob([csvContent], {
          type: 'text/csv;charset=utf-8;',
        });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `${list} ${new Date().toLocaleDateString('de')}.csv`;
        a.click();
      },
      onError: error => console.log({ error }),
    });
  };

  const handleSettingsSave = (headers: string[]) => {
    setSelectedHeaders(headers);
  };

  return (
    <>
      <FiltersToolbar
        showSearchBar
        searchPlaceholder="Search by name or email"
        searchDefaultValue={filters?.search as string}
        onSearchSubmit={search => updateSearchParams('search', search)}
        showFiltersButton
        filtersActive={containsFilterKey(filters)}
        onFiltersClick={() => setFiltersOpen(true)}
        showDownloadButton
        downloadDisabled={!list}
        onDownloadClick={handleDownload}
        showSettingsButton
        settingsDisabled={!list}
        onSettingsClick={() => setDownloadSettingsOpen(true)}
        paginationList={userList}
        isLoading={usersLoading}
        loadingText="Loading users..."
      >
        <Dropdown
          label={'Sort'}
          value={orderBy}
          options={orderingOptions}
          onValueChange={val => updateSearchParams('order_by', val)}
          placeholder="Order by..."
          cannotError
          maxWidth="160px"
        />
      </FiltersToolbar>

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
      <DownloadSettingsModal
        selectedHeaders={selectedHeaders}
        setSelectedHeaders={setSelectedHeaders}
        open={downloadSettingsOpen}
        onClose={() => setDownloadSettingsOpen(false)}
        onSave={handleSettingsSave}
      />
    </>
  );
}

export default Users;
