import React from 'react';

import { COMMUNICATIONS_HUB_TILES } from '../../../router/panelNavigation';
import NavigationTiles from '../../blocks/NavigationTiles';

function Communications() {
  return (
    <NavigationTiles title="Communications" items={COMMUNICATIONS_HUB_TILES} />
  );
}

export default Communications;
