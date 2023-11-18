import { useMemo,useEffect, useState } from 'react';
import { UserGroupIcon, UserIcon } from '@heroicons/react/20/solid'

function LandingPage(props) {
  const initData = props.data;
  const [data, setData] = useState(initData);
  return ( data ? <><div className="flex flex-col justify-center items-center h-screen">
      <h1 className='text-7xl'>{data?.title}</h1>
      <a href={`/login/`} className="flex flex-col items-center bg-indigo-500 p-8 rounded-lg shadow-lg m-4 h-64 w-64">
        <UserGroupIcon className="h-16 w-16 text-white mb-2"/>
        <h2 className="text-white text-2xl">Login</h2>
      </a>
    </div></> : <div className="flex justify-center items-center h-screen">loading...</div>)
}


export default LandingPage;
