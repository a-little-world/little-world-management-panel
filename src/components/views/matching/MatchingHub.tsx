import React from 'react';

import { MATCHING_HUB_TILES } from '../../../router/panelNavigation';
import NavigationTiles from '../../blocks/NavigationTiles';

function MatchingHub() {
  return <NavigationTiles title="Matching" items={MATCHING_HUB_TILES} />;
}

export default MatchingHub;
