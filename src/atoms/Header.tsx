import {
  MenuContentLayout,
  NavigationMenu,
  NavigationMenuContent,
  NavigationMenuContentItem,
  NavigationMenuItem,
  NavigationMenuLink,
  NavigationMenuTrigger,
  Text,
  TextTypes,
} from '@a-little-world/little-world-design-system';
import React from 'react';
import { useLocation } from 'react-router-dom';
import styled from 'styled-components';

import logo from '../assets/logo.svg';

const HeaderTitle = styled(Text)`
  font-size: 1.5rem;
  color: #074367;

  @media (min-width: ${({ theme }) => theme.breakpoints.medium}) {
    font-size: 2rem;
  }
`;

const Header = () => {
  const location = useLocation();

  return (
    <div className="container bg-sky-50 max-w-full flex h-20 justify-between p-4 items-center border-solid border-b-2 border-slate-100">
      <div className="flex gap-4 items-center">
        <img className="h-9 md:h-12" alt="little world logo" src={logo} />
        <HeaderTitle
          className="max-md:text-xl text-xl"
          tag="h1"
          type={TextTypes.Heading4}
        >
          User Management
        </HeaderTitle>
      </div>
      <div className="flex gap-4 items-center justify-center">
        <NavigationMenu withShadow>
          <NavigationMenuItem className="max-sm:hidden">
            <NavigationMenuLink
              className="text-sky-900"
              to={'/users'}
              active={location.pathname === '/users/'}
            >
              Users
            </NavigationMenuLink>
          </NavigationMenuItem>
          <NavigationMenuItem className="max-sm:hidden">
            <NavigationMenuLink
              active
              to={'/matches-list'}
              active={location.pathname === '/users/matches-list'}
            >
              Matches
            </NavigationMenuLink>
          </NavigationMenuItem>
          <NavigationMenuItem>
            <NavigationMenuTrigger>Menu</NavigationMenuTrigger>
            <NavigationMenuContent layout={MenuContentLayout.twoColumns}>
              <NavigationMenuContentItem
                to="/matches"
                active={location.pathname === '/matches/'}
              >
                Matching
              </NavigationMenuContentItem>
              <NavigationMenuContentItem
                to="/users"
                active={location.pathname === '/users/'}
              >
                Users
              </NavigationMenuContentItem>
              <NavigationMenuContentItem
                to="/email"
                active={location.pathname === '/email/'}
              >
                Email
              </NavigationMenuContentItem>
              <NavigationMenuContentItem
                to="/stats"
                active={location.pathname === '/stats/'}
              >
                Stats
              </NavigationMenuContentItem>
              <NavigationMenuContentItem
                to="/scores"
                active={location.pathname === '/scores/'}
              >
                Scores
              </NavigationMenuContentItem>
            </NavigationMenuContent>
          </NavigationMenuItem>
        </NavigationMenu>
      </div>
    </div>
  );
};

export default Header;
