import {
  AcademicCapIcon,
  BuildingOffice2Icon,
  CalendarDaysIcon,
  ChartBarIcon,
  ChatBubbleLeftRightIcon,
  DocumentTextIcon,
  RectangleStackIcon,
  ShieldCheckIcon,
  UserGroupIcon,
  VideoCameraIcon,
} from '@heroicons/react/20/solid';
import React from 'react';

import {
  Calculator,
  CalendarCog,
  ClipboardCheckIcon,
  ClipboardList,
  HeadsetIcon,
  HeartHandshake,
  Link as LinkIcon,
  Mail,
  Megaphone,
  MessagesSquare,
} from 'lucide-react';

import type { MatchingPanelUser } from '../api/index';
import { MANAGEMENT_PERMISSION_OPEN_CHAT_ACCESS } from '../constants/managementPermissions';
import { hasManagementPermission } from '../helpers/managementPermissions';
import {
  EMAILS_CAPABILITIES,
  type PanelPageCapability,
  hasPanelCapabilities,
  hasPanelCapability,
  usePanelUser,
} from '../helpers/panelCapabilities';
import {
  BANNERS_ROUTE,
  COMMUNICATIONS_ROUTE,
  COMPANIES_ROUTE,
  COURSES_ROUTE,
  DOCUMENTATION_ROUTE,
  DYNAMIC_USER_LISTS_ROUTE,
  EMAILS_ROUTE,
  EVENTS_ROUTE,
  JOURNEY_OVERVIEW_ROUTE,
  MATCHES_LIST_ROUTE,
  MATCHING_HUB_ROUTE,
  MATCHING_USERS_ROUTE,
  OPEN_CHAT_ROUTE,
  PREMATCH_APPOINTMENTS_ROUTE,
  QUESTION_CARDS_ROUTE,
  RANDOM_CALLS_ROUTE,
  SCORES_ROUTE,
  SHORT_LINKS_ROUTE,
  STATS_ROUTE,
  SUPPORT_TASKS_ROUTE,
  SURVEYS_ROUTE,
  USERS_HUB_ROUTE,
  USERS_ROUTE,
  VIDEO_CALLS_ROUTE,
} from './routes';

const tileIconClass = 'h-16 w-16 text-white mb-2';

type PageRequirement = PanelPageCapability | readonly PanelPageCapability[];

/** The page capabilities a list of tiles or entries leads to, as a union type. */
type CapabilitiesOf<T extends readonly { capability: PageRequirement }[]> =
  | Extract<T[number]['capability'], string>
  | Extract<T[number]['capability'], readonly unknown[]>[number];

/** A tile on a hub page (Matching, Users, Communications). */
export type HubTile = {
  name: string;
  path: string;
  /** Shown when the panel user has this capability (or, for a list, any of them). */
  capability: PageRequirement;
  icon: React.ReactNode;
};

/** A hub opens, and shows in Home and the Menu, when any of its tiles would show. */
function capabilitiesOf<T extends readonly HubTile[]>(
  tiles: T,
): readonly CapabilitiesOf<T>[] {
  return tiles.flatMap(tile =>
    typeof tile.capability === 'string' ? [tile.capability] : tile.capability,
  ) as CapabilitiesOf<T>[];
}

export const MATCHING_HUB_TILES = [
  {
    name: 'Matches',
    path: MATCHES_LIST_ROUTE,
    capability: 'matches',
    icon: <HeartHandshake className={tileIconClass} />,
  },
  {
    name: 'Scores',
    path: SCORES_ROUTE,
    capability: 'scores',
    icon: <Calculator className={tileIconClass} />,
  },
  {
    name: 'Onboarding Appointments',
    path: PREMATCH_APPOINTMENTS_ROUTE,
    capability: 'appointments',
    icon: <CalendarDaysIcon className={tileIconClass} />,
  },
  {
    name: 'Video Calls',
    path: VIDEO_CALLS_ROUTE,
    capability: 'video_calls',
    icon: <VideoCameraIcon className={tileIconClass} />,
  },
] as const satisfies readonly HubTile[];

