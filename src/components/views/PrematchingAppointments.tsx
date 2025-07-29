import { Dropdown, Text } from '@a-little-world/little-world-design-system';
import React from 'react';
import { createSearchParams, useSearchParams } from 'react-router-dom';
import styled from 'styled-components';

import {
  useGlobalState,
  usePrematchAppointmentsListData,
  usePrematchingAppointmentsFilterOptions,
} from '../../store';
import FiltersToolbar from '../blocks/FiltersToolbar';
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
  const { setAllPrematchingAppointmentUsers } = useGlobalState();

  const {
    prematchAppointmentsList,
    isLoading: usersLoading,
    mutate,
  } = usePrematchAppointmentsListData(createSearchParams(searchParams));

  const changeList = (list: string) => {
    searchParams.set('list', list);
    setSearchParams(searchParams);
  };

  React.useEffect(() => {
    if (prematchAppointmentsList?.results) {
      const usersFromAppointment = prematchAppointmentsList.results.reduce(
        (acc, appointment) => {
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
        <StyledDropdown
          value={list}
          options={
            filterOptions?.lists?.map(({ name, description }) => ({
              value: name,
              label: description,
            })) || []
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
      <SelectedUsersPrematchingCallAttended
        mutateBaseList={mutate}
        list={list}
      />
    </>
  );
}

export default PrematchingAppointments;
