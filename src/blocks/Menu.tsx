import {
  MenuContentLayout,
  NavigationMenu,
  NavigationMenuContent,
  NavigationMenuContentItem,
  NavigationMenuItem,
  NavigationMenuLink,
  NavigationMenuTrigger,
} from '@a-little-world/little-world-design-system';
import React from 'react';
import { useLocation } from 'react-router-dom';

import {
  EMAILS_ROUTE,
  MATCHES_LIST_ROUTE,
  SCORES_ROUTE,
  STATS_ROUTE,
  USERS_ROUTE,
  VIDEO_CALLS_ROUTE
} from '../routes';

const Menu = () => {
  const location = useLocation();

  return (
    <NavigationMenu withShadow>
      <NavigationMenuItem className="max-sm:hidden">
        <NavigationMenuLink
          className="text-sky-900"
          to={USERS_ROUTE}
          active={location.pathname === USERS_ROUTE}
        >
          Users
        </NavigationMenuLink>
      </NavigationMenuItem>
      <NavigationMenuItem className="max-sm:hidden">
        <NavigationMenuLink
          to={MATCHES_LIST_ROUTE}
          active={location.pathname === MATCHES_LIST_ROUTE}
        >
          Matches
        </NavigationMenuLink>
      </NavigationMenuItem>
      <NavigationMenuItem>
        <NavigationMenuTrigger>Menu</NavigationMenuTrigger>
        <NavigationMenuContent layout={MenuContentLayout.twoColumns}>
          <NavigationMenuContentItem
            to={MATCHES_LIST_ROUTE}
            active={location.pathname === MATCHES_LIST_ROUTE}
          >
            Matching
          </NavigationMenuContentItem>
          <NavigationMenuContentItem
            to={USERS_ROUTE}
            active={location.pathname === USERS_ROUTE}
          >
            Users
          </NavigationMenuContentItem>
          <NavigationMenuContentItem
            to={EMAILS_ROUTE}
            active={location.pathname === EMAILS_ROUTE}
          >
            Emails
          </NavigationMenuContentItem>
          {<NavigationMenuContentItem
            to={STATS_ROUTE}
            active={location.pathname === STATS_ROUTE}
          >
            Stats
          </NavigationMenuContentItem>}
          <NavigationMenuContentItem
            to={SCORES_ROUTE}
            active={location.pathname === SCORES_ROUTE}
          >
            Scores
          </NavigationMenuContentItem>
          <NavigationMenuContentItem
            to={VIDEO_CALLS_ROUTE}
            active={location.pathname === VIDEO_CALLS_ROUTE}
          >
            VideoCalls
          </NavigationMenuContentItem>
        </NavigationMenuContent>
      </NavigationMenuItem>
    </NavigationMenu>
  );
};

export default Menu;
