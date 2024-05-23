import { SelectedUsersSheet } from './../blocks/SelectedUsersSheet';
import React, { useEffect, useState } from 'react';
import useSWR from 'swr';
import Header from '../atoms/Header';
import { useGlobalState, useUserListData } from '../store';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '../atoms/Table';
import { get, isEmpty, map } from 'lodash';
import UserImage from '../atoms/UserImage';
import MatchesIcons from '../atoms/MatchesIcons';
import { Button, ButtonAppearance, Dropdown, Text, TextInput } from '@a-little-world/little-world-design-system';
import styled from 'styled-components';


const StyledDropdown = styled(Dropdown)`
 div[data-radix-popper-content-wrapper] {
  z-index: 20 !important;
 }
`

const DEFAULT_FIELDS = [
  { key: 'profile.image', label: 'Image'},
  { key: 'profile.user_type', label: 'Type'},
  { key: 'profile.first_name', label: 'First Name'},
  { key: 'profile.second_name', label: 'Second Name'},
  { key: 'profile.target_group', label: 'Target Group'},
  { key: 'matches.unconfirmed', label: 'Unconfirmed'},
  { key: 'matches.confirmed', label: 'Confirmed'},
  { key: 'matches.support', label: 'Supoort'},
];

const dataFetcher = (url: string) =>
  fetch(url).then((res) => res.json() as Promise<any>);


export function Users(props) {
  const initData = props.data;
  const [data, setData] = useState(null);
  const [currentList, setCurrentList] = useState('all');
  const [selectedUsers, setSelectedUsers] = useState(
    initData?.selected_users ?? [],
  );

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
  const { userList: _data, error, isLoading, mutate} = useUserListData(currentList);

  console.log('DATATAATA', data, _data);

  useEffect(() => {
    console.log({ _data})
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

  //   const selectedUsersHashes = selectedUsers
  //     .map(user => (user ? user.hash : null))
  //     .filter(hash => hash !== null);

  //   const setSelectedUsersByHash = usersHashes => {
  //     const users = usersHashes.map((hash, i) =>
  //       userLists[list].results.filter(user => user.hash === hash).length > 0
  //         ? userLists[list].results.filter(user => user.hash === hash)[0]
  //         : selectedUsers[i],
  //     );
  //     setSelectedUsers(users);
  //   };

  // const onSelectUser = (user) => {
  //   setSelectedUsers(current => {
  //     return [current, user]
  //   })
  // }

  const deselectUser = (userHash) => {
    setSelectedUsers(selectedUsers.filter((hash) => hash !== userHash))
  }
  
  return (
    <div className='h-[calc(100dvh)] overflow-hidden font-medium'>
      <Header />
      <div className='flex w-full overflow-scroll gap-2 p-2.5 align-center justify-center items-center'>
        <StyledDropdown value={currentList} options={map(_querySets, (value, key) => ({ value: key, label: value}))} onValueChange={val => setCurrentList(val)}/>
      </div> 
      <Table>
        <TableHeader>
        <TableRow>
        <TableHead className="w-[100px]">Selected</TableHead>
          {fields.map(({ key, label}) => 
            <TableHead key={key} className="w-[100px]">{label}</TableHead>
          )}
        </TableRow>
      </TableHeader>
      {data ?
        (isEmpty(_data?.user_lists[currentList]?.results) ? (<Text className='p-4 w-full' center>No results.</Text>) :
      (<TableBody>
          {_data?.user_lists[currentList]?.results.map((user) => (
            <TableRow key={user.hash}>
              <TableCell className='w-20'>
              <input type="checkbox" checked={selectedUsers.includes(user.hash)} className="checkbox ml-2" onChange={() => {
                if (selectedUsers.includes(user.hash)) {
                  deselectUser(user.hash)
                } else {
                  setSelectedUsers([...selectedUsers, user.hash])
                }
              }} />

              </TableCell>
              {fields.map(({ key }) => {
              
                if (key === 'profile.image') {
                  return (
                  <TableCell key={user.hash + key} className="font-medium">
                    <div className="rounded-full">
                      <UserImage alt={'user profile image'} user={user.profile} dimensions={{
                        height: 32,
                        width: 32
                      }} />
                    </div>
                  </TableCell>
                )}

                if (key.includes('matches.')) return (
                  <TableCell key={user.hash + key} className="font-medium">{<MatchesIcons matches={get(user, key).items} />}</TableCell>
                )
                return (<TableCell key={user.hash + key} className="font-medium">{get(user, key)}</TableCell>)
              })}
            </TableRow>
        ))}
      </TableBody>
    )) : (<Text className='p-4 align-center w-full' center>Loading...</Text>)
    } 
    </Table>
    <SelectedUsersSheet preSelectedUsers={selectedUsers} userLists={data?.user_lists} currentList={currentList}  deselectUser={deselectUser}  />
    </div>
  );
}

export default Users;
// <DynamicDispay>
//   querySets={_querySets}
//   selectedList={list}
//   selectedUsersHashes={selectedUsersHashes}
//   selectedUsers={selectedUsers}
//   setSelectedUsers={setSelectedUsers}
//   setSelectedUsersByHash={setSelectedUsersByHash}
//   fields={fields}
//   setFields={setFields}
//   selectUserForDetails={(user) => {

//     if (matchingSelectionState.inProgress) {
//       setMatchingSelectionState({ ...matchingSelectionState, user: user })
//       console.log("Updated Matching Selection", matchingSelectionState)
//     } else {
//       setDetailUser(user)
//     }

//   }}
//   setData={setData}
// >
//   {detailUser ?
//     <AdvancedUserDetails user={detailUser}
//       reloadUserList={reloadUserList}
//       addUserToSelection={(user) => {
//         if (selectedUsersHashes.indexOf(user.hash) === -1) {
//           setSelectedUsers([...selectedUsers, user])
//         }
//       }}
//       closeUserDetails={() => {
//         updateQueryParams({ param: "user_details", value: null });
//         setDetailUser(null);
//       }}
//       setEmailHTML={setEmailHTML}
//       matchingSelectionState={matchingSelectionState}
//       setMatchingSelectionState={setMatchingSelectionState}
//     /> :
//     <Table
//       users={userLists[list]}
//       fields={fields}
//       selectedList={list}
//       selectedUsersHashes={selectedUsersHashes}
//       setSelectedUsers={setSelectedUsersByHash} />}
//   <dialog id="my_modal_1" className="modal">
//     <form method="dialog" className="modal-box max-w-full w-fit">
//       <p className="py-4">Press ESC key or click the button below to close</p>
//       <div className="modal-action">
//         {emailHTML && <div dangerouslySetInnerHTML={{ __html: emailHTML }} />}
//         <button className="btn">Close</button>
//       </div>
//     </form>
//   </dialog>
// </DynamicDisplay>