export const USERS_HUB_TILES = [
  {
    name: 'Users',
    path: USERS_ROUTE,
    capability: 'users',
    icon: <UserGroupIcon className={tileIconClass} />,
  },
  {
    name: 'Dynamic User Lists',
    path: DYNAMIC_USER_LISTS_ROUTE,
    capability: 'dynamic_user_lists',
    icon: <RectangleStackIcon className={tileIconClass} />,
  },
  {
    name: 'Team members',
    path: MATCHING_USERS_ROUTE,
    capability: 'team_members',
    icon: <ShieldCheckIcon className={tileIconClass} />,
  },
] as const satisfies readonly HubTile[];

export const COMMUNICATIONS_HUB_TILES = [
  {
    name: 'Banners',
    path: BANNERS_ROUTE,
    capability: 'banners',
    icon: <Megaphone className={tileIconClass} />,
  },
  {
    name: 'Emails',
    path: EMAILS_ROUTE,
    capability: EMAILS_CAPABILITIES,
    icon: <Mail className={tileIconClass} />,
  },
  {
    name: 'Events',
    path: EVENTS_ROUTE,
    capability: 'events',
    icon: <CalendarCog className={tileIconClass} />,
  },
  {
    name: 'Short Links',
    path: SHORT_LINKS_ROUTE,
    capability: 'short_links',
    icon: <LinkIcon className={tileIconClass} />,
  },
  {
    name: 'Question Cards',
    path: QUESTION_CARDS_ROUTE,
    capability: 'question_cards',
    icon: <MessagesSquare className={tileIconClass} />,
  },
  {
    name: 'Surveys',
    path: SURVEYS_ROUTE,
    capability: 'surveys',
    icon: <ClipboardList className={tileIconClass} />,
  },
] as const satisfies readonly HubTile[];

export const MATCHING_HUB_CAPABILITIES = capabilitiesOf(MATCHING_HUB_TILES);
export const USERS_HUB_CAPABILITIES = capabilitiesOf(USERS_HUB_TILES);
export const COMMUNICATIONS_HUB_CAPABILITIES = capabilitiesOf(
  COMMUNICATIONS_HUB_TILES,
);

/**
 * The panel's top-level destinations, in display order. The Home tiles and the Menu are both
 * rendered from this list, so a page added here appears in both places.
 */
