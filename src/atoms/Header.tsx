import React from 'react';
import { Button, ButtonVariations, Text, TextTypes } from '@a-little-world/little-world-design-system'
import logo from '../assets/logo.svg';
import { HomeIcon } from '@heroicons/react/20/solid';
import { Link, useNavigate, useParams } from 'react-router-dom';

const Header = () => {
  const navigate = useNavigate();
  const { userId } = useParams();
  
  return (
  <div className="container max-w-full flex h-20 justify-between p-4 items-center border-solid border-b-2 border-slate-100">
    <img className="h-full" alt="little world logo" src={logo} />
    <Text tag='h1' type={TextTypes.Heading3}>Admin Panel</Text>
    <div className='flex gap-4 items-center justify-center'>
      {userId && <Link className='bold' to='/users/'>Users</Link>}
      <Button variation={ButtonVariations.Icon} onClick={() => navigate('/')}>
        <HomeIcon width={'32'} />
      </Button>
    </div>
    
  </div>
)};

export default Header;
