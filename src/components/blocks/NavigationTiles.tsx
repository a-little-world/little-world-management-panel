import React from 'react';
import { useNavigate } from 'react-router-dom';
import styled from 'styled-components';

import {
  CapabilityRequirement,
  usePanelCapabilities,
} from '../../helpers/panelCapabilities';
import Badge from '../atoms/Badge';

export type NavigationTile = {
  name: string;
  path: string;
  icon: React.ReactNode;
  badge?: number;
  /** Tile is hidden unless the panel user has this capability. */
  capability?: CapabilityRequirement;
};

const TileBadge = styled(Badge)`
  position: absolute;
  top: ${({ theme }) => `-${theme.spacing.small}`};
  right: ${({ theme }) => `-${theme.spacing.small}`};
  width: 40px;
  height: 40px;
`;

function NavigationTiles({
  items,
  title,
}: {
  items: readonly NavigationTile[];
  title?: string;
}) {
  const navigate = useNavigate();
  const can = usePanelCapabilities();
  const visibleItems = items.filter(
    item => !item.capability || can(item.capability),
  );

  return (
    <div className="flex flex-col flex-1 items-center gap-6 py-6 min-h-0">
      {title ? (
        <h1 className="text-slate-800 text-2xl font-bold">{title}</h1>
      ) : null}
      <div className="flex justify-center items-center flex-wrap gap-6">
        {visibleItems.map(item => (
          <button
            onClick={() => navigate(item.path)}
            key={item.path}
            className="relative flex flex-col justify-center items-center bg-indigo-500 p-2 rounded-lg shadow-lg w-40 h-40"
          >
            {item.badge ? <TileBadge>{item.badge}</TileBadge> : null}
            {item.icon}
            <h2 className="text-white text-xl text-center">{item.name}</h2>
          </button>
        ))}
      </div>
    </div>
  );
}

export default NavigationTiles;
