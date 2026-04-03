import {
  Button,
  ButtonAppearance,
  Checkbox,
  Text,
  TextTypes,
} from '@a-little-world/little-world-design-system';
import { isEmpty, size } from 'lodash';
import React, { useCallback, useEffect, useMemo, useState } from 'react';

import { completePrematchingCall } from '../../../api';
import { useGlobalState } from '../../../store';
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetFooter,
  SheetHeader,
  SheetScrollableContent,
  SheetTitle,
  SheetTrigger,
} from '../../atoms/Sheet';
import {
  AppointmentDateText,
  ErrorMessage,
  SectionDescription,
  SectionTitle,
  StatItem,
  StatLabel,
  StatNumber,
  StatsContainer,
  SuccessMessage,
  UserListContainer,
  UserListItem,
  UserListSectionsContainer,
} from './OnboardingSheet.styles';

// Types
interface User {
  id: number;
  hash: string;
  profile: {
    first_name: string;
    second_name: string;
    user_type: 'volunteer' | 'learner';
  };
  email: string;
}

interface PrematchingAppointmentUser extends User {
  had_prematching_call: boolean;
}

interface SelectedUsersPrematchingCallAttendedProps {
  mutateBaseList: () => void;
  list: string;
}

export function SelectedUsersPrematchingCallAttended({
  mutateBaseList,
  list,
}: SelectedUsersPrematchingCallAttendedProps) {
  const {
    allPrematchingAppointmentUsers,
    selectedPrematchingAppointmentUsers,
    clearSelectedPrematchingAppointmentUsers,
  } = useGlobalState();
  const [isOpen, setIsOpen] = useState(false);
  const [isConfirming, setIsConfirming] = useState(false);
  const [usersToEmail, setUsersToEmail] = useState<Record<string, boolean>>({});
  const [showSuccessMessage, setShowSuccessMessage] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Type guards and safe access
  const safeSelectedUsers = selectedPrematchingAppointmentUsers as Record<
    string,
    User
  >;
  const safeAllPrematchingUsers = allPrematchingAppointmentUsers as Record<
    string,
    PrematchingAppointmentUser
  >;

  // Memoized computations
  const selectedUserIds = useMemo(
    () => Object.values(safeSelectedUsers).map((user: User) => user.id),
    [safeSelectedUsers],
  );

  const unselectedUsers = useMemo(
    () =>
      Object.entries(safeAllPrematchingUsers).filter(
        ([hash]) => !safeSelectedUsers[hash],
      ),
    [safeAllPrematchingUsers, safeSelectedUsers],
  );

  const userStats = useMemo(
    () => ({
      selected: Object.keys(safeSelectedUsers).length,
      all: Object.keys(safeAllPrematchingUsers).length,
    }),
    [safeSelectedUsers, safeAllPrematchingUsers],
  );

  // Initialize email preferences when entering confirmation screen
  useEffect(() => {
    if (isConfirming && !showSuccessMessage) {
      const initialAttendedUsers = Object.keys(safeSelectedUsers).reduce(
        (acc, hash) => {
          acc[hash] = true;
          return acc;
        },
        {} as Record<string, boolean>,
      );

      const initialAdditionalUsers = unselectedUsers.reduce((acc, [hash]) => {
        acc[hash] = true; // Start unselected users as selected (true)
        return acc;
      }, {} as Record<string, boolean>);

      setUsersToEmail({ ...initialAttendedUsers, ...initialAdditionalUsers });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isConfirming, safeSelectedUsers, unselectedUsers]);

  const handleUserEmailToggle = useCallback((hash: string) => {
    setUsersToEmail(prev => ({
      ...prev,
      [hash]: !prev[hash],
    }));
  }, []);

  const handleClose = useCallback(() => {
    setIsOpen(false);
    setIsConfirming(false);
    setShowSuccessMessage(false);
    setError(null);
    setUsersToEmail({});
    if (showSuccessMessage) clearSelectedPrematchingAppointmentUsers();
  }, [clearSelectedPrematchingAppointmentUsers, showSuccessMessage]);

  const handleAction = useCallback(async () => {
    setShowSuccessMessage(false);
    setError(null);

    const sendEmailsNow = Object.entries(safeAllPrematchingUsers).some(
      ([hash]) => usersToEmail[hash] || false,
    );

    completePrematchingCall({
      appointmentDate: list,
      selectedUsers: selectedUserIds,
      sendEmailsNow,
      onSuccess: (res: any) => {
        setShowSuccessMessage(true);
        mutateBaseList();
      },
      onError: (err: unknown) =>
        setError(err instanceof Error ? err.message : 'An error occurred'),
    });
  }, [
    safeAllPrematchingUsers,
    usersToEmail,
    list,
    selectedUserIds,
    mutateBaseList,
  ]);

  const handleSheetOpenChange = useCallback((open: boolean) => {
    setIsOpen(open);
    if (!open) {
      setShowSuccessMessage(false);
      setError(null);
      setIsConfirming(false);
    } else {
      setIsConfirming(false);
    }
  }, []);

  const renderUserList = (
    users: [string, User][],
    title: string,
    description: string,
    showCheckboxes = false,
  ) => (
    <div>
      <SectionTitle tag="h3" type={TextTypes.Body3}>
        {title}
      </SectionTitle>
      <SectionDescription type={TextTypes.Body5}>
        {description}
      </SectionDescription>
      <UserListContainer $setHeight={users.length > 3}>
        {users.length === 0 ? (
          <UserListItem>
            <Text type={TextTypes.Body5} color="secondary">
              No users in this category
            </Text>
          </UserListItem>
        ) : (
          users.map(([hash, user]) => (
            <UserListItem key={hash}>
              {showCheckboxes ? (
                <Checkbox
                  readOnly={showSuccessMessage}
                  required={false}
                  checked={usersToEmail[hash] || false}
                  onCheckedChange={() => handleUserEmailToggle(hash)}
                  label={`${user.profile.first_name} ${user.profile.second_name} (${user.profile.user_type})`}
                />
              ) : (
                <Text type={TextTypes.Body5}>
                  {user.profile.first_name} {user.profile.second_name} ({user.profile.user_type})
                </Text>
              )}
            </UserListItem>
          ))
        )}
      </UserListContainer>
    </div>
  );

  return (
    <Sheet open={isOpen} onOpenChange={handleSheetOpenChange}>
      {!isEmpty(selectedPrematchingAppointmentUsers) && (
        <SheetTrigger>
          {`Open Options (${size(
            selectedPrematchingAppointmentUsers,
          )} selected)`}
        </SheetTrigger>
      )}

      <SheetContent>
        {!isConfirming ? (
          <>
            <SheetHeader>
              <SheetTitle type={TextTypes.Heading3}>
                User Selection Review
              </SheetTitle>
              <SheetDescription type={TextTypes.Body5}>
                Review selected users before proceeding
              </SheetDescription>
            </SheetHeader>

            <SheetScrollableContent>
              <AppointmentDateText type={TextTypes.Body5} color="secondary">
                Appointment Date: {list}
              </AppointmentDateText>

              <StatsContainer>
                <StatItem>
                  <StatNumber>{userStats.selected}</StatNumber>
                  <StatLabel>Selected Users</StatLabel>
                </StatItem>
                <StatItem>
                  <StatNumber>{userStats.all}</StatNumber>
                  <StatLabel>Total Users</StatLabel>
                </StatItem>
              </StatsContainer>

              {userStats.selected === 0 ? (
                <Text type={TextTypes.Body5} color="secondary" center>
                  No users are currently selected
                </Text>
              ) : (
                renderUserList(
                  Object.entries(safeSelectedUsers),
                  'Selected Users',
                  'Users who attended the prematching call',
                )
              )}
            </SheetScrollableContent>

            <SheetFooter>
              <Button
                appearance={ButtonAppearance.Secondary}
                onClick={handleClose}
              >
                Cancel
              </Button>
              <Button
                onClick={() => setIsConfirming(true)}
                disabled={userStats.selected === 0}
              >
                Continue
              </Button>
            </SheetFooter>
          </>
        ) : (
          <>
            <SheetHeader>
              <SheetTitle type={TextTypes.Heading3}>Confirm Action</SheetTitle>
              <SheetDescription type={TextTypes.Body5}>
                Select which users should receive emails
              </SheetDescription>
            </SheetHeader>

            <SheetScrollableContent>
              {error && <ErrorMessage>{error}</ErrorMessage>}

              {showSuccessMessage && (
                <SuccessMessage>
                  ✅ Onboarding states have successfully been updated. You can
                  check the email status in the logs for each user.
                </SuccessMessage>
              )}

              <UserListSectionsContainer>
                {renderUserList(
                  Object.entries(safeSelectedUsers),
                  'Attended Users',
                  'If selected, these users will receive a "Thank you for participating" email',
                  true,
                )}

                {renderUserList(
                  unselectedUsers as [string, User][],
                  'Non-Attended Users',
                  'If selected, these users will receive a "We missed you at onboarding" email',
                  true,
                )}
              </UserListSectionsContainer>
            </SheetScrollableContent>

            <SheetFooter>
              <Button
                appearance={ButtonAppearance.Secondary}
                onClick={() => setIsConfirming(false)}
                disabled={showSuccessMessage}
              >
                Back
              </Button>
              {showSuccessMessage ? (
                <Button onClick={handleClose}>Close</Button>
              ) : (
                <Button onClick={handleAction}>Confirm</Button>
              )}
            </SheetFooter>
          </>
        )}
      </SheetContent>
    </Sheet>
  );
}
