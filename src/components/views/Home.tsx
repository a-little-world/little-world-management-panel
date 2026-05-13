import {
  CalendarDaysIcon,
  ChartBarIcon,
  ChatBubbleLeftRightIcon,
  DocumentTextIcon,
  RectangleStackIcon,
  UserGroupIcon,
  VideoCameraIcon,
} from '@heroicons/react/20/solid';
import React from 'react';

import { Calculator, HeadsetIcon, HeartHandshake } from 'lucide-react';
import {
  COMMUNICATIONS_ROUTE,
  DOCUMENTATION_ROUTE,
  DYNAMIC_USER_LISTS_ROUTE,
  MATCHES_LIST_ROUTE,
  PREMATCH_APPOINTMENTS_ROUTE,
  RANDOM_CALLS_ROUTE,
  SCORES_ROUTE,
  STATS_ROUTE,
  USERS_ROUTE,
  VIDEO_CALLS_ROUTE,
} from '../../routes';
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
];

const Home = () => {
  return <NavigationTiles items={TABS} />;
};

export default Home;
