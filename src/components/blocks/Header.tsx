import {
  Link,
  Logo,
  Text,
  TextTypes,
} from '@a-little-world/little-world-design-system';
import React from 'react';
import styled from 'styled-components';

import Breadcrumbs from '../atoms/Breadcrumbs';
import { HeaderToolbarActions } from './HeaderToolbarActions';
import { useLayoutHeader } from './LayoutHeaderContext';
import Menu from './Menu';

const HeaderContainer = styled.header`
  display: flex;
  align-items: center;
  justify-content: space-between;
  width: 100%;
  max-width: 100%;
  height: 80px;
  padding: ${({ theme }) => theme.spacing.small};
  gap: ${({ theme }) => theme.spacing.xxxsmall};
  background: ${({ theme }) => theme.color.surface.info};
  border-bottom: 2px solid ${({ theme }) => theme.color.border.subtle};
`;

const HeaderTitle = styled(Text)`
  color: ${({ theme }) => theme.color.text.info};
  display: none;

  @media (min-width: ${({ theme }) => theme.breakpoints.medium}) {
    font-size: 2rem;
    display: block;
  }
`;

const TitleGroup = styled.div`
  display: flex;
  align-items: center;
  gap: ${({ theme }) => theme.spacing.small};
  min-width: 0;
`;

const Header = () => {
  const { title, breadcrumbs, actions, showMenu } = useLayoutHeader();

  return (
    <HeaderContainer>
      <TitleGroup>
        <Link to="/" textDecoration={false}>
          <Logo label="Little World" width={48} height={48} />
        </Link>
        {breadcrumbs ? (
          <Breadcrumbs {...breadcrumbs} />
        ) : (
          <HeaderTitle tag="h1" type={TextTypes.Heading4}>
            {title}
          </HeaderTitle>
        )}
      </TitleGroup>
      <HeaderToolbarActions>
        {actions}
        {(showMenu || !actions) && <Menu />}
      </HeaderToolbarActions>
    </HeaderContainer>
  );
};

export default Header;
