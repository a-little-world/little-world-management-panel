import type { MatchingPanelUser, PanelCapability } from '../api/index';
import { useGlobalState } from '../store';

/** One capability, or a list of which any one is enough. */
export type CapabilityRequirement =
  | PanelCapability
  | readonly PanelCapability[];

/** Capabilities that unlock actions on a page but do not open one. */
export type PanelActionCapability =
  | 'edit_users'
  | 'edit_matches'
  | 'export'
  | 'personal_details'
  | 'send_notifications';

/** Capabilities that each open a page of the panel. */
export type PanelPageCapability = Exclude<
  PanelCapability,
  PanelActionCapability
>;

/**
 * The backend decides capabilities; never re-derive them from permissions.
 * Missing key (or no panel user yet) → false.
 */
export function hasPanelCapability(
  user: MatchingPanelUser | undefined,
  requirement: CapabilityRequirement,
): boolean {
  const capabilities = user?.panel_capabilities;
  if (!capabilities) return false;
  const keys: readonly PanelCapability[] =
    typeof requirement === 'string' ? [requirement] : requirement;
  return keys.some(key => capabilities[key] === true);
}

export function usePanelUser(): MatchingPanelUser | undefined {
  const { panelUser } = useGlobalState();
  return panelUser as MatchingPanelUser | undefined;
}

/** Returns a checker bound to the current panel user. */
export function usePanelCapabilities(): (
  requirement: CapabilityRequirement,
) => boolean {
  const user = usePanelUser();
  return (requirement: CapabilityRequirement) =>
    hasPanelCapability(user, requirement);
}

export function usePanelCapability(
  requirement: CapabilityRequirement,
): boolean {
  return hasPanelCapability(usePanelUser(), requirement);
}

/** The Emails page has a tab for each; either opens it. */
export const EMAILS_CAPABILITIES = [
  'dynamic_emails',
  'automated_emails',
] as const satisfies readonly PanelPageCapability[];
