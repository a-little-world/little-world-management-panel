import {
  ChartBarIcon,
  UserGroupIcon,
  UserIcon,
} from '@heroicons/react/20/solid';
import React from 'react';
import { useNavigate } from 'react-router-dom';

import { HeroiconsSolidMail } from '../atoms/HeroiconsSolidMail';

const TABS = [
  {
    name: 'Users',
    path: 'users',
    icon: <UserGroupIcon className="h-16 w-16 text-white mb-2" />,
  },
  {
    name: 'Matches',
    path: 'matches',
    icon: <UserIcon className="h-16 w-16 text-white mb-2" />,
  },
  {
    name: 'Scores',
    path: 'scores',
    icon: <UserIcon className="h-16 w-16 text-white mb-2" />,
  },
  {
    name: 'Stats',
    path: 'stats',
    icon: <ChartBarIcon className="h-16 w-16 text-white mb-2" />,
  },

  {
    name: 'Emails',
    path: 'emails',
    icon: <HeroiconsSolidMail className="h-16 w-16 text-white mb-2" />,
  },
];

const Home = () => {
  const navigate = useNavigate();

  return (
    <div className="flex justify-center items-center h-screen flex-wrap gap-6">
      {TABS.map(tab => (
        <button
          onClick={() => navigate(tab.path)}
          key={tab.path}
          className="flex flex-col justify-center items-center bg-indigo-500 p-2 rounded-lg shadow-lg w-40 h-40"
        >
          {tab.icon}
          <h2 className="text-white text-2xl">{tab.name}</h2>
        </button>
      ))}
    </div>
  );
};

export default Home;
