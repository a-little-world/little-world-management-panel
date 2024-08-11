import {
  MenuContentLayout,
  NavigationMenu,
  NavigationMenuContent,
  NavigationMenuContentItem,
  NavigationMenuItem,
  NavigationMenuTrigger,
} from '@a-little-world/little-world-design-system';
import React from 'react';
import { useLocation } from 'react-router-dom';

import useSelectUser from '../hooks/useSelectUser';
import {
  EMAILS_ROUTE,
  MATCHES_LIST_ROUTE,
  PREMATCH_APPOINTMENTS_ROUTE,
  SCORES_ROUTE,
  STATS_ROUTE,
  USERS_ROUTE,
  VIDEO_CALLS_ROUTE,
} from '../routes';
import SearchBar from './SearchBar';

const Menu = () => {
  const location = useLocation();
  const { isSubmitting, onSelectUser, error } = useSelectUser({});
  return (
    <NavigationMenu withShadow>
      <SearchBar
        name="userHash"
        hideSubmitBtn
        isSubmitting={isSubmitting}
        onSubmit={onSelectUser}
        error={error}
        placeholder="Enter user hash"
      />
      <NavigationMenuItem>
        <NavigationMenuTrigger>Menu</NavigationMenuTrigger>
        <NavigationMenuContent layout={MenuContentLayout.callout}>
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
          <NavigationMenuContentItem
            to={'/old-emails'}
            active={location.pathname === '/old-emails'}
          >
            Old Emails
          </NavigationMenuContentItem>
          {
            <NavigationMenuContentItem
              to={STATS_ROUTE}
              active={location.pathname === STATS_ROUTE}
            >
              Stats
            </NavigationMenuContentItem>
          }
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
          <NavigationMenuContentItem
            to={PREMATCH_APPOINTMENTS_ROUTE}
            active={location.pathname === PREMATCH_APPOINTMENTS_ROUTE}
          >
            PreMatchingAppointment
          </NavigationMenuContentItem>
        </NavigationMenuContent>
      </NavigationMenuItem>
    </NavigationMenu>
  );
};

export default Menu;
