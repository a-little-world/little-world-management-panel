import {
  Dropdown,
  Tag,
  TagSizes,
} from '@a-little-world/little-world-design-system';
import { ArrowsUpDownIcon } from '@heroicons/react/20/solid';
import { createColumnHelper } from '@tanstack/react-table';
import { capitalize, isNumber } from 'lodash';
import React, { useMemo, useRef, useEffect, useState } from 'react';
import { Link, createSearchParams, useSearchParams } from 'react-router-dom';

import {
  getUsersExportColumns,
  getUsersExportPage,
  getUsersListPaginationMeta,
} from '../../api/index';
import { formatDate, formatTimeDistance } from '../../helpers/date';
import { useGlobalState, useUserListData } from '../../store';
import { Button } from '../atoms/Button';
import MatchesIcons from '../atoms/MatchesIcons';
import { ListPanel, ListScroll } from '../atoms/PageLayout';
import SelectBox from '../atoms/SelectBox';
import UserImage from '../atoms/UserImage';
import { DataTable } from '../blocks/DataTable';
import {
  DownloadSettingsModal,
  ExportDownloadFormat,
} from '../blocks/DownloadSettingsModal';
import Filters, { containsFilterKey } from '../blocks/Filters';
import FiltersToolbar from '../blocks/FiltersToolbar';
import {
  PaginatedCsvDownloader,
  PaginatedCsvDownloaderHandle,
} from '../blocks/PaginatedCsvDownloader';
import { SelectedUsersSheet } from '../blocks/SelectedUsersSheet';

const columnHelper = createColumnHelper();

