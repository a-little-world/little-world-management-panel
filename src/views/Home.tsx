import {
  ChartBarIcon,
  UserGroupIcon,
  UserIcon,
} from '@heroicons/react/20/solid';
import React from 'react';
import { HeroiconsSolidMail } from '../atoms/HeroiconsSolidMail.tsx';
import { DevkitSelector } from '../panel_v2/AdminPanelDevkit.jsx';
import { Link, useNavigate, useParams } from 'react-router-dom';

const TABS = [
  {
    name: 'Users',
    path: 'users',
    icon: <UserGroupIcon className="h-16 w-16 text-white mb-2" />
  },
  {
    name: 'Matches',
    path: 'matches',
    icon: <UserIcon className="h-16 w-16 text-white mb-2" />
  },

  {
    name: 'Stats',
    path: 'stats',
    icon: <ChartBarIcon className="h-16 w-16 text-white mb-2" />
  },

  {
    name: 'Emails',
    path: 'emails',
    icon: <HeroiconsSolidMail className="h-16 w-16 text-white mb-2" />
  },
  {
    name: 'Devkit',
    path: 'devkit',
    icon: <HeroiconsSolidMail className="h-16 w-16 text-white mb-2" />
  },
]

const Home = () => {
  const navigate = useNavigate();

  return (
    <div className="flex justify-center items-center h-screen">
      {
        TABS.map(tab => (
          <button
            onClick={() => navigate(tab.path)}
            key={tab.path}
            className="flex flex-col items-center bg-indigo-500 p-8 rounded-lg shadow-lg m-4 h-64 w-64"
          >
            {tab.icon}
            <h2 className="text-white text-2xl">{tab.name}</h2>
          </button>
        ))
      }
    </div>
  );
};

export default Home;
