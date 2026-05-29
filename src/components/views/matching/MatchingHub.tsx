import { CalendarDaysIcon } from '@heroicons/react/20/solid';
import { Calculator, HeartHandshake } from 'lucide-react';
import React from 'react';

import {
  MATCHES_LIST_ROUTE,
  PREMATCH_APPOINTMENTS_ROUTE,
  SCORES_ROUTE,
} from '../../../router/routes';
import NavigationTiles, { NavigationTile } from '../../blocks/NavigationTiles';

const MATCHING_ITEMS: NavigationTile[] = [
  {
    name: 'Matches',
    path: MATCHES_LIST_ROUTE,
    icon: <HeartHandshake className="h-16 w-16 text-white mb-2" />,
  },
  {
    name: 'Scores',
    path: SCORES_ROUTE,
    icon: <Calculator className="h-16 w-16 text-white mb-2" />,
  },
  {
    name: 'Onboarding Appointments',
    path: PREMATCH_APPOINTMENTS_ROUTE,
    icon: <CalendarDaysIcon className="h-16 w-16 text-white mb-2" />,
  },
];

function MatchingHub() {
  return <NavigationTiles title="Matching" items={MATCHING_ITEMS} />;
}

export default MatchingHub;
