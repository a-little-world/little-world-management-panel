import { Dropdown, Text } from '@a-little-world/little-world-design-system';
import React from 'react';
import { useSearchParams } from 'react-router-dom';
import { createSearchParams } from 'react-router-dom';
import styled from 'styled-components';

import { SelectedUsersSheet } from './../blocks/SelectedUsersSheet';

import Pagination from '../atoms/Pagination';
import { MatchesTable } from '../blocks/MatchesTable';
import { usePrematchingAppointmentsFilterOptions, usePrematchAppointmentsListData } from '../store';
import { PrematchingAppointmentsTable } from '../blocks/PrematchingAppointmentsTable';
import { SelectedUsersActionsSheet } from '../blocks/SelectedUsersActionsSheets';
import { PageSizeDropdown } from '../atoms/PageSizeDropdown';


const StyledDropdown = styled(Dropdown)`
  div[data-radix-popper-content-wrapper] {
    z-index: 20 !important;
  }
`;

const orderingOptions = [{
  value: 'start_time',
  label: '(Asc) Starts At',
}, {
  value: '-start_time',
  label: '(Desc) Starts At',
}];


export function PrematchingAppointments() {
  let [searchParams, setSearchParams] = useSearchParams();
  const orderBy = searchParams.get('order_by') || '-date_joined';
  const list = searchParams.get('list') || 'all';
  const { filterOptions, isLoading: filtersLoading } =
    usePrematchingAppointmentsFilterOptions();

  const { prematchAppointmentsList, isLoading: usersLoading, mutate } = usePrematchAppointmentsListData(
    createSearchParams(searchParams),
  );

  const changeList = (list: string) => {
    searchParams.set('list', list)
    setSearchParams(searchParams)
  };

  return (
    <>
      <div className="flex w-full overflow-scroll gap-2 p-2.5 align-center z-100 justify-center items-center">
        {/*{`Filters ${JSON.stringify(filterOptions?.filters.map(({ name }) => name))}`} todo use to render some filter menu*/}
        {filtersLoading ? (
          'Loading filters...'
        ) : (
          <div className="w-full flex items-center w-full gap-4 p-4 justify-between flex-wrap">
            <StyledDropdown
              value={list}
              options={filterOptions.lists.map(({ name, description }) => ({
                value: name,
                label: description,
              }))}
              onValueChange={val => changeList(val)}
              placeholder="Select a match list..."
              cannotError
            />
            <StyledDropdown
              value={orderBy}
              options={orderingOptions}
              onValueChange={val => {
                searchParams.set('order_by', val)
                setSearchParams(searchParams)
              }}
              placeholder="Select a user list..."
              cannotError
            />
            <PageSizeDropdown />
            <Pagination list={prematchAppointmentsList} />
          </div>
        )}
      </div>
      {usersLoading ? (
        `Loading users list '${list}' ...`
      ) : (
        <PrematchingAppointmentsTable appointments={prematchAppointmentsList} list={list} />
      )}
      <SelectedUsersActionsSheet mutateBaseList={mutate} />
      <SelectedUsersSheet />
    </>
  );
}

export default PrematchingAppointments;
