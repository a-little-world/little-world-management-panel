import { Dropdown, Text } from '@a-little-world/little-world-design-system';
import { get, isEmpty } from 'lodash';
import React, { useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { Link } from 'react-router-dom';
import { createSearchParams } from 'react-router-dom';
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
import { useFilterOptions, useGlobalState, useUserListData } from '../store';

const StyledDropdown = styled(Dropdown)`
  div[data-radix-popper-content-wrapper] {
    z-index: 20 !important;
  }
`;

const MATCHES_FIELDS = [
  { key: 'status', label: 'Status' },
  { key: 'participants', label: 'Participants' },
  { key: 'created', label: 'Created' },
  { key: 'last_activity', label: 'Last Activity' },
];

export function MatchesTable({ list, matchList }) {
  const { selectedMatch, selectMatch, deselectMatch } = useGlobalState();
  const [fields, setFields] = useState(MATCHES_FIELDS);
  return (
    <>
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead className="w-[100px]">Selected</TableHead>
            {fields.map(({ key, label }) => (
              <TableHead key={key} className="w-[100px]">
                {label}
              </TableHead>
            ))}
          </TableRow>
        </TableHeader>
        {isEmpty(matchList?.results) ? (
          <Text className="p-4 w-full" center>
            No results.
          </Text>
        ) : (
          <TableBody>
            {matchList?.results.map(match => (
              <TableRow key={match.id}>
                <TableCell className="w-20">
                  <input
                    type="checkbox"
                    checked={Object.keys(selectedMatch).includes(user.hash)}
                    className="checkbox ml-2"
                    onChange={() => {
                      if (Object.keys(selectedMatch).includes(user.hash)) {
                        deselectMatch(match.id);
                      } else {
                        selectMatch(match);
                      }
                    }}
                  />
                </TableCell>
                {fields.map(({ key }) => {
                  if (key === 'participants') {
                    return (
                      <TableCell key={match.hash + key}>
                        <Link to={`/user/${user.id}`}>
                          <UserImage
                            alt={'user profile image'}
                            user={user.profile}
                            dimensions={{
                              height: 32,
                              width: 32,
                            }}
                          />
                        </Link>
                      </TableCell>
                    );
                  }

                  if (key.includes('matches.'))
                    return (
                      <TableCell key={user.hash + key}>
                        {/*<MatchesIcons matches={get(user, key).items} />*/}
                      </TableCell>
                    );
                  return (
                    <TableCell key={user.hash + key}>
                      {get(user, key)}
                    </TableCell>
                  );
                })}
              </TableRow>
            ))}
          </TableBody>
        )}
      </Table>
      {/* {<SelectedMatchSheet />} */}
    </>
  );
}

export function Matches() {
  let [searchParams, setSearchParams] = useSearchParams();
  const list = searchParams.get('list') || 'all';
  const { filterOptions, isLoading: filtersLoading } = useFilterOptions();

  const { matchList, isLoading: usersLoading } = useUserListData(
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
