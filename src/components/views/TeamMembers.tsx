import {
  ButtonSizes,
  ButtonVariations,
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardSizes,
  Checkbox,
  Button as DsButton,
  Modal,
  PencilIcon,
  Select,
  StatusMessage,
  StatusTypes,
  Tag,
  TagSizes,
  Text,
  TextTypes,
} from '@a-little-world/little-world-design-system';
import { ArrowsUpDownIcon } from '@heroicons/react/20/solid';
import { type ColumnDef, createColumnHelper } from '@tanstack/react-table';
import React, { useMemo, useState } from 'react';
import { Link, createSearchParams, useSearchParams } from 'react-router-dom';
import styled from 'styled-components';

import {
  type ManagementPermissionRow,
  type TeamMember,
  type TeamMembersList,
  setUserManagementPermission,
} from '../../api/index';
import { BLUE_40, RED_40 } from '../../constants';
import { formatDate, formatTimeDistance } from '../../helpers/date';
import { permissionCheckboxState } from '../../helpers/managementPermissions';
import { useMatchingUsersListData } from '../../store';
import { Button } from '../atoms/Button';
import UserImage from '../atoms/UserImage';
import { DataTable } from '../blocks/DataTable';
import FiltersToolbar from '../blocks/FiltersToolbar';

const EmailCell = styled.div`
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  gap: ${({ theme }) => theme.spacing.xxsmall};
`;

const PermissionCell = styled.div`
  display: flex;
  align-items: flex-start;
  gap: ${({ theme }) => theme.spacing.xxsmall};
`;

const TagWrap = styled.div`
  display: flex;
  flex: 1;
  flex-wrap: wrap;
  min-width: 0;
  gap: ${({ theme }) => theme.spacing.xxxsmall};
`;

const EditButton = styled(DsButton)`
  flex-shrink: 0;
`;

const NoneLabel = styled(Text).attrs({
  type: TextTypes.Body7,
  tag: 'span' as const,
})`
  color: ${({ theme }) => theme.color.text.tertiary};
`;

const PermissionList = styled.div`
  display: flex;
  flex-direction: column;
  align-items: flex-start;
  gap: ${({ theme }) => theme.spacing.xsmall};
  max-height: 60vh;
  overflow: auto;
`;

const columnHelper = createColumnHelper<TeamMember>();

function fullName(member: Pick<TeamMember, 'profile'>) {
  return [member.profile.first_name, member.profile.second_name]
    .filter(Boolean)
    .join(' ');
}

function permissionTitle(row: ManagementPermissionRow) {
  const label = row.label ?? row.codename;
  const colon = label.indexOf(':');
  return colon === -1 ? label : label.slice(0, colon).trim();
}

function EnabledPermissionTags({
  permissions,
}: {
  permissions: ManagementPermissionRow[];
}) {
  const enabled = permissions.filter(row => row.enabled);
  if (enabled.length === 0) {
    return <NoneLabel>None</NoneLabel>;
  }

  return (
    <TagWrap>
      {enabled.map(row => (
        <span key={row.permission} title={row.label ?? row.codename}>
          <Tag bold size={TagSizes.small} color={BLUE_40}>
            {permissionTitle(row)}
          </Tag>
        </span>
      ))}
    </TagWrap>
  );
}

