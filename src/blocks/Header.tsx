import { Text, TextTypes } from '@a-little-world/little-world-design-system';
import React from 'react';
import styled from 'styled-components';

import logo from '../assets/logo.svg';
import Menu from './Menu';

const HeaderTitle = styled(Text)`
  font-size: 1.5rem;
  color: #074367;

  @media (min-width: ${({ theme }) => theme.breakpoints.medium}) {
    font-size: 2rem;
  }
`;

const Header = () => {
  return (
    <div className="container bg-sky-50 max-w-full flex h-20 justify-between p-4 items-center border-solid border-b-2 border-slate-100">
      <div className="flex gap-4 items-center">
        <img className="h-9 md:h-12" alt="little world logo" src={logo} />
        <HeaderTitle
          className="max-md:text-xl text-xl"
          tag="h1"
          type={TextTypes.Heading4}
        >
          User Management
        </HeaderTitle>
      </div>
      <div className="flex gap-4 items-center justify-center">
        <Menu />
      </div>
    </div>
  );
};

export default Header;
