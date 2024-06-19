import {
  Button,
  ButtonAppearance,
  Dropdown,
  Text,
} from '@a-little-world/little-world-design-system';
import React, { useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { createSearchParams } from 'react-router-dom';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "../shadcnui/ui/dialog";
import Matching from "../views/Matching";
import styled from 'styled-components';

import Pagination from '../atoms/Pagination';
import { ScoresTable } from '../blocks/ScoresTable';
import { formatTime } from '../helpers/date';
import { useScoresFilterOptions, useScoresListData } from '../store';


const StyledDropdown = styled(Dropdown)`
  div[data-radix-popper-content-wrapper] {
    z-index: 20 !important;
  }
`;

export function Scores() {
  let [searchParams, setSearchParams] = useSearchParams();
  const [matchingDialogOpen, setMatchingDialogOpen] = useState(false);

  const { isLoading: filtersLoading } = useScoresFilterOptions();
  const [scoresUpdated, setScoresUpdated] = useState(new Date());

  const {
    scoresList,
    isLoading: scoresLoading,
    mutate,
  } = useScoresListData(createSearchParams(searchParams));

  const changeList = (value: string) => {
    setSearchParams(
      createSearchParams({ ...searchParams, current_match_suggestion: value }),
    );
  };

  const onUpdate = () => {
    mutate().then(() => setScoresUpdated(new Date()));
  };
  console.log({ scoresList });
  return (
    <>
      <Dialog open={matchingDialogOpen} onOpenChange={setMatchingDialogOpen}>
        <DialogContent className='z-140 max-w-full w-[1000px]'>
          <DialogHeader>
            <DialogTitle>Do you want to perform a matching for these users?</DialogTitle>
            <Matching />
          </DialogHeader>
        </DialogContent>
      </Dialog>
      <div className="flex w-full overflow-scroll gap-2 p-2.5 align-center z-100 justify-center items-center">
        {filtersLoading ? (
          'Loading filters...'
        ) : (
          <div className="w-full flex items-center w-full gap-4 p-4 justify-between flex-wrap">
            <StyledDropdown
              value={'false'}
              options={[
                { label: 'All Scores', value: 'false' },
                {
                  label: 'Optimised Matches',
                  value: 'true',
                },
              ]}
              onValueChange={val => changeList(val)}
              placeholder="Select a score list..."
              cannotError
            />
            <Button appearance={ButtonAppearance.Secondary} onClick={onUpdate}>
              Update Scores
            </Button>
            {scoresUpdated && (
              <Text>Scores Updated at {formatTime(scoresUpdated)}</Text>
            )}
            <Pagination list={scoresList} />
          </div>
        )}
      </div>
      {(!scoresLoading && scoresList?.results?.length === 0) && (
        <Text>No scores found</Text>
      )}
      {(scoresLoading && scoresList?.results?.length > 0) ? (
        `Loading scores...`
      ) : (
        <ScoresTable scoresList={scoresList} openMatchingDialog={setMatchingDialogOpen} />
      )}
    </>
  );
}

export default Scores;