export const PANEL_NAVIGATION = [
  {
    name: 'Matching',
    path: MATCHING_HUB_ROUTE,
    capability: MATCHING_HUB_CAPABILITIES,
    icon: <HeartHandshake className={tileIconClass} />,
    isActive: (pathname: string) =>
      pathname === MATCHING_HUB_ROUTE ||
      pathname === MATCHES_LIST_ROUTE ||
      pathname.startsWith('/match/') ||
      pathname === SCORES_ROUTE ||
      pathname === PREMATCH_APPOINTMENTS_ROUTE ||
      pathname === VIDEO_CALLS_ROUTE,
  },
  {
    name: 'Users',
    path: USERS_HUB_ROUTE,
    capability: USERS_HUB_CAPABILITIES,
    icon: <UserGroupIcon className={tileIconClass} />,
    isActive: (pathname: string) =>
      pathname === USERS_HUB_ROUTE ||
      pathname === USERS_ROUTE ||
      pathname === MATCHING_USERS_ROUTE ||
      pathname === DYNAMIC_USER_LISTS_ROUTE ||
      pathname.startsWith('/user/'),
  },
  {
    name: 'Support Tasks',
    path: SUPPORT_TASKS_ROUTE,
    capability: 'support_tasks',
    icon: <ClipboardCheckIcon className={tileIconClass} />,
    isActive: (pathname: string) => pathname.startsWith(SUPPORT_TASKS_ROUTE),
  },
  {
    name: 'Communications',
    path: COMMUNICATIONS_ROUTE,
    capability: COMMUNICATIONS_HUB_CAPABILITIES,
    icon: <ChatBubbleLeftRightIcon className={tileIconClass} />,
    isActive: (pathname: string) =>
      pathname === COMMUNICATIONS_ROUTE ||
      pathname.startsWith('/emails/') ||
      pathname.startsWith('/email/') ||
      pathname.startsWith('/send-dynamic-email/') ||
      pathname.startsWith(BANNERS_ROUTE) ||
      pathname.startsWith('/events/') ||
      pathname.startsWith('/short-links/') ||
      pathname.startsWith(QUESTION_CARDS_ROUTE) ||
      pathname.startsWith(SURVEYS_ROUTE),
  },
  {
    name: 'Stats',
    path: STATS_ROUTE,
    capability: 'statistics',
    icon: <ChartBarIcon className={tileIconClass} />,
    isActive: (pathname: string) => pathname === STATS_ROUTE,
  },
  {
    name: 'Documentation',
    path: DOCUMENTATION_ROUTE,
    capability: 'documentation',
    icon: <DocumentTextIcon className={tileIconClass} />,
    isActive: (pathname: string) =>
      pathname === DOCUMENTATION_ROUTE ||
      pathname.startsWith('/documentation/') ||
      pathname === JOURNEY_OVERVIEW_ROUTE,
  },
  {
    name: 'Random Calls',
    path: RANDOM_CALLS_ROUTE,
    capability: 'random_calls',
    icon: <HeadsetIcon className={tileIconClass} />,
    isActive: (pathname: string) => pathname === RANDOM_CALLS_ROUTE,
  },
  {
    name: 'Courses',
    path: COURSES_ROUTE,
    capability: 'courses',
    icon: <AcademicCapIcon className={tileIconClass} />,
    isActive: (pathname: string) => pathname === COURSES_ROUTE,
  },
  {
    name: 'Open Chat',
    path: OPEN_CHAT_ROUTE,
    capability: 'open_chat',
    icon: <ChatBubbleLeftRightIcon className={tileIconClass} />,
    isActive: (pathname: string) => pathname.startsWith(OPEN_CHAT_ROUTE),
    legacyPermission: MANAGEMENT_PERMISSION_OPEN_CHAT_ACCESS,
  },
  {
    name: 'Companies',
    path: COMPANIES_ROUTE,
    capability: 'companies',
    icon: <BuildingOffice2Icon className={tileIconClass} />,
    isActive: (pathname: string) => pathname.startsWith(COMPANIES_ROUTE),
  },
] as const satisfies readonly PanelNavigationEntry[];

export type PanelNavigationEntry = {
  name: string;
  path: string;
  /** Shown when the panel user has this capability (or, for a list, any of them). */
  capability: PageRequirement;
  icon: React.ReactNode;
  /** Whether the Menu highlights this entry on the current page. */
  isActive: (pathname: string) => boolean;
  /** Checked instead of the capability when an older backend sends no capabilities. */
  legacyPermission?: string;
};

// Every page must be reachable from Home and the Menu, directly or through a hub's tiles. A page
// that is in neither fails the type-check here, naming it.
type ReachablePage = CapabilitiesOf<typeof PANEL_NAVIGATION>;
type UnreachablePage = Exclude<PanelPageCapability, ReachablePage>;
const everyPageIsReachable: [UnreachablePage] extends [never]
  ? true
  : UnreachablePage = true;
void everyPageIsReachable;

export function canSeeNavigationEntry(
  user: MatchingPanelUser | undefined,
  entry: PanelNavigationEntry,
): boolean {
  if (!hasPanelCapabilities(user) && entry.legacyPermission) {
    return hasManagementPermission(user, entry.legacyPermission);
  }
  return hasPanelCapability(user, entry.capability);
}

/** The entries the current panel user can open, in display order. */
export function useVisiblePanelNavigation(): PanelNavigationEntry[] {
  const user = usePanelUser();
  return PANEL_NAVIGATION.filter(entry => canSeeNavigationEntry(user, entry));
}
