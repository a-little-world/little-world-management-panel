import { Dropdown, Text } from '@a-little-world/little-world-design-system';
import { get, isEmpty } from 'lodash';
import React, { useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { Link } from 'react-router-dom';
import { createSearchParams } from 'react-router-dom';
import { useMatchesFilterOptions } from '../store';
import styled from 'styled-components';

import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '../atoms/Table';
import UserImage from '../atoms/UserImage';
// import { SelectedMatchSheet } from '../blocks/SelectedMatchSheet';
import { useFilterOptions, useGlobalState, useMatchListData, useUserListData } from '../store';
import { MatchesTable } from '../blocks/MatchesTable';

const StyledDropdown = styled(Dropdown)`
  div[data-radix-popper-content-wrapper] {
    z-index: 20 !important;
  }
`;


export function Matches() {
  let [searchParams, setSearchParams] = useSearchParams();
  const list = searchParams.get('list') || 'all';
  const { filterOptions, isLoading: filtersLoading } = useMatchesFilterOptions();

  const { matchList, isLoading: usersLoading } = useMatchListData(
    createSearchParams(searchParams),
  );

  const changeList = (list: string) => {
    setSearchParams(createSearchParams({ ...searchParams, list }));
  };

  return (
    <>
      <div className="flex w-full overflow-scroll gap-2 p-2.5 align-center z-100 justify-center items-center">
        {/*{`Filters ${JSON.stringify(filterOptions?.filters.map(({ name }) => name))}`} todo use to render some filter menu*/}
        {filtersLoading ? (
          'Loading filters...'
        ) : (
          <StyledDropdown
            value={list}
            options={filterOptions.lists.map(({ name, description }) => ({
              value: name,
              label: description,
            }))}
            onValueChange={val => changeList(val)}
            cannotError
          />
        )}
      </div>
      {usersLoading ? (
        `Loading users list '${list}' ...`
      ) : (
        <MatchesTable matchList={matchList} list={list} />
      )}
    </>
  );
}

export default Matches;
