import {
  Checkbox,
  Select,
  Tag,
  TagSizes,
  Text,
  TextTypes,
} from '@a-little-world/little-world-design-system';
import { ArrowsUpDownIcon } from '@heroicons/react/20/solid';
import { createColumnHelper } from '@tanstack/react-table';
import React, { useMemo, useState } from 'react';
import { Link, createSearchParams, useSearchParams } from 'react-router-dom';

import {
  type ManagementPermissionRow,
  setUserManagementPermission,
} from '../../api/index';
import { formatDate, formatTimeDistance } from '../../helpers/date';
import { useMatchingUsersListData } from '../../store';
import { Button } from '../atoms/Button';
import UserImage from '../atoms/UserImage';
import { DataTable } from '../blocks/DataTable';
import FiltersToolbar from '../blocks/FiltersToolbar';

const APPLY_MANAGEMENT_PERMISSIONS = 'management.apply_management_permissions';

const columnHelper = createColumnHelper();

function PermissionTags({
  permissions,
}: {
  permissions: ManagementPermissionRow[];
}) {
  const enabled = permissions.filter(row => row.enabled);
  const disabled = permissions.filter(row => !row.enabled);

  return (
    <div className="flex flex-col gap-2">
      {enabled.length > 0 && (
        <div className="flex flex-wrap gap-1">
          {enabled.map(row => (
            <Tag
              key={row.permission}
              bold
              size={TagSizes.small}
              color="#2563eb"
            >
              {row.label ?? row.codename}
            </Tag>
          ))}
        </div>
      )}
      {disabled.length > 0 && (
        <div className="flex flex-wrap gap-1 opacity-60">
          {disabled.map(row => (
            <Tag key={row.permission} size={TagSizes.small} color="#9ca3af">
              {row.label ?? row.codename}
            </Tag>
          ))}
        </div>
      )}
    </div>
  );
}

function PermissionCheckboxes({
  userId,
  permissions,
  canGrantApplyManagementPermissions,
  onUpdated,
}: {
  userId: number;
  permissions: ManagementPermissionRow[];
  canGrantApplyManagementPermissions: boolean;
  onUpdated: () => void;
}) {
  const [pendingPermission, setPendingPermission] = useState<string | null>(
    null,
  );
  const [actionError, setActionError] = useState<string | null>(null);

  const onToggle = (permission: string, nextEnabled: boolean) => {
    if (
      permission === APPLY_MANAGEMENT_PERMISSIONS &&
      !canGrantApplyManagementPermissions
    ) {
      return;
    }
    setActionError(null);
    setPendingPermission(permission);
    setUserManagementPermission({
      userId: String(userId),
      action: nextEnabled ? 'add' : 'remove',
      permission,
      onSuccess: () => {
        setPendingPermission(null);
        onUpdated();
      },
      onError: (e: { message?: string }) => {
        setActionError(e?.message || 'Could not update permission.');
        setPendingPermission(null);
        onUpdated();
      },
    });
  };

  return (
    <div className="flex flex-col gap-2">
      {actionError && (
        <Text type={TextTypes.Body4} className="text-red-600">
          {actionError}
        </Text>
      )}
      {permissions.map(row => {
        const isApplyPermissionReadOnly =
          row.permission === APPLY_MANAGEMENT_PERMISSIONS &&
          !canGrantApplyManagementPermissions;

        return (
          <Checkbox
            key={row.permission}
            disabled={pendingPermission !== null}
            readOnly={isApplyPermissionReadOnly}
            id={`matching-user-${userId}-perm-${row.codename}`}
            label={
              isApplyPermissionReadOnly
                ? `${row.label ?? row.codename} [STAFF ONLY]`
                : (row.label ?? row.codename)
            }
            checked={row.enabled}
            onCheckedChange={(val: boolean) => {
              if (val !== row.enabled) {
                onToggle(row.permission, val);
              }
            }}
            required={false}
          />
        );
      })}
    </div>
  );
}

const orderingOptions = [
  { value: 'date_joined', label: '(Asc) By date joined' },
  { value: '-date_joined', label: '(Desc) By date joined' },
  { value: 'last_login', label: '(Asc) By last login' },
  { value: '-last_login', label: '(Desc) By last login' },
  { value: 'email', label: '(Asc) By email' },
  { value: '-email', label: '(Desc) By email' },
];

