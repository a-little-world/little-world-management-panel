import { filter, unset, update } from 'lodash';
import React, { createContext, useCallback, useState } from 'react';
import useSWR from 'swr';

import { getCookiesAsObject } from './lib/utils';

export const registerInput = ({
  register,
  name,
  options,
}: {
  register: any;
  name: string;
  options?: any;
}) => {
  const { ref, ...rest } = register(name, options);

  return {
    ...rest,
    inputRef: ref,
  };
};

const ROOT_SERVER_ERROR = 'Server Error';
const TRY_AGAIN_ERROR = 'Error with request. Please try again';

export const onFormError = ({ e, formFields, setError }) => {
  const cause = Object.keys(formFields).includes(e.cause)
    ? e.cause
    : ROOT_SERVER_ERROR;

  if (e.message) {
    setError(
      cause,
      { type: 'custom', message: e.message },
      { shouldFocus: true },
    );
  } else {
    setError(cause, {
      type: 'custom',
      message: e.message || TRY_AGAIN_ERROR,
    });
  }
};

export const dataFetcher = (url: string) =>
  fetch(url).then(res => {
    if (res.ok) return res.json();
    throw new Error('Error fetching data');
  });

export const cratePostFetcher = (_data: any) => (usr: string, data: any) =>
  fetch(usr, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'X-CSRFToken': getCookiesAsObject().csrftoken,
    },
    body: JSON.stringify(_data),
  }).then(res => {
    if (res.ok) return res.json();
    throw new Error('Error fetching data');
  });

export const postFetcher = async (url: string, data: any) => {
  const response = await fetch(url, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'X-CSRFToken': getCookiesAsObject().csrftoken,
    },
    body: JSON.stringify(data),
  });

  return response.json();
};

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
};

export const usePrematchingAppointmentsFilterOptions = () => {
  const { data, error, mutate, isLoading } = useSWR(
    `/api/matching/prematchingappointments/filters/`,
    dataFetcher,
  );

  return {
    filterOptions: data,
    error,
    mutate,
    isLoading,
  };
};

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
};

export const useVideoCallsFilterOptions = () => {
  const { data, error, mutate, isLoading } = useSWR(
    `/api/matching/video_calls/filters/`,
    dataFetcher,
  );

  return {
    filterOptions: data,
    error,
    mutate,
    isLoading,
  };
};

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

export const usePrematchAppointmentsListData = (searchParams: string) => {
  const { data, error, mutate, isLoading } = useSWR(
    `/api/matching/prematchingappointments/?${searchParams}`,
    dataFetcher,
  );

  return {
    prematchAppointmentsList: data,
    error,
    mutate,
    isLoading,
  };
};

export const useDynamicUserListData = (message_list_id) => {
  const { data, error, mutate, isLoading } = useSWR(
    message_list_id ? `/api/dynamic_user_lists/${message_list_id}/` : '/api/dynamic_user_lists/',
    dataFetcher,
    {
      revalidateOnFocus: true,
      revalidateOnMount: true,
      refreshInterval: 0
    }
  );

  return {
    messageLists: data,
    error,
    mutate,
    isLoading,
  };
};

export const useUserListData = (searchParams: string) => {
  const { data, error, mutate, isLoading } = useSWR(
    searchParams ? `/api/matching/users/?${searchParams}` : null,
    dataFetcher,
  );

  return {
    userList: data,
    error,
    mutate,
    isLoading,
  };
};

export const useVideoCallsListData = (searchParams: string) => {
  const { data, error, mutate, isLoading } = useSWR(
    `/api/matching/video_calls/?${searchParams}`,
    dataFetcher,
  );

  return {
    videoCallsList: data,
    error,
    mutate,
    isLoading,
  };
};

export const useScoresFilterOptions = () => {
  const { data, error, mutate, isLoading } = useSWR(
    `/api/matching/scores/filters/`,
    dataFetcher,
  );

  return {
    filterOptions: data,
    error,
    mutate,
    isLoading,
  };
};

export const useScoresListData = (searchParams: string) => {
  const { data, error, mutate, isLoading } = useSWR(
    `/api/matching/scores/?${searchParams}`,
    dataFetcher,
  );

  return {
    scoresList: data,
    error,
    mutate,
    isLoading,
  };
};

const GlobalStateContext = createContext({
  selectedUsers: [],
  selectedMatches: []
});

export function GlobalStateProvider(props) {
  const [selectedUsers, setSelectedUsers] = useState([]);
  const [selectedMatches, setSelectedMatches] = useState([]);
  const [prematchingAppointmentUsers, setPrematchingAppointmentUsers] = useState([]);
  const [potentialMatch, setPotentialMatch] = useState<any[]>([]);
  const [apiOptions] = useState(props?.apiOptions || {});
  const [apiTranslations] = useState(props?.apiTranslations || {});
  const [updateCurrentUser, setUpdateCurrentUser] = useState(() => () => null);

  const selectUser = useCallback(
    (user: any) => {
      setSelectedUsers(currentUsers => ({
        ...currentUsers,
        [user.hash]: user,
      }));
    },
    [setSelectedUsers],
  );
  
  const selectMatch = useCallback(
    (match: any) => {
      setSelectedMatches(currentMatches => ({
        ...currentMatches,
        [match.uuid]: match,
      }));
    },
    [setSelectedMatches],
  );
  
  const deselectMatch = useCallback(
    (matchHash: string) => {
      setSelectedMatches(currentMatches => {
        const newMatches = { ...currentMatches };
        unset(newMatches, matchHash);
        return newMatches;
      });
    },
    [setSelectedMatches],
  );

  const deselectUser = useCallback(
    (userHash: string) => {
      setSelectedUsers(currentUsers => {
        const newUsers = { ...currentUsers };
        unset(newUsers, userHash);
        return newUsers;
      });
    },
    [setSelectedUsers],
  );

  const addUserToMatching = useCallback(
    (user: any) => {
      setPotentialMatch(current => {
        console.log({ user, current });
        return current.length === 2 ? [current[0], user] : [...current, user];
      });
    },
    [setPotentialMatch],
  );

  const removeUserFromMatching = useCallback(
    (userHash: string) => {
      setPotentialMatch(current =>
        filter(current, (user: any) => user.hash !== userHash),
      );
    },
    [setPotentialMatch],
  );

  const clearMatching = useCallback(() => {
    setPotentialMatch([]);
  }, [setPotentialMatch]);

  const value = React.useMemo(
    () => ({
      addUserToMatching,
      removeUserFromMatching,
      potentialMatch,
      selectedUsers,
      selectedMatches,
      selectUser,
      deselectUser,
      selectMatch,
      deselectMatch,
      clearMatching,
      apiOptions,
      apiTranslations,
      updateCurrentUser,
      setUpdateCurrentUser,
      prematchingAppointmentUsers,
      setPrematchingAppointmentUsers,
    }),
    [
      addUserToMatching,
      removeUserFromMatching,
      potentialMatch,
      selectedUsers,
      selectedMatches,
      selectUser,
      deselectUser,
      selectMatch,
      deselectMatch,
      clearMatching,
      apiOptions,
      apiTranslations,
      updateCurrentUser,
      setUpdateCurrentUser,
      prematchingAppointmentUsers,
      setPrematchingAppointmentUsers,
    ],
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
