import React from 'react';
import Header from '../atoms/Header';

const Layout = ({ children }) => {
   return (
    <div className='h-[calc(100dvh)] h-screen overflow-hidden font-medium flex flex-col'>
        <Header />
        {children}
    </div>
    )
}

export default Layout;