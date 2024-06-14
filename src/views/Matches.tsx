import { Dropdown, Text } from '@a-little-world/little-world-design-system';
import React from 'react';
import { useSearchParams } from 'react-router-dom';
import { createSearchParams } from 'react-router-dom';
import styled from 'styled-components';

import Pagination from '../atoms/Pagination';
import { MatchesTable } from '../blocks/MatchesTable';
import { useMatchesFilterOptions } from '../store';
import { useMatchListData } from '../store';

const StyledDropdown = styled(Dropdown)`
  div[data-radix-popper-content-wrapper] {
    z-index: 20 !important;
  }
`;

export function Matches() {
  let [searchParams, setSearchParams] = useSearchParams();
  const list = searchParams.get('list') || 'all';
  const { filterOptions, isLoading: filtersLoading } =
    useMatchesFilterOptions();

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
            <Pagination list={matchList} />
          </div>
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
