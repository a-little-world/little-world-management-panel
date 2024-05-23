import React, { createContext } from "react";
import useSWR from "swr";

export const dataFetcher = (url: string) =>
fetch(url).then((res) => res.json() as Promise<any>);

export const useUserListData = (list: string) => {
    const {
        data,
        error,
        mutate,
        isLoading,
      } = useSWR(`/api/admin/user_listing_advanced/${list}/`, dataFetcher);

      return {
        userList: data,
        error,
        mutate,
        isLoading,
      }
}

const GlobalStateContext = createContext({
    users: [],
  });
  
  export function GlobalStateProvider(props) {
    const {
        data: users,
        error,
        mutate,
        isLoading,
      } = useSWR(`/api/admin/user_listing_advanced/all/`, dataFetcher);

    const value = React.useMemo(() => ({ users, error, mutate, isLoading }), [
        users,
        error,
        isLoading,
        mutate,
      ]);
    return <GlobalStateContext.Provider value={value} {...props} />;
  }
  
  // a hook which we are going to use whenever we need data from `GlobalStateProvider`
  
  export function useGlobalState() {
    const context = React.useContext(GlobalStateContext);
  
    if (!context) {
      throw new Error("You need to wrap GlobalStateProvider.");
    }
  
    return context;
  }