function PermissionEditor({
  userId,
  permissions,
  canGrantAdminOnlyPermissions,
  onUpdated,
  onActionError,
}: {
  userId: number;
  permissions: ManagementPermissionRow[];
  canGrantAdminOnlyPermissions: boolean;
  onUpdated: () => void;
  onActionError: (message: string | null) => void;
}) {
  const [pendingPermission, setPendingPermission] = useState<string | null>(
    null,
  );

  const onToggle = (permission: string, nextEnabled: boolean) => {
    onActionError(null);
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
        onActionError(e?.message || 'Could not update permission.');
        setPendingPermission(null);
        onUpdated();
      },
    });
  };

  return (
    <PermissionList>
      {permissions.map(row => {
        const { locked, label } = permissionCheckboxState(
          row,
          canGrantAdminOnlyPermissions,
        );

        return (
          <Checkbox
            key={row.permission}
            disabled={pendingPermission !== null}
            readOnly={locked}
            id={`team-member-${userId}-perm-${row.codename}`}
            label={label}
            checked={row.enabled}
            onCheckedChange={(val: boolean) => {
              if (!locked && val !== row.enabled) {
                onToggle(row.permission, val);
              }
            }}
            required={false}
          />
        );
      })}
    </PermissionList>
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

export function TeamMembers() {
  const [searchParams, setSearchParams] = useSearchParams({
    order_by: '-date_joined',
    page_size: '50',
  });
  const orderBy = searchParams.get('order_by') || '-date_joined';
  const search = searchParams.get('search') ?? '';

  const {
    matchingUsersList: rawList,
    isLoading,
    error,
    mutate,
  } = useMatchingUsersListData(createSearchParams(searchParams).toString());
  const teamMembersList = rawList as TeamMembersList | undefined;
  const members = teamMembersList?.results ?? [];

  const canEdit = Boolean(teamMembersList?.can_edit_management_permissions);
  const canGrantAdminOnlyPermissions = Boolean(
    teamMembersList?.can_grant_apply_management_permissions,
  );
  // Kept apart from the list: revoking someone's last permission drops them from it.
  const [editing, setEditing] = useState<{ id: number; name: string } | null>(
    null,
  );
  const [permissionError, setPermissionError] = useState<string | null>(null);
  const editingMember = members.find(member => member.id === editing?.id);
  const closeEditor = () => {
    setPermissionError(null);
    setEditing(null);
  };

  const columns = useMemo<ColumnDef<TeamMember, any>[]>(
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
            {fullName(row.original)}
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
        cell: ({ row }) => (
          <EmailCell>
            <Text type={TextTypes.Body6} tag="span">
              {row.original.email}
            </Text>
            {row.original.outside_team_domain && (
              <Tag bold size={TagSizes.small} color={RED_40}>
                Outside team domain
              </Tag>
            )}
          </EmailCell>
        ),
      }),
      columnHelper.accessor('permissions', {
        header: 'Management permissions',
        cell: ({ row }) => {
          const permissions = row.original.permissions ?? [];
          const name = fullName(row.original);
          return (
            <PermissionCell>
              <EnabledPermissionTags permissions={permissions} />
              {canEdit && (
                <EditButton
                  type="button"
                  variation={ButtonVariations.Icon}
                  size={ButtonSizes.Small}
                  title={`Edit permissions for ${name}`}
                  onClick={() => {
                    setPermissionError(null);
                    setEditing({ id: row.original.id, name });
                  }}
                >
                  <PencilIcon
                    width={16}
                    height={16}
                    label={`Edit permissions for ${name}`}
                  />
                </EditButton>
              )}
            </PermissionCell>
          );
        },
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
    [canEdit],
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
        paginationList={teamMembersList}
        isLoading={isLoading}
        loadingText="Loading team members..."
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
        <div className="p-4 text-center">Loading team members...</div>
      )}
      {error && (
        <div className="p-4 text-center">
          Error: {(error as Error).message}
          {(error as { status?: number })?.status === 403 &&
            ' — you need the Apply management permissions permission to view this page.'}
        </div>
      )}
      {!isLoading && !error && <DataTable columns={columns} data={members} />}
      <Modal open={editing != null} onClose={closeEditor}>
        <Card width={CardSizes.FullWidth}>
          <CardHeader>
            {editing ? `Permissions for ${editing.name}` : 'Permissions'}
          </CardHeader>
          <CardContent align="flex-start">
            {editingMember ? (
              <PermissionEditor
                userId={editingMember.id}
                permissions={editingMember.permissions ?? []}
                canGrantAdminOnlyPermissions={canGrantAdminOnlyPermissions}
                onUpdated={() => mutate()}
                onActionError={setPermissionError}
              />
            ) : (
              editing && (
                <Text type={TextTypes.Body6}>
                  {editing.name} no longer holds any management permissions, so
                  they have left this list. You can grant permissions again from
                  the Management permissions section on{' '}
                  <Link className="underline" to={`/user/${editing.id}`}>
                    their user page
                  </Link>
                  .
                </Text>
              )
            )}
          </CardContent>
          <StatusMessage
            type={StatusTypes.Error}
            visible={Boolean(permissionError)}
          >
            {permissionError}
          </StatusMessage>
          <CardFooter align="flex-end">
            <DsButton size={ButtonSizes.Small} onClick={closeEditor}>
              Done
            </DsButton>
          </CardFooter>
        </Card>
      </Modal>
    </>
  );
}

export default TeamMembers;
