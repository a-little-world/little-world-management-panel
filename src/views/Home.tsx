import {
  ChartBarIcon,
  UserGroupIcon,
  UserIcon,
} from '@heroicons/react/20/solid';
import React from 'react';
import { HeroiconsSolidMail } from '../atoms/HeroiconsSolidMail.tsx';
import { DevkitSelector } from '../panel_v2/AdminPanelDevkit.jsx';

const BACKEND_PATH = '/matching';

/**
 * This should manage routes:
 * users/ <- user listings
 * maches/ <- match listings
 * stats/ <- stats
 */

const Home = () => {
  return (
    <div className="flex justify-center items-center h-screen">
      <a
        href={`${BACKEND_PATH}/users/`}
        className="flex flex-col items-center bg-indigo-500 p-8 rounded-lg shadow-lg m-4 h-64 w-64"
      >
        <UserGroupIcon className="h-16 w-16 text-white mb-2" />
        <h2 className="text-white text-2xl">Users</h2>
      </a>
      <a
        href={`${BACKEND_PATH}/matches/`}
        className="flex flex-col items-center bg-green-500 p-8 rounded-lg shadow-lg m-4 h-64 w-64"
      >
        <UserIcon className="h-16 w-16 text-white mb-2" />
        <h2 className="text-white text-2xl">Matches</h2>
      </a>
      <a
        href={`${BACKEND_PATH}/stats/`}
        className="flex flex-col items-center bg-yellow-500 p-8 rounded-lg shadow-lg m-4 h-64 w-64"
      >
        <ChartBarIcon className="h-16 w-16 text-white mb-2" />
        <h2 className="text-white text-2xl">Stats</h2>
      </a>
      <a
        href={`${BACKEND_PATH}/emails/`}
        className="flex flex-col items-center bg-blue-500 p-8 rounded-lg shadow-lg m-4 h-64 w-64"
      >
        <HeroiconsSolidMail className="h-16 w-16 text-white mb-2" />
        <h2 className="text-white text-2xl">emails</h2>
      </a>
      <DevkitSelector />
    </div>
  );
};

export default Home;
