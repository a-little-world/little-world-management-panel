import { Dropdown, Text } from '@a-little-world/little-world-design-system';
import React from 'react';
import { useSearchParams } from 'react-router-dom';
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

const matchTypeOptions = [
  { value: 'all', label: 'All' },
  { value: 'standard', label: 'Standard' },
  { value: 'random_call', label: 'Random Call' },
];

export function Matches() {
  let [searchParams, setSearchParams] = useSearchParams();
  const orderBy = searchParams.get('order_by') || '-created_at';
  const matchType = searchParams.get('match_type') ?? '';
  const list = searchParams.get('list') || 'all';
  const { filterOptions, isLoading: filtersLoading } =
    useMatchesFilterOptions();

  const { matchList, isLoading: usersLoading } = useMatchListData(
    searchParams.toString(),
  );

  const changeList = (list: string) => {
    searchParams.set('list', list);
    setSearchParams(searchParams);
  };

  const changeMatchType = (val: string) => {
    if (val === 'all') {
      searchParams.delete('match_type');
    } else {
      searchParams.set('match_type', val);
    }
    setSearchParams(searchParams);
  };

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
          value={matchType}
          options={matchTypeOptions}
          onValueChange={changeMatchType}
          placeholder="Match type..."
          cannotError
          maxWidth="160px"
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
