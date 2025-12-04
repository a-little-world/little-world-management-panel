import {
  Button,
  ButtonAppearance,
  Card,
  CardSizes,
  Checkbox,
  Dropdown,
  Modal,
  Text,
  TextTypes,
} from '@a-little-world/little-world-design-system';
import React from 'react';
import { createSearchParams, useSearchParams } from 'react-router-dom';
import styled from 'styled-components';

import { createPrematchingAppointmentForUser } from '../../api';
import {
  useGlobalState,
  usePrematchAppointmentsListData,
  usePrematchingAppointmentsFilterOptions,
} from '../../store';
import FiltersToolbar from '../blocks/FiltersToolbar';
import { SelectedUsersSheet } from '../blocks/SelectedUsersSheet';
import { SelectedUsersPrematchingCallAttended } from '../blocks/prematching/OnboardingSheet';
import { PrematchingAppointmentsTable } from '../blocks/prematching/PrematchingAppointmentsTable';

const StyledDropdown = styled(Dropdown)`
  div[data-radix-popper-content-wrapper] {
    z-index: 20 !important;
  }
`;

const orderingOptions = [
  {
    value: 'start_time',
    label: '(Asc) Starts At',
  },
  {
    value: '-start_time',
    label: '(Desc) Starts At',
  },
];

