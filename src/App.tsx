import React, { useMemo } from 'react';

import { RouterProvider, ScrollRestoration } from 'react-router-dom';
import { createBrowserRouter, Outlet } from 'react-router-dom';
import { AdminPanelV2_Matches } from './panel_v2/AdminPanelMatches.jsx';
import {
  AdminPanelV2_Emails,
  AdminPanelV2_EmailDetails,
} from './panel_v2/AdminPanelEmails.jsx';
import { AdminPanelV2_DevKit } from './panel_v2/AdminPanelDevkit.jsx';
import Home from './views/Home';
import Users from './views/Users';
import { CustomThemeProvider, GlobalStyles } from '@a-little-world/little-world-design-system';
import { GlobalStateProvider } from './store.tsx';
import UserPanel from './blocks/UserPanel.tsx';

export const Root = ({ children, restoreScroll = true }) => (
  <GlobalStateProvider>  
    <CustomThemeProvider>
      {restoreScroll && <ScrollRestoration />}
      <GlobalStyles />
      {children || <Outlet />}
    </CustomThemeProvider>
  </GlobalStateProvider>
);


function AdminPanelV2(props) {
  const router = useMemo(() => {
    return createBrowserRouter(
      [
        {
          path: '/',
          element: <Root />,
          children: [
            {
              path: '',
              element: <Home />,
            },
            {
              path: 'users',
              element: <Users {...props} />,
              children: [
                {path: 'details', element: <UserPanel />}
              ]
            },
            {
              path: 'matches',
              element: <AdminPanelV2_Matches {...props} />,
            },
            {
              path: 'emails',
              element: <AdminPanelV2_Emails {...props} />,
            },
            {
              path: 'devkit',
              element: <AdminPanelV2_DevKit {...props} />,
            },
            {
              path: 'emails/:emailTemplateName',
              element: <AdminPanelV2_EmailDetails {...props} />,
            },
          ],
        },
      ],
      { basename: `/matching/` },
    );
  }, []);

  return <RouterProvider router={router} />;
}

export default AdminPanelV2;
