import { useEffect, useState } from 'react';
import { ThemeProvider } from 'styled-components';
import theme from './theme';
import { AdminPanel } from './panel_v2/AdminPanel';

function AdminPanelV2(props) {
  const initData = props.data;
  const [data, setData] = useState(initData);
  
  /**
   *  The admin pannel with gereally render with data,
    *  but if we need to reload we may still use useSWR
   */
  //const fetcher = (...args) => fetch(...args).then(res => res.json());
  //const { data: _data, error, isLoading } = useSWR(`/api/admin/user_advanced/${user.id}/`, fetcher)

  return (
    <AdminPanel _querySets={data?.query_sets} _userLists={data?.user_lists} />
  );
}

export default AdminPanelV2;
