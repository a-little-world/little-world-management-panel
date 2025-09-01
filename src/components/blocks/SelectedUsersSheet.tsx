import { isEmpty, map, size } from 'lodash';
import React from 'react';

import useSelectUser from '../../hooks/useSelectUser';
import { useGlobalState } from '../../store';
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetFooter,
  SheetHeader,
  SheetScrollableContent,
  SheetTitle,
  SheetTrigger,
} from '../atoms/Sheet';
import SearchBar from './SearchBar';
import UserDetailsCard from './user/UserCard';

export function SelectedUsersSheet() {
  const { selectedUsers, deselectUser, selectedMatches } = useGlobalState();
  const { isSubmitting, onSelectUser, error } = useSelectUser();

  return (
    <Sheet>
      {!isEmpty(selectedUsers) && (
        <SheetTrigger>
          {`View Selected Users (${size(selectedUsers)})`}
        </SheetTrigger>
      )}
      <SheetContent>
        <SheetHeader>
          <SheetTitle>Selected Users</SheetTitle>
          <SheetDescription>
            Make changes to your profile here. Click save when you're done.
          </SheetDescription>
        </SheetHeader>
        <SheetScrollableContent className="h-full overflow-scroll">
          {selectedUsers &&
            map(selectedUsers, user => {
              return (
                <UserDetailsCard
                  key={'card' + user.hash}
                  user={user}
                  deselectUser={deselectUser}
                />
              );
            })}
        </SheetScrollableContent>
        <SheetFooter>
          <SearchBar
            name="userHash"
            isSubmitting={isSubmitting}
            onSubmit={onSelectUser}
            error={error}
            placeholder="Enter user hash"
          />
        </SheetFooter>
      </SheetContent>
    </Sheet>
  );
}
