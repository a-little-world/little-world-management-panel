import React from 'react';
import { Button, ButtonVariations, Text, TextTypes } from '@a-little-world/little-world-design-system'
import logo from '../assets/logo.svg';
import { HomeIcon } from '@heroicons/react/20/solid';
import { useNavigate } from 'react-router-dom';

const Header = () => {
  const navigate = useNavigate()
  return (
  <div className="container max-w-full flex h-20 justify-between p-4 items-center border-solid border-b-2 border-slate-100">
    <img className="h-full" alt="little world logo" src={logo} />
    <Text tag='h1' type={TextTypes.Heading3}>Admin Panel</Text>
    <Button variation={ButtonVariations.Icon} onClick={() => navigate('/')}>
      <HomeIcon width={'32'} />
    </Button>
  </div>
)};

export default Header;
