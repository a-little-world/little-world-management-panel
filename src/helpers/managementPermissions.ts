import type { ManagementPermissionRow, MatchingPanelUser } from '../api/index';

export function hasManagementPermission(
  user: MatchingPanelUser | undefined,
  permission: string,
): boolean {
  return (user?.permissions ?? []).some(
    row => row.enabled && row.permission === permission,
  );
}

/**
 * Only admins can grant or revoke these, even with Apply management permissions.
 * Mirrors `STAFF_ONLY_GRANTABLE_PERMISSIONS` in the backend, which enforces it.
 */
export const ADMIN_ONLY_PERMISSIONS: ReadonlySet<string> = new Set([
  'management.apply_management_permissions',
  'management.is_main_support_account',
]);

export type PermissionCheckboxState = {
  /** The checkbox cannot be changed by this viewer. */
  locked: boolean;
  label: string;
};

/**
 * How a permission checkbox is shown to the viewer.
 *
 * - Admin-only permissions are locked for viewers who are not admins.
 * - A team-only permission on an address outside the team domain is locked while unticked, because
 *   the backend refuses to grant it. A ticked one stays editable so it can be removed.
 */
export function permissionCheckboxState(
  row: ManagementPermissionRow,
  canGrantAdminOnlyPermissions: boolean,
): PermissionCheckboxState {
  const label = row.label ?? row.codename;
  if (
    ADMIN_ONLY_PERMISSIONS.has(row.permission) &&
    !canGrantAdminOnlyPermissions
  ) {
    return { locked: true, label: `${label} [ADMIN ONLY]` };
  }
  if (row.grantable === false && !row.enabled) {
    return { locked: true, label: `${label} [TEAM ADDRESSES ONLY]` };
  }
  return { locked: false, label };
}
