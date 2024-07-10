import {
  Button,
  ButtonSizes,
  TextInput,
} from '@a-little-world/little-world-design-system';
import { ScrollArea } from '@radix-ui/react-scroll-area';
import { isEmpty, map, size } from 'lodash';
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

export function SelectedUsersActionsSheet() {
  const { selectedUsers, selectUser, deselectUser } = useGlobalState();


  return (
    <Sheet>
      {!isEmpty(selectedUsers) && (
        <SheetTrigger asChild id="actions-sheet">
          <StyledSheetButton className="fixed bottom-32 right-2/4 translate-x-2/4">
            View Actions
          </StyledSheetButton>
        </SheetTrigger>
      )}
      <SheetContent>
        <SheetHeader>
          <SheetTitle>Selected Users</SheetTitle>
          <SheetDescription>
            Perform actions on the {Object.keys(selectedUsers).length} selected users
          </SheetDescription>
        </SheetHeader>
        <ScrollArea className="h-full overflow-scroll">
          <Button>
            Mark users as had_prematching_call=True
          </Button>
        </ScrollArea>
        <SheetFooter>
          Footer
        </SheetFooter>
      </SheetContent>
    </Sheet>
  );
}
