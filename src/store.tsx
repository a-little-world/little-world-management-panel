import { unset } from 'lodash';
import React, { createContext, useState } from 'react';
import useSWR from 'swr';

export const dataFetcher = (url: string) =>
  fetch(url).then(res => {
    if (res.ok) return res.json();
    throw new Error('Error fetching data');
  });

export const useFilterOptions = () => {
  const { data, error, mutate, isLoading } = useSWR(
    `/api/matching/users/filters/`,
    dataFetcher,
  );

  return {
    filterOptions: data,
    error,
    mutate,
    isLoading,
  };
}

export const useMatchesFilterOptions = () => {
  const { data, error, mutate, isLoading } = useSWR(
    `/api/matching/matches/filters/`,
    dataFetcher,
  );

  return {
    filterOptions: data,
    error,
    mutate,
    isLoading,
  };
}

export const useMatchListData = (searchParams: string) => {
  const { data, error, mutate, isLoading } = useSWR(
    `/api/matching/matches/?${searchParams}`,
    dataFetcher,
  );

  return {
    matchList: data,
    error,
    mutate,
    isLoading,
  };
};

export const useUserListData = (searchParams: string) => {
  const { data, error, mutate, isLoading } = useSWR(
    `/api/matching/users/?${searchParams}`,
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
  const [selectedUsers, setSelectedUsers] = useState([]);
  const [apiOptions,] = useState(props?.apiOptions || {});
  const [apiTranslations,] = useState(props?.apiTranslations || {});

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
    () => ({ selectedUsers, selectUser, deselectUser, apiOptions, apiTranslations }),
    [selectedUsers, selectUser, deselectUser, apiOptions, apiTranslations],
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
