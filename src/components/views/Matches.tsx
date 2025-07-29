import { Dropdown, Text } from '@a-little-world/little-world-design-system';
import React from 'react';
import { createSearchParams, useSearchParams } from 'react-router-dom';
import styled from 'styled-components';

import { useMatchListData, useMatchesFilterOptions } from '../../store';
import FiltersToolbar from '../blocks/FiltersToolbar';
import { MatchesTable } from '../blocks/MatchesTable';
import { SelectedMatchesSheet } from '../blocks/SelectedMatchesSheet';
import { SelectedUsersSheet } from '../blocks/SelectedUsersSheet';

const StyledDropdown = styled(Dropdown)`
  div[data-radix-popper-content-wrapper] {
    z-index: 20 !important;
  }
`;

const orderingOptions = [
  {
    value: 'created_at',
    label: '(Asc) Created At',
  },
  {
    value: '-created_at',
    label: '(Desc) Created At',
  },
];

export function Matches() {
  let [searchParams, setSearchParams] = useSearchParams();
  const orderBy = searchParams.get('order_by') || '-date_joined';
  const list = searchParams.get('list') || 'all';
  const { filterOptions, isLoading: filtersLoading } =
    useMatchesFilterOptions();

  const { matchList, isLoading: usersLoading } = useMatchListData(
    createSearchParams(searchParams),
  );

  const changeList = (list: string) => {
    searchParams.set('list', list);
    setSearchParams(searchParams);
  };
  console.log({ filterOptions });
  return (
    <>
      <FiltersToolbar
        showPagination
        paginationList={matchList}
        isLoading={filtersLoading}
      >
        <StyledDropdown
          value={list}
          options={filterOptions?.filters?.map(({ name, description }) => ({
            value: name,
            label: description,
          }))}
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
          maxWidth="160px"
        />
      </FiltersToolbar>
      {usersLoading ? (
        <Text center>Loading users list '{list}' ...</Text>
      ) : (
        <MatchesTable matchList={matchList} list={list} />
      )}
      <SelectedUsersSheet />
      <SelectedMatchesSheet />
    </>
  );
}

export default Matches;
