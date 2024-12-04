import { Dropdown } from '@a-little-world/little-world-design-system';
import React from 'react';
import { useSearchParams } from 'react-router-dom';
import { createSearchParams } from 'react-router-dom';
import styled from 'styled-components';

import Pagination from '../atoms/Pagination';
import { MatchesTable } from '../blocks/MatchesTable';
import { useMatchesFilterOptions } from '../store';
import { useMatchListData } from '../store';
import { SelectedUsersSheet } from './../blocks/SelectedUsersSheet';

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

  return (
    <>
      <div className="flex w-full gap-5 p-4 align-center justify-center items-center">
        {/*{`Filters ${JSON.stringify(filterOptions?.filters.map(({ name }) => name))}`} todo use to render some filter menu*/}
        {filtersLoading ? (
          'Loading filters...'
        ) : (
          <div className="w-full flex items-center gap-2 justify-between flex-wrap">
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
                searchParams.set('order_by', val);
                setSearchParams(searchParams);
              }}
              placeholder="Select a user list..."
              cannotError
            />
            <Pagination list={matchList} />
          </div>
        )}
      </div>
      {usersLoading ? (
        `Loading users list '${list}' ...`
      ) : (
        <MatchesTable matchList={matchList} list={list} />
      )}
      <SelectedUsersSheet />
    </>
  );
}

export default Matches;
