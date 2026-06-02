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
  const { title, breadcrumbs, actions } = useLayoutHeader();

  return (
    <div className="container bg-sky-50 max-w-full flex h-20 justify-between p-4 items-center border-solid border-b-2 border-slate-100">
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
      <HeaderToolbarActions>{actions ?? <Menu />}</HeaderToolbarActions>
    </div>
  );
};

export default Header;
