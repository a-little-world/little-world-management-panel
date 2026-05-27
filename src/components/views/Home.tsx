import {
  Tag,
  TagSizes,
  Text,
  TextTypes,
} from '@a-little-world/little-world-design-system';
import {
  AcademicCapIcon,
  CalendarDaysIcon,
  ChartBarIcon,
  ChatBubbleLeftRightIcon,
  DocumentTextIcon,
  RectangleStackIcon,
  UserGroupIcon,
  VideoCameraIcon,
} from '@heroicons/react/20/solid';
import React from 'react';

import {
  Calculator,
  ClipboardCheckIcon,
  HeadsetIcon,
  HeartHandshake,
} from 'lucide-react';

import type { MatchingPanelUser } from '../../api/index';
import {
  COMMUNICATIONS_ROUTE,
  COURSES_ROUTE,
  DOCUMENTATION_ROUTE,
  DYNAMIC_USER_LISTS_ROUTE,
  MATCHES_LIST_ROUTE,
  MATCHING_USERS_ROUTE,
  PREMATCH_APPOINTMENTS_ROUTE,
  RANDOM_CALLS_ROUTE,
  SCORES_ROUTE,
  STATS_ROUTE,
  SUPPORT_TASKS_ROUTE,
  USERS_ROUTE,
  VIDEO_CALLS_ROUTE,
} from '../../routes';
import { useGlobalState } from '../../store';
import NavigationTiles, { NavigationTile } from '../blocks/NavigationTiles';

const TABS: NavigationTile[] = [
  {
    name: 'Matching',
    path: MATCHES_LIST_ROUTE,
    icon: <HeartHandshake className="h-16 w-16 text-white mb-2" />,
  },
  {
    name: 'Users',
    path: USERS_ROUTE,
    icon: <UserGroupIcon className="h-16 w-16 text-white mb-2" />,
  },
  {
    name: 'Support Tasks',
    path: SUPPORT_TASKS_ROUTE,
    icon: <ClipboardCheckIcon className="h-16 w-16 text-white mb-2" />,
  },
  {
    name: 'Matching users',
    path: MATCHING_USERS_ROUTE,
    icon: <UserGroupIcon className="h-16 w-16 text-white mb-2" />,
  },
  {
    name: 'Communications',
    path: COMMUNICATIONS_ROUTE,
    icon: <ChatBubbleLeftRightIcon className="h-16 w-16 text-white mb-2" />,
  },
  {
    name: 'Stats',
    path: STATS_ROUTE,
    icon: <ChartBarIcon className="h-16 w-16 text-white mb-2" />,
  },
  {
    name: 'Scores',
    path: SCORES_ROUTE,
    icon: <Calculator className="h-16 w-16 text-white mb-2" />,
  },
  {
    name: 'Dynamic User Lists',
    path: DYNAMIC_USER_LISTS_ROUTE,
    icon: <RectangleStackIcon className="h-16 w-16 text-white mb-2" />,
  },
  {
    name: 'Video Calls',
    path: VIDEO_CALLS_ROUTE,
    icon: <VideoCameraIcon className="h-16 w-16 text-white mb-2" />,
  },
  {
    name: 'Onboarding Appointments',
    path: PREMATCH_APPOINTMENTS_ROUTE,
    icon: <CalendarDaysIcon className="h-16 w-16 text-white mb-2" />,
  },
  {
    name: 'Documentation',
    path: DOCUMENTATION_ROUTE,
    icon: <DocumentTextIcon className="h-16 w-16 text-white mb-2" />,
  },
  {
    name: 'Random Calls',
    path: RANDOM_CALLS_ROUTE,
    icon: <HeadsetIcon className="h-16 w-16 text-white mb-2" />,
  },
  {
    name: 'Courses',
    path: COURSES_ROUTE,
    icon: <AcademicCapIcon className="h-16 w-16 text-white mb-2" />,
  },
];

function PanelUserPermissionsOverview({ user }: { user: MatchingPanelUser }) {
  const enabledPermissions = (user.permissions ?? []).filter(
    row => row.enabled,
  );

  if (!enabledPermissions.length && !user.is_staff) {
    return null;
  }

  return (
    <div className="flex flex-col items-center gap-3 w-full max-w-2xl">
      <Text type={TextTypes.Body4} tag="p" center>
        Your permissions
      </Text>
      <div className="flex flex-wrap justify-center gap-2">
        {user.is_staff && (
          <Tag bold size={TagSizes.small} color="#7c3aed">
            Staff
          </Tag>
        )}
        {enabledPermissions.map(row => (
          <Tag key={row.permission} bold size={TagSizes.small} color="#2563eb">
            {row.label ?? row.codename}
          </Tag>
        ))}
      </div>
    </div>
  );
}

const Home = () => {
  const { panelUser } = useGlobalState();
  const user = panelUser as MatchingPanelUser;
  const hasName = Boolean(user?.first_name || user?.last_name);
  const hasPermissions =
    user?.is_staff || (user?.permissions ?? []).some(row => row.enabled);

  return (
    <div className="flex flex-col flex-1 min-h-0 overflow-auto">
      {(hasName || hasPermissions) && (
        <section className="flex flex-col items-center text-center gap-4 px-6 pt-10 pb-4 shrink-0 w-full">
          {hasName && (
            <Text type={TextTypes.Heading4} tag="h1" center>
              Welcome, {user.first_name} {user.last_name}
            </Text>
          )}
          {hasPermissions && <PanelUserPermissionsOverview user={user} />}
        </section>
      )}
      <NavigationTiles items={TABS} />
    </div>
  );
};

export default Home;