export function MatchingUsers() {
  const [searchParams, setSearchParams] = useSearchParams({
    order_by: '-date_joined',
    page_size: '50',
  });
  const orderBy = searchParams.get('order_by') || '-date_joined';
  const search = searchParams.get('search') ?? '';

  const { matchingUsersList, isLoading, error, mutate } =
    useMatchingUsersListData(createSearchParams(searchParams).toString());

  const canEdit = Boolean(matchingUsersList?.can_edit_management_permissions);
  const canGrantApplyManagementPermissions = Boolean(
    matchingUsersList?.can_grant_apply_management_permissions,
  );

  const matchingUserColumns = useMemo(
    () => [
      columnHelper.accessor('profile.image', {
        header: 'Image',
        cell: ({ row }) => (
          <Link to={`/user/${row.original.id}`}>
            <UserImage
              alt="user profile image"
              user={row.original.profile}
              dimensions={{ height: 32, width: 32 }}
            />
          </Link>
        ),
      }),
      columnHelper.accessor('profile.first_name', {
        header: ({ column }) => (
          <Button
            variant="ghost"
            onClick={() => column.toggleSorting(column.getIsSorted() === 'asc')}
          >
            Name
            <ArrowsUpDownIcon className="ml-2 h-4 w-4" />
          </Button>
        ),
        cell: ({ row }) => (
          <Link className="hover:underline" to={`/user/${row.original.id}`}>
            {`${row.original.profile.first_name} ${row.original.profile.second_name}`}
          </Link>
        ),
      }),
      columnHelper.accessor('email', {
        header: ({ column }) => (
          <Button
            variant="ghost"
            onClick={() => column.toggleSorting(column.getIsSorted() === 'asc')}
          >
            Email
            <ArrowsUpDownIcon className="ml-2 h-4 w-4" />
          </Button>
        ),
        cell: ({ row }) => row.original.email,
      }),
      columnHelper.accessor('is_staff', {
        header: 'Staff',
        cell: ({ row }) => (row.original.is_staff ? 'Yes' : 'No'),
      }),
      columnHelper.accessor('permissions', {
        header: 'Management permissions',
        cell: ({ row }) =>
          canEdit ? (
            <PermissionCheckboxes
              userId={row.original.id}
              permissions={row.original.permissions ?? []}
              canGrantApplyManagementPermissions={
                canGrantApplyManagementPermissions
              }
              onUpdated={() => mutate()}
            />
          ) : (
            <PermissionTags permissions={row.original.permissions ?? []} />
          ),
      }),
      columnHelper.accessor('date_joined', {
        header: ({ column }) => (
          <Button
            variant="ghost"
            onClick={() => column.toggleSorting(column.getIsSorted() === 'asc')}
          >
            Joined
            <ArrowsUpDownIcon className="ml-2 h-4 w-4" />
          </Button>
        ),
        cell: ({ row }) =>
          `${formatDate(new Date(row.original.date_joined))} (${formatTimeDistance(
            new Date(row.original.date_joined),
            new Date(),
          )})`,
      }),
      columnHelper.accessor('last_login', {
        header: ({ column }) => (
          <Button
            variant="ghost"
            onClick={() => column.toggleSorting(column.getIsSorted() === 'asc')}
          >
            Last login
            <ArrowsUpDownIcon className="ml-2 h-4 w-4" />
          </Button>
        ),
        cell: ({ row }) =>
          row.original.last_login
            ? `${formatDate(new Date(row.original.last_login))} (${formatTimeDistance(
                new Date(row.original.last_login),
                new Date(),
              )})`
            : '—',
      }),
    ],
    [canEdit, canGrantApplyManagementPermissions, mutate],
  );

  const updateSearchParams = (key: string, value: string) => {
    searchParams.delete('page');
    if (!value) {
      searchParams.delete(key);
    } else {
      searchParams.set(key, value);
    }
    setSearchParams(searchParams);
  };

  return (
    <>
      <FiltersToolbar
        showSearchBar
        searchPlaceholder="Search by name or email"
        searchDefaultValue={search}
        onSearchSubmit={val => updateSearchParams('search', val)}
        paginationList={matchingUsersList}
        isLoading={isLoading}
        loadingText="Loading matching users..."
      >
        <Select
          id="matching_users_order_by_dropdown"
          label="Sort"
          value={orderBy}
          options={orderingOptions}
          onValueChange={val => updateSearchParams('order_by', val)}
          placeholder="Order by..."
          cannotError
          maxWidth="200px"
        />
      </FiltersToolbar>

      {isLoading && (
        <div className="p-4 text-center">Loading matching users...</div>
      )}
      {error && (
        <div className="p-4 text-center">
          Error: {(error as Error).message}
          {(error as { status?: number })?.status === 403 &&
            ' — you need the matching user permission to view this page.'}
        </div>
      )}
      {!isLoading && !error && (
        <DataTable
          columns={matchingUserColumns}
          data={matchingUsersList?.results ?? []}
        />
      )}
    </>
  );
}

export default MatchingUsers;
