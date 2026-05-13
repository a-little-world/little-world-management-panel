import { MegaphoneIcon } from '@heroicons/react/20/solid';
import React from 'react';

import { CalendarCog, Link } from 'lucide-react';
import {
  BANNERS_ROUTE,
  EMAILS_ROUTE,
  EVENTS_ROUTE,
  SHORT_LINKS_ROUTE,
} from '../../../routes';
import { HeroiconsSolidMail } from '../../atoms/HeroiconsSolidMail';
import NavigationTiles, { NavigationTile } from '../../blocks/NavigationTiles';

const COMMUNICATIONS_ITEMS: NavigationTile[] = [
  {
    name: 'Banners',
    path: BANNERS_ROUTE,
    icon: <MegaphoneIcon className="h-16 w-16 text-white mb-2" />,
  },
  {
    name: 'Emails',
    path: EMAILS_ROUTE,
    icon: <HeroiconsSolidMail className="h-16 w-16 text-white mb-2" />,
  },
  {
    name: 'Events',
    path: EVENTS_ROUTE,
    icon: <CalendarCog className="h-16 w-16 text-white mb-2" />,
  },
  {
    name: 'Short Links',
    path: SHORT_LINKS_ROUTE,
    icon: <Link className="h-16 w-16 text-white mb-2" />,
  },
];

function Communications() {
  return (
    <NavigationTiles title="Communications" items={COMMUNICATIONS_ITEMS} />
  );
}

export default Communications;