export function PrematchingAppointments() {
  let [searchParams, setSearchParams] = useSearchParams();
  const orderBy = searchParams.get('order_by') || '-date_joined';
  const list = searchParams.get('list') || 'all';
  const { filterOptions, isLoading: filtersLoading } =
    usePrematchingAppointmentsFilterOptions();
  const {
    selectedUsers,
    setAllPrematchingAppointmentUsers,
  } = useGlobalState();

  const [isAddUserModalOpen, setIsAddUserModalOpen] = React.useState(false);
  const [usersToAdd, setUsersToAdd] = React.useState<Record<string, boolean>>(
    {},
  );

  const searchParamsString = React.useMemo(
    () => createSearchParams(searchParams).toString(),
    [searchParams],
  );

  const { prematchAppointmentsList, isLoading: usersLoading, mutate } =
    usePrematchAppointmentsListData(searchParamsString);

  const changeList = (list: string) => {
    searchParams.set('list', list);
    setSearchParams(searchParams);
    setIsAddUserModalOpen(false);
  };

  const handleToggleUserToAdd = (hash: string) => {
    setUsersToAdd(prev => ({
      ...prev,
      [hash]: !prev[hash],
    }));
  };

  const handleOpenAddUserModal = () => {
    if (
      !list ||
      list === 'all' ||
      !selectedUsers ||
      !Object.keys(selectedUsers).length
    ) {
      return;
    }

    const initialSelection: Record<string, boolean> = {};
    Object.keys(selectedUsers).forEach(hash => {
      initialSelection[hash] = true;
    });
    setUsersToAdd(initialSelection);
    setIsAddUserModalOpen(true);
  };

  const handleConfirmAddUsers = async () => {
    if (!list || list === 'all') return;
    if (!selectedUsers) return;

    const usersArray = Object.entries(selectedUsers).filter(
      ([hash]) => usersToAdd[hash],
    );

    if (!usersArray.length) {
      setIsAddUserModalOpen(false);
      return;
    }

    await Promise.all(
      usersArray.map(([, user]: [string, any]) =>
        createPrematchingAppointmentForUser({
          userId: user.id,
          startTime: list,
          endTime: undefined,
          onSuccess: () => { },
          onError: (error: unknown) => {
            // eslint-disable-next-line no-console
            console.error(
              'Error creating prematching appointment for user',
              error,
            );
          },
        }),
      ),
    );

    mutate();
    setIsAddUserModalOpen(false);
  };

  React.useEffect(() => {
    // Close the modal if there are no selected users or list changes
    if (
      !selectedUsers ||
      !Object.keys(selectedUsers).length ||
      !list ||
      list === 'all'
    ) {
      setIsAddUserModalOpen(false);
    }
  }, [list, selectedUsers]);

  React.useEffect(() => {
    if (prematchAppointmentsList?.results) {
      const usersFromAppointment = prematchAppointmentsList.results.reduce(
        (acc: Record<string, any>, appointment: any) => {
          acc[appointment.user.hash] = {
            ...appointment.user,
            had_prematching_call: appointment.had_prematching_call,
          };
          return acc;
        },
        {},
      );
      setAllPrematchingAppointmentUsers(usersFromAppointment);
    }
  }, [prematchAppointmentsList, setAllPrematchingAppointmentUsers]);

  return (
    <>
      <FiltersToolbar
        showPageSizeDropdown
        showPagination
        paginationList={prematchAppointmentsList}
        isLoading={filtersLoading}
      >
        <Button
          appearance={ButtonAppearance.Secondary}
          onClick={handleOpenAddUserModal}
          disabled={
            !list ||
            list === 'all' ||
            !selectedUsers ||
            !Object.keys(selectedUsers).length
          }
        >
          +
        </Button>
        <StyledDropdown
          value={list}
          options={
            filterOptions?.lists?.map(
              ({
                name,
                description,
              }: {
                name: string;
                description: string;
              }) => ({
                value: name,
                label: description,
              }),
            ) || []
          }
          onValueChange={changeList}
          placeholder="Select a match list..."
          cannotError
        />
        <StyledDropdown
          value={orderBy}
          options={orderingOptions}
          onValueChange={val => {
            searchParams.set('order_by', val);
            setSearchParams(searchParams);
          }}
          placeholder="Order by..."
          cannotError
        />
      </FiltersToolbar>
      {usersLoading ? (
        <Text center>Loading users list '{list}' ...</Text>
      ) : (
        <PrematchingAppointmentsTable
          appointments={prematchAppointmentsList}
          list={list}
        />
      )}
      <Modal
        open={isAddUserModalOpen}
        onClose={() => setIsAddUserModalOpen(false)}
      >
        <Card width={CardSizes.Medium}>
          <div className="space-y-4 p-4">
            <Text type={TextTypes.Body3} bold>
              Add Selected Users to Appointment
            </Text>
            <Text type={TextTypes.Body5}>
              Choose which users from the current selection should be added to
              this appointment date.
            </Text>

            <div className="space-y-2 max-h-60 overflow-y-auto">
              {selectedUsers &&
                Object.entries(selectedUsers).map(
                  ([hash, user]: [string, any]) => (
                    <div
                      key={hash}
                      className="border rounded p-2 flex flex-col gap-1"
                    >
                      <Text type={TextTypes.Body5}>
                        <strong>User ID:</strong> {user.id}
                      </Text>
                      <Text type={TextTypes.Body5}>
                        <strong>Email:</strong> {user.email}
                      </Text>
                      <Text type={TextTypes.Body5}>
                        <strong>Profile:</strong>{' '}
                        {user.profile.first_name} {user.profile.second_name} (
                        {user.profile.user_type})
                      </Text>
                      <div className="mt-1">
                        <Checkbox
                          checked={usersToAdd[hash] || false}
                          onCheckedChange={() => handleToggleUserToAdd(hash)}
                          label="Add this user to the appointment"
                        />
                      </div>
                    </div>
                  ),
                )}
            </div>

            <div className="flex justify-end gap-2 pt-4">
              <Button
                appearance={ButtonAppearance.Secondary}
                onClick={() => setIsAddUserModalOpen(false)}
              >
                Cancel
              </Button>
              <Button
                onClick={handleConfirmAddUsers}
                disabled={
                  !Object.values(usersToAdd).some(checked => checked)
                }
              >
                Confirm
              </Button>
            </div>
          </div>
        </Card>
      </Modal>
      <SelectedUsersSheet />
      <SelectedUsersPrematchingCallAttended
        mutateBaseList={mutate}
        list={list}
      />
    </>
  );
}

export default PrematchingAppointments;
