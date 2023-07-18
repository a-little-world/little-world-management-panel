import { useEffect, useState } from 'react';
import { ThemeProvider } from 'styled-components';
import theme from './theme';
import { AdminPanel } from './panel_v2/AdminPanel';

function AdminPanelV2(props) {
  const initData = props.data;
  const [data, setData] = useState(initData);
  return (
    <AdminPanel _querySets={data?.query_sets} _userLists={data?.user_lists} />
  );
}

export default AdminPanelV2;
