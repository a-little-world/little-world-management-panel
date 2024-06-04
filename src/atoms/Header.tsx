import {
  Button,
  ButtonVariations,
  MenuContentLayout,
  MenuIcon,
  NavigationMenu,
  NavigationMenuContent,
  NavigationMenuContentItem,
  NavigationMenuItem,
  NavigationMenuLink,
  NavigationMenuTrigger,
  Text,
  TextTypes,
} from '@a-little-world/little-world-design-system';
import { HomeIcon } from '@heroicons/react/20/solid';
import React from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';

import logo from '../assets/logo.svg';

const Header = () => {
  const navigate = useNavigate();
  const { userId } = useParams();

  return (
    <div className="container max-w-full flex h-20 justify-between p-4 items-center border-solid border-b-2 border-slate-100">
      <img className="h-full" alt="little world logo" src={logo} />
      <Text tag="h1" type={TextTypes.Heading3}>
        Admin Panel
      </Text>
      <div className="flex gap-4 items-center justify-center">
        <NavigationMenu>
          <NavigationMenuItem>
            <NavigationMenuLink href={'/matching/users'}>
              Users
            </NavigationMenuLink>
          </NavigationMenuItem>
          <NavigationMenuItem>
            <NavigationMenuLink href={'/matching/matches-list'}>
              Matches
            </NavigationMenuLink>
          </NavigationMenuItem>
          <NavigationMenuItem>
            <NavigationMenuTrigger>Areas</NavigationMenuTrigger>
            <NavigationMenuContent layout={MenuContentLayout.twoColumns}>
              <NavigationMenuContentItem>Matching</NavigationMenuContentItem>
              <NavigationMenuContentItem active>
                Users
              </NavigationMenuContentItem>
              <NavigationMenuContentItem>Email</NavigationMenuContentItem>
              <NavigationMenuContentItem>Stats</NavigationMenuContentItem>
            </NavigationMenuContent>
          </NavigationMenuItem>
        </NavigationMenu>
      </div>
    </div>
  );
};

export default Header;
