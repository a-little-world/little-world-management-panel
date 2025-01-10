import { Button } from '@a-little-world/little-world-design-system';
import { ScrollArea } from '@radix-ui/react-scroll-area';
import { isEmpty, size } from 'lodash';
import React, { useState, useEffect } from 'react';
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

const StyledSheetContent = styled(SheetContent)`
  width: 100%;
  max-width: 700px;
  
  @media (max-width: 768px) {
    width: 100%;
  }
`;

export function SelectedUsersPrematchingCallAttended({ mutateBaseList, list }) {
  const { selectedUsers, prematchingAppointmentUsers } = useGlobalState();
  const [isOpen, setIsOpen] = useState(false);
  const [isConfirming, setIsConfirming] = useState(false);
  const [usersToEmail, setUsersToEmail] = useState<{[key: string]: boolean}>({});
  const [userStats, setUserStats] = useState({
    selected: 0,
    all: 0
  });
  useEffect(() => {
    if (isOpen) {
      calculateUserStats();
    }
  }, [isOpen]);

  let selectedUserIds = [];
  for (const hash in selectedUsers) {
    selectedUserIds.push(selectedUsers[hash].id);
  }
  
  const [progress, setProgress] = useState(0);
  const [results, setResults] = useState<any[]>([]);
  const [error, setError] = useState<any>();

  const calculateUserStats = () => {
    const stats = {
      selected: 0,
      all: 0
    };
    
    // Use prematchingAppointmentUsers to check the status
    Object.values(prematchingAppointmentUsers).forEach(appointmentUser => {
      stats.all++;
    });
    stats.selected = Object.keys(selectedUsers).length

    setUserStats(stats);
  };

  // Initialize email preferences when entering confirmation screen
  React.useEffect(() => {
    if (isConfirming) {
      // Pre-select all selected users
      const initialEmailPrefs = Object.keys(selectedUsers).reduce((acc, hash) => {
        acc[hash] = true;
        return acc;
      }, {});

      // Pre-select all users from the unselected list
      const initialAdditionalUsers = getUnselectedUsers().reduce((acc, [hash, user]) => {
        acc[hash] = user;
        return acc;
      }, {});

      const combined = { ...initialEmailPrefs, ...initialAdditionalUsers };
      setUsersToEmail(combined);
    }
  }, [isConfirming]);

  const handleAction = async () => {
    try {
      setResults([]);
      
      // Combine selected users and additional users
      
      const send_mail = Object.entries(prematchingAppointmentUsers).reduce((acc, [hash, user]) => {
        acc[user.id] = usersToEmail[hash] || false;
        return acc;
      }, {});

      const userlist = Object.values(selectedUsers).map(user => user.id);

      const res = await fetch(
        `/api/matching/users/complete_prematching_call/`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'X-CSRFToken': getCookiesAsObject().csrftoken,
          },
          body: JSON.stringify({
            appointment_date: list,
            selected_users: userlist,
            send_mail: send_mail
          }),
        },
      );
      setResults([res]);
      mutateBaseList();
      
      // Reset states after successful submission
      setUsersToEmail({});
      
    } catch (err) {
      setError(err);
    }
  };

  const getUnselectedUsers = () => {
    return Object.entries(prematchingAppointmentUsers)
      .filter(([hash]) => !selectedUsers[hash]);
  };

  // Reset states when sheet closes or opens
  const handleSheetOpenChange = (open: boolean) => {
    setIsOpen(open);
    if (!open) {
      // Reset when closing
      setResults([]);
      setError(null);
      setIsConfirming(false);
    } else {
      // Reset to first page when opening
      setIsConfirming(false);
    }
  };

  return (
    <Sheet open={isOpen} onOpenChange={handleSheetOpenChange}>
      <SheetTrigger asChild>
        <StyledSheetButton 
          className="fixed bottom-32 right-2/4 translate-x-2/4" 
        >
          Open Email Options
        </StyledSheetButton>
      </SheetTrigger>
      
      <StyledSheetContent>
        {!isConfirming ? (
          <>
            <SheetHeader>
              <SheetTitle>User Selection Review</SheetTitle>
              <SheetDescription>
                Review selected users before proceeding
              </SheetDescription>
            </SheetHeader>
            
            <div className="py-4">
              <p>Appointment Date: {list}</p>
              <p>Total Selected Users: {Object.keys(selectedUsers).length}</p>
              
              <div className="mt-4">
                <h3 className="font-semibold mb-2">Selected Users:</h3>
                <div className="max-h-60 overflow-y-auto border rounded-md p-2">
                  {Object.values(selectedUsers).map((user: any) => (
                    <div key={user.id} className="py-1">
                      {user.profile.first_name} {user.profile.second_name}
                    </div>
                  ))}
                </div>
              </div>
            </div>

            <SheetFooter className="flex justify-between mt-4">
              <Button variant="secondary" onClick={() => setIsOpen(false)}>
                Cancel
              </Button>
              <Button onClick={() => {
                calculateUserStats();
                setIsConfirming(true);
              }}>
                Continue
              </Button>
            </SheetFooter>
          </>
        ) : (
          <>
            <SheetHeader>
              <SheetTitle>Bestätige Aktion</SheetTitle>
              <SheetDescription>
                Wähle die User aus, die eine Email erhalten sollen
              </SheetDescription>
            </SheetHeader>

            <div className="space-y-4">
              <div>
                <h3 className="font-semibold mb-2">Anwesende Benutzer<br />Wenn ausgewählt, erhalten die folgenden User eine Email (Danke fuers Teilnehmen):</h3>
                <div className="border rounded-md">
                  <ScrollArea className="h-[200px]">
                    {Object.entries(selectedUsers).map(([hash, user]) => (
                      <div key={hash} className="flex items-center p-2 hover:bg-gray-50">
                        <input
                          type="checkbox"
                          checked={usersToEmail[hash] || false}
                          className="checkbox ml-2"
                          onChange={() => {
                            setUsersToEmail(prev => ({
                              ...prev,
                              [hash]: !prev[hash]
                            }));
                          }}
                        />
                        <span className="ml-3">
                          {user.profile.first_name} {user.profile.second_name}
                        </span>
                      </div>
                    ))}
                  </ScrollArea>
                </div>
              </div>

              <div>
                <h3 className="font-semibold mb-2">Nicht anwesende Benutzer<br />Wenn ausgewählt, erhalten die folgenden User eine Email (Wir haben dich beim Onboarding Vermisst):</h3>
                <div className="border rounded-md">
                  <ScrollArea className="h-[200px]">
                    {getUnselectedUsers().map(([hash, user]) => (
                      <div key={hash} className="flex items-center p-2 hover:bg-gray-50">
                        <input
                          type="checkbox"
                          checked={usersToEmail[hash] || false}
                          className="checkbox ml-2"
                          onChange={() => {
                            setUsersToEmail(prev => ({
                              ...prev,
                              [hash]: !prev[hash]
                            }));
                          }}
                        />
                        <span className="ml-3">
                          {user.profile.first_name} {user.profile.second_name}
                        </span>
                      </div>
                    ))}
                  </ScrollArea>
                </div>
              </div>
            </div>

            <div className="mt-4">
              {results.map((res, index) => (
                <div key={index}>
                  {res.ok ? '✅ Success' : '❌ Failed'}
                </div>
              ))}
              {error && <div className="text-red-500">{error.message}</div>}
            </div>

            <SheetFooter className="flex flex-col sm:flex-row gap-4 mt-4">
              <Button variant="secondary" onClick={() => setIsConfirming(false)}>
                Back
              </Button>
              <Button 
                onClick={() => handleAction()}
              >
                Prematching Call bestätigen
              </Button>
            </SheetFooter>
          </>
        )}
      </StyledSheetContent>
    </Sheet>
  );
}