const userColumns = [
  columnHelper.display({
    id: 'select',
    header: 'Selected',
    cell: ({ table, row }) => (
      <SelectBox
        checked={Object.keys(table.options.meta.selectedUsers).includes(
          row.original.uuid ?? row.original.hash,
        )}
        onChange={() => {
          if (
            Object.keys(table.options.meta.selectedUsers).includes(
              row.original.uuid ?? row.original.hash,
            )
          ) {
            table.options.meta.deselectUser(
              row.original.uuid ?? row.original.hash,
            );
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
          tooltipText={
            row?.original.state.has_match_priority
              ? 'Match priority'
              : undefined
          }
          hasPriority={row?.original.state.has_match_priority}
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
    cell: ({ row }) => {
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
      `${isNumber(row.original.waiting_time?.number_of_days)
        ? row.original.waiting_time?.number_of_days
        : row.original.waiting_time?.waiting_time_string
      }`,
  }),
  columnHelper.accessor('state.company', {
    header: ({ column }) => {
      return (
        <Button
          variant="ghost"
          onClick={() => column.toggleSorting(column.getIsSorted() === 'asc')}
        >
          Company
          <ArrowsUpDownIcon className="ml-2 h-4 w-4" />
        </Button>
      );
    },
    cell: ({ row }) => row.original.state.company,
  }),
  columnHelper.accessor('profile.country_of_residence', {
    header: ({ column }) => {
      return (
        <Button
          variant="ghost"
          onClick={() => column.toggleSorting(column.getIsSorted() === 'asc')}
        >
          Residence
          <ArrowsUpDownIcon className="ml-2 h-4 w-4" />
        </Button>
      );
    },
    cell: ({ row }) => row.original.profile.country_of_residence,
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
  columnHelper.accessor('last_login', {
    header: ({ column }) => {
      return (
        <Button
          variant="ghost"
          onClick={() => column.toggleSorting(column.getIsSorted() === 'asc')}
        >
          Last Login
          <ArrowsUpDownIcon className="ml-2 h-4 w-4" />
        </Button>
      );
    },
    cell: ({ row }) =>
      `${formatDate(new Date(row.original.last_login))} (${formatTimeDistance(
        new Date(row.original.last_login),
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
  const [downloadFormat, setDownloadFormat] =
    useState<ExportDownloadFormat>('csv');
  const [selectedHeaders, setSelectedHeaders] = useState<string[]>([]);
  const [availableHeaders, setAvailableHeaders] = useState<string[]>([]);
  const paginatedDownloaderRef = useRef<PaginatedCsvDownloaderHandle>(null);
  const searchParamsString = useMemo(
    () => createSearchParams(searchParams).toString(),
    [searchParams],
  );

  const {
    userList,
    isLoading: usersLoading,
    error,
  } = useUserListData(searchParamsString);

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

  const extractHeaders = (response: any[]): string[] => {
    if (!Array.isArray(response) || response.length === 0) {
      return [];
    }
    return Object.keys(response[0]);
  };

  const exportPageSize = useMemo(() => {
    const parsedPageSize = Number(searchParams.get('page_size') || '50');
    return Number.isFinite(parsedPageSize) && parsedPageSize > 0
      ? parsedPageSize
      : 50;
  }, [searchParams]);

  const handleDownload = () => {
    if (selectedHeaders.length === 0) {
      handleSettingsOpen();
      return;
    }
    paginatedDownloaderRef.current?.startPreparation();
  };

  const handleSettingsSave = (headers: string[]) => {
    setSelectedHeaders(headers);
  };

  const handleSettingsOpen = () => {
    setDownloadSettingsOpen(true);
    if (availableHeaders.length > 0) {
      return;
    }
    getUsersExportColumns({
      searchParams: searchParamsString,
    })
      .then((response: Record<string, any>[]) => {
        const headers = extractHeaders(response);
        setAvailableHeaders(headers);
      })
      .catch(error => console.log({ error }));
  };

  return (
    <>
      <FiltersToolbar
        bundleDownloadAndSettings
        showSearchBar
        searchPlaceholder="Search by name or email"
        searchDefaultValue={filters?.search as string}
        onSearchSubmit={search => updateSearchParams('search', search)}
        showFiltersButton
        filtersActive={containsFilterKey(filters)}
        onFiltersClick={() => setFiltersOpen(true)}
        showDownloadButton
        downloadDisabled={!list || usersLoading || selectedHeaders.length === 0}
        onDownloadClick={handleDownload}
        showSettingsButton
        settingsDisabled={false}
        onSettingsClick={handleSettingsOpen}
        paginationList={userList}
        isLoading={usersLoading}
        loadingText="Loading users..."
      >
        <Dropdown
          id="users_order_by_dropdown"
          label={'Sort'}
          value={orderBy}
          options={orderingOptions}
          onValueChange={val => updateSearchParams('order_by', val)}
          placeholder="Order by..."
          cannotError
          maxWidth="160px"
        />
      </FiltersToolbar>
      <PaginatedCsvDownloader
        ref={paginatedDownloaderRef}
        downloadFormat={downloadFormat}
        selectedHeaders={selectedHeaders}
        fileName={`${list} ${new Date().toLocaleDateString('de')}.csv`}
        resetToken={`${searchParamsString}:${selectedHeaders.join(',')}`}
        fetchMeta={() =>
          getUsersListPaginationMeta({
            searchParams: searchParamsString,
            pageSize: exportPageSize,
          })
        }
        fetchPage={({ page, pageSize }) =>
          getUsersExportPage({
            searchParams: searchParamsString,
            page,
            pageSize,
          })
        }
        onError={error => console.log({ error })}
      />

      <ListPanel $fullWidth>
        <ListScroll>
          {usersLoading && (
            <div className="p-4 text-center">
              Loading users list '${list}'...
            </div>
          )}
          {error && (
            <div className="p-4 text-center">Error: {error.message}</div>
          )}
          {!usersLoading && !error && <UsersTable userList={userList} />}
        </ListScroll>
      </ListPanel>
      <Filters
        defaultValues={filters}
        open={filtersOpen}
        onClose={() => setFiltersOpen(false)}
        onUpdateFilters={updateSearchParams}
        onRemoveFilter={removeSearchParam}
      />
      <DownloadSettingsModal
        selectedFormat={downloadFormat}
        availableHeaders={availableHeaders}
        selectedHeaders={selectedHeaders}
        setSelectedFormat={setDownloadFormat}
        setSelectedHeaders={setSelectedHeaders}
        open={downloadSettingsOpen}
        onClose={() => setDownloadSettingsOpen(false)}
        onSave={handleSettingsSave}
      />
    </>
  );
}

export default Users;
