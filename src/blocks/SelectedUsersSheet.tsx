import {
  Button,
  ButtonSizes,
  TextInput,
} from '@a-little-world/little-world-design-system';
import { ScrollArea } from '@radix-ui/react-scroll-area';
import { isEmpty, map, size } from 'lodash';
import React from 'react';
import { useForm } from 'react-hook-form';
import styled from 'styled-components';

import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetFooter,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from '../atoms/Sheet';
import useSelectUser from '../hooks/useSelectUser';
import { registerInput, useGlobalState } from '../store';
import SearchBar from './SearchBar';
import UserDetailsCard from './user/UserCard';

const StyledSheetButton = styled(Button)`
  position: fixed;
`;

export function SelectedUsersSheet() {
  const {
    register,
    handleSubmit,
    formState: { errors },
    setError,
  } = useForm();

  const { selectedUsers, deselectUser, selectedMatches } = useGlobalState();
  const { isSubmitting, onSelectUser, error } = useSelectUser();

  return (
    <Sheet>
      {!isEmpty(selectedUsers) && (
        <SheetTrigger asChild>
          <StyledSheetButton className="fixed bottom-14 right-2/4 translate-x-2/4">
            View Selected Users ({size(selectedUsers)})
          </StyledSheetButton>
        </SheetTrigger>
      )}
      {!isEmpty(selectedMatches) && (
          <StyledSheetButton className="fixed bottom-14 right-3/4 translate-x-2/4">
            View Selected Matches ({size(selectedMatches)})
          </StyledSheetButton>
      )}
      <SheetContent>
        <SheetHeader>
          <SheetTitle>Selected Users</SheetTitle>
          <SheetDescription>
            Make changes to your profile here. Click save when you're done.
          </SheetDescription>
        </SheetHeader>
        <ScrollArea className="h-full overflow-scroll">
          {map(selectedUsers, user => {
            return (
              <UserDetailsCard
                key={'card' + user.hash}
                user={user}
                deselectUser={deselectUser}
              />
            );
          })}
        </ScrollArea>
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
