import React, { createContext, useState } from 'react';
import useSWR from 'swr';

export const dataFetcher = (url: string) =>
  fetch(url).then(res => res.json() as Promise<any>);

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

  const value = React.useMemo(
    () => ({ selectedUsers, setSelectedUsers }),
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
