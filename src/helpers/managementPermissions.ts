import type { MatchingPanelUser } from '../api/index';

export function hasManagementPermission(
  user: MatchingPanelUser | undefined,
  permission: string,
): boolean {
  return (user?.permissions ?? []).some(
    row => row.enabled && row.permission === permission,
  );
}
