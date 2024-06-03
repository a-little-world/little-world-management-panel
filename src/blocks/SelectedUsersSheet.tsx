import {
  Button,
  ButtonSizes,
  TextInput,
} from '@a-little-world/little-world-design-system';
import { ScrollArea } from '@radix-ui/react-scroll-area';
import { isEmpty, map } from 'lodash';
import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import styled from 'styled-components';

import { addUserByHash } from '../api/index';
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetFooter,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from '../atoms/Sheet';
import { useGlobalState } from '../store';
import UserDetailsCard from './UserCard';

const StyledSheetButton = styled(Button)`
  position: fixed;
`;

export const registerInput = ({ register, name, options }) => {
  const { ref, ...rest } = register(name, options);

  return {
    ...rest,
    inputRef: ref,
  };
};

export function SelectedUsersSheet({ currentList }) {
  const {
    register,
    handleSubmit,
    formState: { errors },
    setError,
  } = useForm();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { selectedUsers, selectUser, deselectUser } = useGlobalState();

  const onError = error => {
    setError('userHash', {});
    setIsSubmitting(false);
  };

  const onAddUser = formData => {
    setIsSubmitting(true);

    addUserByHash(formData.userHash, onError, res => {
      setIsSubmitting(false);
      selectUser(res);
    });
  };

  return (
    <Sheet>
      {!isEmpty(selectedUsers) && (
        <SheetTrigger asChild>
          <StyledSheetButton className="fixed bottom-14 right-2/4 translate-x-2/4">
            View Selected Users
          </StyledSheetButton>
        </SheetTrigger>
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
          <form
            className="flex w-full gap-2"
            onSubmit={handleSubmit(onAddUser)}
          >
            <TextInput
              {...registerInput({
                register,
                name: 'userHash',
                options: { required: 'error.required' },
              })}
              id="addUserHashInput"
              error={errors?.userHash?.message}
              placeholder="Enter the user hash"
            />
            <Button
              type="submit"
              disabled={isSubmitting}
              size={ButtonSizes.Small}
            >
              Add
            </Button>
          </form>
        </SheetFooter>
      </SheetContent>
    </Sheet>
  );
}
