import {
  Checkbox,
  StatusMessage,
  StatusTypes,
  Text,
  TextTypes,
} from '@a-little-world/little-world-design-system';
import React, { useState } from 'react';
import styled from 'styled-components';

import {
  type ManagementPermissionRow,
  setUserManagementPermission,
} from '../../api/index';
import { permissionCheckboxState } from '../../helpers/managementPermissions';

const List = styled.div`
  display: flex;
  flex-direction: column;
  align-items: flex-start;
  gap: ${({ theme }) => theme.spacing.xsmall};
`;

const Row = styled.div<{ $locked: boolean }>`
  display: flex;
  flex-direction: column;
  gap: ${({ theme }) => theme.spacing.xxxsmall};

  /* The design system has no disabled style; dim locked rows so they don't look clickable. */
  ${({ $locked }) =>
    $locked &&
    `
    opacity: 0.55;
    & button:disabled,
    & label {
      cursor: not-allowed;
    }
  `}
`;

const Hint = styled(Text).attrs({
  type: TextTypes.Body7,
  tag: 'span' as const,
})`
  color: ${({ theme }) => theme.color.text.tertiary};
`;

type RowError = { permission: string; message: string };

/**
 * The management permission checkboxes of one user, used by the Team members modal and the
 * user page.
 *
 * Rows the viewer can't change are disabled and say why. A failed change shows its error under
 * that row, so it stays next to what was clicked however long the list is.
 */
export default function ManagementPermissionList({
  userId,
  permissions,
  canGrantAdminOnlyPermissions,
  onChanged,
  idPrefix,
}: {
  userId: string | number;
  permissions: ManagementPermissionRow[];
  canGrantAdminOnlyPermissions: boolean;
  /** Called after every attempt, successful or not, so the list reloads the real state. */
  onChanged: () => unknown;
  idPrefix: string;
}) {
  const [pendingPermission, setPendingPermission] = useState<string | null>(
    null,
  );
  const [rowError, setRowError] = useState<RowError | null>(null);

  const outsideTeamDomain = permissions.some(row => row.grantable === false);

  const onToggle = (permission: string, nextEnabled: boolean) => {
    setRowError(null);
    setPendingPermission(permission);
    setUserManagementPermission({
      userId: String(userId),
      action: nextEnabled ? 'add' : 'remove',
      permission,
      onSuccess: async () => {
        await onChanged();
        setPendingPermission(null);
      },
      onError: async (e: { message?: string }) => {
        setRowError({
          permission,
          message: e?.message || 'Could not update this permission.',
        });
        await onChanged();
        setPendingPermission(null);
      },
    });
  };

  return (
    <List>
      {outsideTeamDomain && (
        <StatusMessage type={StatusTypes.Warning} visible>
          This person isn't on a team email address, so team-only permissions
          can't be granted to them. Permissions they already have can still be
          removed.
        </StatusMessage>
      )}
      {permissions.map(row => {
        const { locked, label, reason } = permissionCheckboxState(
          row,
          canGrantAdminOnlyPermissions,
        );
        const error =
          rowError?.permission === row.permission ? rowError.message : null;

        return (
          <Row key={row.permission} $locked={locked}>
            <Checkbox
              disabled={locked || pendingPermission !== null}
              aria-disabled={locked || undefined}
              id={`${idPrefix}-${row.codename}`}
              label={label}
              checked={row.enabled}
              onCheckedChange={(val: boolean) => {
                if (!locked && val !== row.enabled) {
                  onToggle(row.permission, val);
                }
              }}
              required={false}
            />
            {reason && <Hint>{reason}</Hint>}
            {error && (
              <StatusMessage type={StatusTypes.Error} visible>
                {error}
              </StatusMessage>
            )}
          </Row>
        );
      })}
    </List>
  );
}
