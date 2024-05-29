import { unset } from 'lodash';
import React, { createContext, useState } from 'react';
import useSWR from 'swr';

export const dataFetcher = (url: string) =>
  fetch(url).then(res => {
    if (res.ok) return res.json();
    throw new Error('Error fetching data');
  });

export const useUserListData = (list: string) => {
  const { data, error, mutate, isLoading } = useSWR(
    `/api/admin/user_listing_advanced/${list}/`,
    dataFetcher,
  );

  return {
    userList: data,
    error,
    mutate,
    isLoading,
  };
};

const GlobalStateContext = createContext({
  selectedUsers: [],
});

export function GlobalStateProvider(props) {
  console.log('store', { props });
  const [selectedUsers, setSelectedUsers] = useState(
    props?.data?.selected_users ?? [],
  );

  const selectUser = user => {
    setSelectedUsers(currentUsers => ({ ...currentUsers, [user.hash]: user }));
  };

  const deselectUser = userHash => {
    setSelectedUsers(currentUsers => {
      const newUsers = { ...currentUsers };
      unset(newUsers, userHash);
      return newUsers;
    });
  };

  const value = React.useMemo(
    () => ({ selectedUsers, selectUser, deselectUser }),
    [selectedUsers],
  );
  return <GlobalStateContext.Provider value={value} {...props} />;
}

// a hook which we are going to use whenever we need data from `GlobalStateProvider`

export function useGlobalState() {
  const context = React.useContext(GlobalStateContext);

  if (!context) {
    throw new Error('You need to wrap GlobalStateProvider.');
  }

  return context;
}
