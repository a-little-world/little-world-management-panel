import {
  MenuContentLayout,
  NavigationMenu,
  NavigationMenuContent,
  NavigationMenuContentItem,
  NavigationMenuItem,
  NavigationMenuTrigger,
} from '@a-little-world/little-world-design-system';
import React from 'react';
import { useLocation, useNavigate, useSearchParams } from 'react-router-dom';
import styled from 'styled-components';
import useSWR from 'swr';

import type { MatchingPanelUser } from '../../api/index';
import {
  fetchOpenAssignedTaskCount,
  openAssignedTaskCountEndpoint,
} from '../../api/supportTasks';
import { MANAGEMENT_PERMISSION_OPEN_CHAT_ACCESS } from '../../constants/managementPermissions';
import { hasManagementPermission } from '../../helpers/managementPermissions';
import useSelectUser from '../../hooks/useSelectUser';
import {
  BANNERS_ROUTE,
  COMMUNICATIONS_ROUTE,
  COMPANIES_ROUTE,
  COURSES_ROUTE,
  DOCUMENTATION_ROUTE,
  DYNAMIC_USER_LISTS_ROUTE,
  JOURNEY_OVERVIEW_ROUTE,
  MATCHES_LIST_ROUTE,
  MATCHING_HUB_ROUTE,
  MATCHING_USERS_ROUTE,
  OPEN_CHAT_ROUTE,
  PREMATCH_APPOINTMENTS_ROUTE,
  QUESTION_CARDS_ROUTE,
  RANDOM_CALLS_ROUTE,
  SCORES_ROUTE,
  STATS_ROUTE,
  SUPPORT_TASKS_ROUTE,
  USERS_HUB_ROUTE,
  USERS_ROUTE,
  VIDEO_CALLS_ROUTE,
} from '../../router/routes';
import { useCurrentUserId, useGlobalState } from '../../store';
import Badge from '../atoms/Badge';
import SearchBar from './SearchBar';

const NavItemLabel = styled.span`
  display: inline-flex;
  align-items: center;
  gap: ${({ theme }) => theme.spacing.xxsmall};
`;

const Menu = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { selectExactUser } = useSelectUser();
  const { panelUser } = useGlobalState();
  const hasOpenChatAccess = hasManagementPermission(
    panelUser as MatchingPanelUser | undefined,
    MANAGEMENT_PERMISSION_OPEN_CHAT_ACCESS,
  );

  const currentUserId = useCurrentUserId();
  const { data: myOpenTasks } = useSWR(
    currentUserId ? openAssignedTaskCountEndpoint() : null,
    fetchOpenAssignedTaskCount,
  );

  const onUserSearch = ({ search }: { search: string }) => {
    const params =
      location.pathname === USERS_ROUTE
        ? new URLSearchParams(searchParams)
        : new URLSearchParams({
            order_by: '-date_joined',
            page_size: '50',
          });

    params.delete('page');

    if (!search) {
      params.delete('search');
    } else {
      params.set('search', search);
    }

    if (search) {
      void selectExactUser(search);
    }

    navigate({ pathname: USERS_ROUTE, search: params.toString() });
  };

  const isCommunicationsRoute =
    location.pathname === COMMUNICATIONS_ROUTE ||
    location.pathname.startsWith('/emails/') ||
    location.pathname.startsWith('/email/') ||
    location.pathname.startsWith('/send-dynamic-email/') ||
    location.pathname.startsWith(BANNERS_ROUTE) ||
    location.pathname.startsWith('/events/') ||
    location.pathname.startsWith('/short-links/') ||
    location.pathname.startsWith(QUESTION_CARDS_ROUTE);

  const isMatchingRoute =
    location.pathname === MATCHING_HUB_ROUTE ||
    location.pathname === MATCHES_LIST_ROUTE ||
    location.pathname.startsWith('/match/') ||
    location.pathname === SCORES_ROUTE ||
    location.pathname === PREMATCH_APPOINTMENTS_ROUTE ||
    location.pathname === VIDEO_CALLS_ROUTE;

  const isUsersRoute =
    location.pathname === USERS_HUB_ROUTE ||
    location.pathname === USERS_ROUTE ||
    location.pathname === MATCHING_USERS_ROUTE ||
    location.pathname === DYNAMIC_USER_LISTS_ROUTE ||
    location.pathname.startsWith('/user/');

  const isDocumentationRoute =
    location.pathname === DOCUMENTATION_ROUTE ||
    location.pathname.startsWith('/documentation/') ||
    location.pathname === JOURNEY_OVERVIEW_ROUTE;

  return (
    <NavigationMenu withShadow>
      <SearchBar
        name="search"
        hideSubmitBtn
        isSubmitting={false}
        onSubmit={onUserSearch}
        error={null}
        placeholder="Search by name or email"
        defaultValue={
          location.pathname === USERS_ROUTE
            ? (searchParams.get('search') ?? undefined)
            : undefined
        }
      />
      <NavigationMenuItem>
        <NavigationMenuTrigger>Menu</NavigationMenuTrigger>
        <NavigationMenuContent layout={MenuContentLayout.callout}>
          <NavigationMenuContentItem
            to={SUPPORT_TASKS_ROUTE}
            active={location.pathname.startsWith(SUPPORT_TASKS_ROUTE)}
          >
            <NavItemLabel>
              Support Tasks
              {myOpenTasks?.count ? <Badge>{myOpenTasks.count}</Badge> : null}
            </NavItemLabel>
          </NavigationMenuContentItem>
          <NavigationMenuContentItem
            to={MATCHING_HUB_ROUTE}
            active={isMatchingRoute}
          >
            Matching
          </NavigationMenuContentItem>
          <NavigationMenuContentItem
            to={USERS_HUB_ROUTE}
            active={isUsersRoute}
          >
            Users
          </NavigationMenuContentItem>
          <NavigationMenuContentItem
            to={COMMUNICATIONS_ROUTE}
            active={isCommunicationsRoute}
          >
            Communications
          </NavigationMenuContentItem>
          <NavigationMenuContentItem
            to={STATS_ROUTE}
            active={location.pathname === STATS_ROUTE}
          >
            Stats
          </NavigationMenuContentItem>
          <NavigationMenuContentItem
            to={DOCUMENTATION_ROUTE}
            active={isDocumentationRoute}
          >
            Documentation
          </NavigationMenuContentItem>
          <NavigationMenuContentItem
            to={RANDOM_CALLS_ROUTE}
            active={location.pathname === RANDOM_CALLS_ROUTE}
          >
            Random Calls
          </NavigationMenuContentItem>
          {hasOpenChatAccess && (
            <NavigationMenuContentItem
              to={OPEN_CHAT_ROUTE}
              active={location.pathname.startsWith(OPEN_CHAT_ROUTE)}
            >
              Open Chat
            </NavigationMenuContentItem>
          )}
          <NavigationMenuContentItem
            to={COURSES_ROUTE}
            active={location.pathname === COURSES_ROUTE}
          >
            Courses
          </NavigationMenuContentItem>
          <NavigationMenuContentItem
            to={COMPANIES_ROUTE}
            active={location.pathname.startsWith(COMPANIES_ROUTE)}
          >
            Companies
          </NavigationMenuContentItem>
        </NavigationMenuContent>
      </NavigationMenuItem>
    </NavigationMenu>
  );
};

export default Menu;
