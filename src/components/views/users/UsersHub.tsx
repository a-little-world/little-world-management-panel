import {
  RectangleStackIcon,
  ShieldCheckIcon,
  UserGroupIcon,
} from '@heroicons/react/20/solid';
import React from 'react';

import {
  DYNAMIC_USER_LISTS_ROUTE,
  MATCHING_USERS_ROUTE,
  USERS_ROUTE,
} from '../../../router/routes';
import NavigationTiles, { NavigationTile } from '../../blocks/NavigationTiles';

const USERS_ITEMS: NavigationTile[] = [
  {
    name: 'Users',
    path: USERS_ROUTE,
    icon: <UserGroupIcon className="h-16 w-16 text-white mb-2" />,
  },
  {
    name: 'Dynamic User Lists',
    path: DYNAMIC_USER_LISTS_ROUTE,
    icon: <RectangleStackIcon className="h-16 w-16 text-white mb-2" />,
  },
  {
    name: 'Matching users',
    path: MATCHING_USERS_ROUTE,
    icon: <ShieldCheckIcon className="h-16 w-16 text-white mb-2" />,
  },
];

function UsersHub() {
  return <NavigationTiles title="Users" items={USERS_ITEMS} />;
}

export default UsersHub;
