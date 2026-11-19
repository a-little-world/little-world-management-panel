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
  | 'personal_details';

/** Capabilities that each open a page of the panel. */
export type PanelPageCapability = Exclude<
  PanelCapability,
  PanelActionCapability
>;

/**
 * Whether the backend sent `panel_capabilities` at all. Older backends do
 * not, and then the panel shows everything, as it did before.
 */
export function hasPanelCapabilities(
  user: MatchingPanelUser | undefined,
): boolean {
  return Boolean(user?.panel_capabilities);
}

/**
 * The backend decides capabilities; never re-derive them from permissions.
 * Missing key → false. Missing `panel_capabilities` → true (old backend).
 */
export function hasPanelCapability(
  user: MatchingPanelUser | undefined,
  requirement: CapabilityRequirement,
): boolean {
  const capabilities = user?.panel_capabilities;
  if (!capabilities) return true;
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
