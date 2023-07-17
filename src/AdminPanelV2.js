import { useEffect, useState } from 'react';
import { ThemeProvider } from 'styled-components';
import theme from './theme';
import { AdminPanel } from './panel_v2/AdminPanel';

function AdminPanelV2({ initData }) {
  const [data, setData] = useState(initData);
  return (
    <ThemeProvider theme={theme}>
      <AdminPanel querySets={data.query_sets} userLists={data.user_lists} />
    </ThemeProvider>
  );
}

export default AdminPanelV2;
