import { useEffect, useState } from 'react';
import { ThemeProvider } from 'styled-components';
import theme from './theme';
import { AdminPanel } from './panel_v2/AdminPanel';
import useSWR from 'swr'

function AdminPanelV2(props) {
  const initData = props.data;
  const [data, setData] = useState(initData);
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
  const { data: _data, error, isLoading } = useSWR(data ? null : `/api/admin/user_listing_advanced/${list}/`, fetcher)
  
  useEffect(() => {
    if (data) {
      return
    }
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
      setData={setData} 
      selectedUsers={selectedUsers}
      setSelectedUsers={setSelectedUsers}
      initialList={list}/> : <div>Loading...</div>
  );
}

export default AdminPanelV2;
