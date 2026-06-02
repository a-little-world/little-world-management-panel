import React from 'react';
import styled from 'styled-components';

import Header from './Header.tsx';
import { LayoutHeaderProvider } from './LayoutHeaderContext';

const LayoutShell = styled.div`
  height: calc(100dvh);
  height: 100vh;
  overflow: hidden;
  display: flex;
  flex-direction: column;
`;

const Main = styled.main`
  order: 2;
  flex: 1;
  min-height: 0;
`;

const HeaderSlot = styled.div`
  order: 1;
  flex-shrink: 0;
`;

const Layout = ({ children }) => {
  return (
    <LayoutHeaderProvider>
      <LayoutShell className="font-medium">
        <Main>{children}</Main>
        <HeaderSlot>
          <Header />
        </HeaderSlot>
      </LayoutShell>
    </LayoutHeaderProvider>
  );
};

export default Layout;
