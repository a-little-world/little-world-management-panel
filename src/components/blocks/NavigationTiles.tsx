import React from 'react';
import { useNavigate } from 'react-router-dom';

export type NavigationTile = {
  name: string;
  path: string;
  icon: React.ReactNode;
};

function NavigationTiles({
  items,
  title,
}: {
  items: NavigationTile[];
  title?: string;
}) {
  const navigate = useNavigate();

  return (
    <div className="flex flex-col justify-center items-center h-screen gap-6">
      {title ? (
        <h1 className="text-slate-800 text-2xl font-bold">{title}</h1>
      ) : null}
      <div className="flex justify-center items-center flex-wrap gap-6">
        {items.map(item => (
          <button
            onClick={() => navigate(item.path)}
            key={item.path}
            className="flex flex-col justify-center items-center bg-indigo-500 p-2 rounded-lg shadow-lg w-40 h-40"
          >
            {item.icon}
            <h2 className="text-white text-xl text-center">{item.name}</h2>
          </button>
        ))}
      </div>
    </div>
  );
}

export default NavigationTiles;
