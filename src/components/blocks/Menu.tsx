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

import {
  fetchOpenAssignedTaskCount,
  openAssignedTaskCountEndpoint,
} from '../../api/supportTasks';
import { usePanelCapability } from '../../helpers/panelCapabilities';
import useSelectUser from '../../hooks/useSelectUser';
import { useVisiblePanelNavigation } from '../../router/panelNavigation';
import { SUPPORT_TASKS_ROUTE, USERS_ROUTE } from '../../router/routes';
import { useCurrentUserId } from '../../store';
import Badge from '../atoms/Badge';
import SearchBar from './SearchBar';

// The design system's menu popup is exactly as wide as the menu bar. Without the user search the bar
// is only the trigger, which cuts the entries off, so the bar gets a minimum width with the trigger
// kept at its right edge; the popup then opens leftwards at that width.
const MENU_MIN_WIDTH = '240px';

const MenuContainer = styled.div`
  & > nav {
    min-width: ${MENU_MIN_WIDTH};
    justify-content: flex-end;
  }
`;

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
  const navigation = useVisiblePanelNavigation();
  const canSeeSupportTasks = usePanelCapability('support_tasks');
  const canSearchUsers = usePanelCapability('users');

  const currentUserId = useCurrentUserId();
  const { data: myOpenTasks } = useSWR(
    currentUserId && canSeeSupportTasks
      ? openAssignedTaskCountEndpoint()
      : null,
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

  return (
    <MenuContainer>
      <NavigationMenu withShadow>
        {canSearchUsers && (
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
        )}
        {navigation.length > 0 && (
          <NavigationMenuItem>
            <NavigationMenuTrigger>Menu</NavigationMenuTrigger>
            <NavigationMenuContent layout={MenuContentLayout.callout}>
              {navigation.map(entry => (
                <NavigationMenuContentItem
                  key={entry.path}
                  to={entry.path}
                  active={entry.isActive(location.pathname)}
                >
                  {entry.path === SUPPORT_TASKS_ROUTE && myOpenTasks?.count ? (
                    <NavItemLabel>
                      {entry.name}
                      <Badge>{myOpenTasks.count}</Badge>
                    </NavItemLabel>
                  ) : (
                    entry.name
                  )}
                </NavigationMenuContentItem>
              ))}
            </NavigationMenuContent>
          </NavigationMenuItem>
        )}
      </NavigationMenu>
    </MenuContainer>
  );
};

export default Menu;
