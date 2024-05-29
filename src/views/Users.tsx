import {
  Button,
  ButtonAppearance,
  Dropdown,
  Text,
  TextInput,
} from '@a-little-world/little-world-design-system';
import { get, isEmpty, map } from 'lodash';
import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import styled from 'styled-components';
import useSWR from 'swr';

import Header from '../atoms/Header';
import MatchesIcons from '../atoms/MatchesIcons';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '../atoms/Table';
import UserImage from '../atoms/UserImage';
import { useGlobalState, useUserListData } from '../store';
import { SelectedUsersSheet } from './../blocks/SelectedUsersSheet';

const StyledDropdown = styled(Dropdown)`
  div[data-radix-popper-content-wrapper] {
    z-index: 20 !important;
  }
`;

const DEFAULT_FIELDS = [
  { key: 'profile.image', label: 'Image' },
  { key: 'profile.user_type', label: 'Type' },
  { key: 'profile.first_name', label: 'First Name' },
  { key: 'profile.second_name', label: 'Second Name' },
  { key: 'profile.target_group', label: 'Target Group' },
  { key: 'matches.unconfirmed', label: 'Unconfirmed' },
  { key: 'matches.confirmed', label: 'Confirmed' },
  { key: 'matches.support', label: 'Support' },
];

const dataFetcher = (url: string) =>
  fetch(url).then(res => res.json() as Promise<any>);

export function Users(props) {
  const [data, setData] = useState(null);
  const [currentList, setCurrentList] = useState('all');
  const { selectedUsers, selectUser, deselectUser } = useGlobalState();
  /**
   *  The admin panel with generally render with data,
   *  but if we need to reload we may still use useSWR
   */
  var queryParams = new URLSearchParams(window.location.search);
  let list = queryParams.get('list');
  list = list ? list : 'all';

  // const {
  //   data: _data,
  //   error,
  //   mutate,
  //   isLoading,
  // } = useSWR(`/api/admin/user_listing_advanced/${list}/`, dataFetcher);

  // const { users: _data, mutate } = useGlobalState({ list: currentList})
  const {
    userList: _data,
    error,
    isLoading,
    mutate,
  } = useUserListData(currentList);

  console.log('DATATAATA', data, _data);

  useEffect(() => {
    console.log({ _data });
    setData(_data);
  }, [_data]);

  const _querySets = data?.query_sets;
  const _userLists = data?.user_lists;
  const reloadUserList = () => {
    mutate();
  };

  // If a matching selection is being performed ( then the user details are not openend)
  const [matchingSelectionState, setMatchingSelectionState] = useState({
    inProgress: false,
    user: null,
  });

  // A dict {list_name: <paginated-user-listing>}.results = [] ...
  const [userLists, setUserLists] = useState(_userLists);
  // Just a string reference to the current list

  useEffect(() => {
    setUserLists(_userLists);
  }, [_userLists]);

  console.log('UPDATE USERS_LIST', _userLists, list, userLists);

  // The fields that should be currently displayed
  const [fields, setFields] = useState(DEFAULT_FIELDS);

  // The user that is selected into a details view
  const [detailUser, setDetailUser] = useState(null);

  var queryParams = new URLSearchParams(window.location.search);
  let user_details = queryParams.get('user_details');
  user_details = user_details ? user_details : null;

  const {
    data: _pre_loaded_user,
    // error,
    // isLoading,
  } = useSWR(
    !detailUser && user_details
      ? `/api/admin/user_advanced/${user_details}/`
      : null,
    dataFetcher,
  );

  useEffect(() => {
    if (_pre_loaded_user) {
      console.log('PRE LOADED USER', _pre_loaded_user);
      setDetailUser(_pre_loaded_user);
    }
  }, [_pre_loaded_user]);

  return (
    <>
      <div className="flex w-full overflow-scroll gap-2 p-2.5 align-center justify-center items-center">
        <StyledDropdown
          value={currentList}
          options={map(_querySets, (value, key) => ({
            value: key,
            label: value,
          }))}
          onValueChange={val => setCurrentList(val)}
        />
      </div>
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead className="w-[100px]">Selected</TableHead>
            {fields.map(({ key, label }) => (
              <TableHead key={key} className="w-[100px]">
                {label}
              </TableHead>
            ))}
          </TableRow>
        </TableHeader>
        {data ? (
          isEmpty(_data?.user_lists[currentList]?.results) ? (
            <Text className="p-4 w-full" center>
              No results.
            </Text>
          ) : (
            <TableBody>
              {_data?.user_lists[currentList]?.results.map(user => (
                <TableRow key={user.hash}>
                  <TableCell className="w-20">
                    <input
                      type="checkbox"
                      checked={!!selectedUsers[user.hash]}
                      className="checkbox ml-2"
                      onChange={() => {
                        if (!!selectedUsers[user.hash]) {
                          deselectUser(user.hash);
                        } else {
                          selectUser(user);
                        }
                      }}
                    />
                  </TableCell>
                  {fields.map(({ key }) => {
                    if (key === 'profile.image') {
                      return (
                        <TableCell key={user.hash + key}>
                          <Link to={`/user/${user.id}`}>
                            <UserImage
                              alt={'user profile image'}
                              user={user.profile}
                              dimensions={{
                                height: 32,
                                width: 32,
                              }}
                            />
                          </Link>
                        </TableCell>
                      );
                    }

                    if (key.includes('matches.'))
                      return (
                        <TableCell key={user.hash + key}>
                          {<MatchesIcons matches={get(user, key).items} />}
                        </TableCell>
                      );
                    return (
                      <TableCell key={user.hash + key}>
                        {get(user, key)}
                      </TableCell>
                    );
                  })}
                </TableRow>
              ))}
            </TableBody>
          )
        ) : (
          <Text className="p-4 align-center w-full" center>
            Loading...
          </Text>
        )}
      </Table>
      <SelectedUsersSheet currentList={currentList} />
    </>
  );
}

export default Users;
