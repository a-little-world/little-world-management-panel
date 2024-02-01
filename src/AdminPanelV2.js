import { useMemo,useEffect, useState } from 'react';
import { ThemeProvider } from 'styled-components';
import theme from './theme';
import { AdminPanel } from './panel_v2/AdminPanel';
import useSWR from 'swr'
import { RouterProvider } from "react-router-dom";
import { createBrowserRouter, Outlet } from "react-router-dom";
import { UserGroupIcon, ChartBarIcon, UserIcon } from '@heroicons/react/20/solid'


/**
 * This should manage routes:
 * users/ <- user listings
 * maches/ <- match listings
 * stats/ <- stats
 */

const BACKEND_PATH = '/matching'


function Root() {
  return (
    <div className="flex justify-center items-center h-screen">
      <a href={`${BACKEND_PATH}/users/`} className="flex flex-col items-center bg-indigo-500 p-8 rounded-lg shadow-lg m-4 h-64 w-64">
        <UserGroupIcon className="h-16 w-16 text-white mb-2"/>
        <h2 className="text-white text-2xl">Users</h2>
      </a>
      <a href={`${BACKEND_PATH}/matches/`} className="flex flex-col items-center bg-green-500 p-8 rounded-lg shadow-lg m-4 h-64 w-64">
        <UserIcon className="h-16 w-16 text-white mb-2"/>
        <h2 className="text-white text-2xl">Matches</h2>
      </a>
      <a href={`${BACKEND_PATH}/stats/`} className="flex flex-col items-center bg-yellow-500 p-8 rounded-lg shadow-lg m-4 h-64 w-64">
        <ChartBarIcon className="h-16 w-16 text-white mb-2"/>
        <h2 className="text-white text-2xl">Stats</h2>
      </a>
    </div>
  )
}


function AdminPanelV2_Users(props) {
  const initData = props.data;
  const [data, setData] = useState(null);
  const [selectedUsers, setSelectedUsers] = useState(initData?.selected_users ? initData.selected_users : []);
  console.log("User selection updated", selectedUsers)
  
  /**
   *  The admin pannel with gereally render with data,
    *  but if we need to reload we may still use useSWR
   */
  
  var queryParams = new URLSearchParams(window.location.search);
  let list = queryParams.get('list')
  list = list ? list : 'all'
  const fetcher = (...args) => fetch(...args).then(res => res.json());
  const { data: _data, error, mutate,  isLoading } = useSWR(`/api/admin/user_listing_advanced/${list}/`, fetcher, {
    initData: initData,
    revalidateOnMount: true
  })
  
  console.log("DATATAATA", data, _data)
  
  useEffect(() => {
    console.log("useEffect called", _data, isLoading, error)
    if (isLoading) {
      return
    }
    if (error) {
      return
    }
    setData(_data)
  }, [_data]);

  return (
    data ? <AdminPanel 
      _querySets={data?.query_sets} 
      _userLists={data?.user_lists} 
      reloadUserList={() => {
        console.log("Mutation called");
        mutate();
      }}
      setData={setData} 
      selectedUsers={selectedUsers}
      setSelectedUsers={setSelectedUsers}
      initialList={list}/> : <div>Loading...</div>
  );
}



function AdminPanelV2(props) {
  const router = useMemo(() => {
    return createBrowserRouter(
      [
        {
          path: "/",
          element: <Outlet />,
          children: [
            {
              path: "",
              element: <Root />
            },
            {
              path: "users",
              element: <AdminPanelV2_Users {...props} />,
            },
          ],
        },
      ],
      { basename: `/matching/` }
    );
  }, [])

  return <RouterProvider router={router} />
}

export default AdminPanelV2;
