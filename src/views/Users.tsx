import {
  Button,
  ButtonAppearance,
  Dropdown,
  Text,
  TextInput,
} from '@a-little-world/little-world-design-system';
import { useSearchParams } from "react-router-dom";
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
import { useFilterOptions, useGlobalState, useUserListData } from '../store';
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
  { key: 'matches.support', label: 'Supoort' },
];

const dataFetcher = (url: string) =>
  fetch(url).then(res => res.json() as Promise<any>);


import { createSearchParams, useNavigate } from "react-router-dom";

export function UsersTable({
  list,
  userList
}) {
  const { selectedUsers, setSelectedUsers } = useGlobalState();
  const [fields, setFields] = useState(DEFAULT_FIELDS);
  return <><Table>
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
    {isEmpty(userList?.results) ? (
      <Text className="p-4 w-full" center>
        No results.
      </Text>
    ) : (
      <TableBody>
        {userList?.results.map(user => (
          <TableRow key={user.hash}>
            <TableCell className="w-20">
              <input
                type="checkbox"
                checked={selectedUsers.includes(user.hash)}
                className="checkbox ml-2"
                onChange={() => {
                  if (selectedUsers.includes(user.hash)) {
                    deselectUser(user.hash);
                  } else {
                    setSelectedUsers([...selectedUsers, user.hash]);
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
                    {/*<MatchesIcons matches={get(user, key).items} />*/}
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
    )}
  </Table>
    {/*<SelectedUsersSheet
      userLists={data?.user_lists}
      currentList={list}
      deselectUser={() => { }}
  />*/}
  </>

}

export function Users() {
  let [searchParams, setSearchParams] = useSearchParams();
  const list = searchParams.get('list') || 'all';
  const { filterOptions, isLoading: filtersLoading } = useFilterOptions();

  const { userList, isLoading: usersLoading } = useUserListData(list);

  const changeList = (list: string) => {
    setSearchParams(createSearchParams({ ...searchParams, list }));
  }

  return <>
    <div className="flex w-full overflow-scroll gap-2 p-2.5 align-center justify-center items-center">
      {/*{`Filters ${JSON.stringify(filterOptions?.filters.map(({ name }) => name))}`} todo use to render some filter menu*/}
      {filtersLoading ? "Loading filters..." : <StyledDropdown
        value={list}
        options={filterOptions.lists.map(({ name, description }) => ({
          value: name,
          label: description,
        }))}
        onValueChange={val => changeList(val)}
      />}
    </div>
    {usersLoading ? `Loading users list '${list}' ...` : <UsersTable userList={userList} list={list} />}
  </>
}

export default Users;