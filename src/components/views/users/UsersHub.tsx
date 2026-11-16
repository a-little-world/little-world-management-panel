import React from 'react';

import { USERS_HUB_TILES } from '../../../router/panelNavigation';
import NavigationTiles from '../../blocks/NavigationTiles';

function UsersHub() {
  return <NavigationTiles title="Users" items={USERS_HUB_TILES} />;
}

export default UsersHub;
