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
      <div className="flex gap-4 items-center">
        <img className="h-12" alt="little world logo" src={logo} />
        <Text tag="h1" type={TextTypes.Heading4}>
          User Management
        </Text>
      </div>
      <div className="flex gap-4 items-center justify-center">
        <NavigationMenu>
          <NavigationMenuItem>
            <NavigationMenuLink to={'/matching/users'}>
              Users
            </NavigationMenuLink>
          </NavigationMenuItem>
          <NavigationMenuItem>
            <NavigationMenuLink to={'/matching/matches-list'}>
              Matches
            </NavigationMenuLink>
          </NavigationMenuItem>
          <NavigationMenuItem>
            <NavigationMenuTrigger>Areas</NavigationMenuTrigger>
            <NavigationMenuContent layout={MenuContentLayout.twoColumns}>
              <NavigationMenuContentItem to="/matching/matches">
                Matching
              </NavigationMenuContentItem>
              <NavigationMenuContentItem active to="/matching/matches">
                Users
              </NavigationMenuContentItem>
              <NavigationMenuContentItem to="/matching/matches">
                Email
              </NavigationMenuContentItem>
              <NavigationMenuContentItem to="/matching/matches">
                Stats
              </NavigationMenuContentItem>
            </NavigationMenuContent>
          </NavigationMenuItem>
        </NavigationMenu>
      </div>
    </div>
  );
};

export default Header;
