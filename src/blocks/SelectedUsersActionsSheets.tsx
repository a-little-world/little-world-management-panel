import { Button } from '@a-little-world/little-world-design-system';
import { ScrollArea } from '@radix-ui/react-scroll-area';
import { isEmpty, size } from 'lodash';
import React, { useState } from 'react';
import styled from 'styled-components';

import { Progress } from '../atoms/Progress';
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetFooter,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from '../atoms/Sheet';
import { getCookiesAsObject } from '../lib/utils';
import { useGlobalState } from '../store';

const StyledSheetButton = styled(Button)`
  position: fixed;
`;

export function SelectedUsersPrematchingCallAttended({ mutateBaseList, list }) {
  const { selectedUsers, selectUser, deselectUser, } = useGlobalState();

  let selectedUserIds = [];
  for (const hash in selectedUsers) {
    selectedUserIds.push(selectedUsers[hash].id);
  }

  // format list as date time string from 2024-12-03 18:00:00+00:00 to YYYY-MM-DDTHH:MM:SSZ
  const appointmentDate = list.replace(' ', 'T').replace('+00:00', 'Z');

  const [progress, setProgress] = useState(0);
  const [results, setResults] = useState<any[]>([]);
  const [error, setError] = useState<any>();

  const markSelectedUsersAsHadPrematchingCall = async () => {

      const res = await fetch(
        `/api/matching/users/complete_prematching_call/`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'X-CSRFToken': getCookiesAsObject().csrftoken,
          },
          body: JSON.stringify({
            appointment_date: appointmentDate,
            userlist: selectedUserIds
          }),
        },
      );
      setResults(prevResults => [...prevResults, res]);
      mutateBaseList();
  };

  return (
    !isEmpty(selectedUsers) && (
      <StyledSheetButton className="fixed bottom-32 right-2/4 translate-x-2/4" onClick={markSelectedUsersAsHadPrematchingCall}>
        Mark users and send email
      </StyledSheetButton>
    )
  );
}

export function SelectedUsersActionsSheet({ mutateBaseList }) {
  const { selectedUsers, selectUser, deselectUser } = useGlobalState();

  const [progress, setProgress] = useState(0);
  const [results, setResults] = useState<any[]>([]);
  const [error, setError] = useState<any>();

  const markSelectedUsersAsHadPrematchingCall = async () => {
    let c = 0;
    for (const hash in selectedUsers) {
      const user = selectedUsers[hash];
      c += 1;
      const res = await fetch(
        `/api/matching/users/${user.id}/mark_prematching_call_completed/`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'X-CSRFToken': getCookiesAsObject().csrftoken,
          },
        },
      );
      setProgress((c / size(selectedUsers)) * 100);
      const result = {
        user,
        success: res.ok,
      };
      setResults(prevResults => [...prevResults, result]);
      mutateBaseList();
    }
  };

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
            Perform actions on the {Object.keys(selectedUsers).length} selected
            users
          </SheetDescription>
          <Progress value={progress} />
        </SheetHeader>
        <ScrollArea className="h-full overflow-scroll">
          <Button onClick={markSelectedUsersAsHadPrematchingCall}>
            Mark users as had_prematching_call=True
          </Button>
          Results:
          <div className="flex flex-col gap-2 w-full">
            {results.map(result => (
              <div>
                {result.user.profile.first_name}{' '}
                {result.user.profile.second_name}:{' '}
                {result.success ? 'Success' : 'Failed'}
                {result.error && `: ${result.error}`}
              </div>
            ))}
          </div>
        </ScrollArea>
        <SheetFooter>Footer</SheetFooter>
      </SheetContent>
    </Sheet>
  );
}
