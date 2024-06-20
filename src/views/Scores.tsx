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
import { burstUpdateMatchingScores } from '../api/index';

export const TaskMonitorComponent = ({ task_id, finishedCallback }) => {

  const fetcher = (...args) => fetch(...args).then(res => res.json());
  const { data, error, mutate, isLoading } = useSWR(`/api/admin/tasks/${task_id}/status/`, fetcher, { refreshInterval: 1000 })

  if (error) return <div>failed to load</div>
  if (isLoading) return <div>loading...</div>


  let progressInfo = null
  console.log("INFO", data.info)
  if (data && data?.info && data.info.progress) {
    progressInfo = data.info.progress
    console.log("MANGED TO PARSE", progressInfo);
  }

  if (data && data?.state && data.state === "SUCCESS") {
    console.log("FINISHED")
    finishedCallback();
  }

  return <div className='flex flex-row flex-grow rounded-xl content-center justify-center'>
    {data?.state && <div className='bg-base-300 p-1 rounded-xl'>{data.state}</div>}
    {progressInfo && <div className='flex h-full flex-col items-start content-start justify-start w-52'>
      <div className='text-xs'>{progressInfo.progress}/{progressInfo.total_considered_users}</div>
      <progress className="progress progress-primary w-full" value={progressInfo.progress} max={progressInfo.total_considered_users}></progress>
    </div>}
    {progressInfo && <div className='p-1 bg-success'>
      {progressInfo.state}
    </div>}
  </div>
}

const StyledDropdown = styled(Dropdown)`
  div[data-radix-popper-content-wrapper] {
    z-index: 20 !important;
  }
`;

function MatchingDialog({
  matchingDialogOpen,
  setMatchingDialogOpen
}) {
  return <Dialog open={matchingDialogOpen} onOpenChange={setMatchingDialogOpen}>
    <DialogContent className='z-140 max-w-full w-[1000px]'>
      <DialogHeader>
        <DialogTitle>Do you want to perform a matching for these users?</DialogTitle>
        <Matching />
      </DialogHeader>
    </DialogContent>
  </Dialog>
}

function BurstUpdateDialog({
  burstUpdateDialogOpen,
  setBurstUpdateDialogOpen
}) {
  const [taskIds, setTaskIds] = useState([]);
  return <Dialog open={burstUpdateDialogOpen} onOpenChange={setBurstUpdateDialogOpen}>
    <DialogContent className='z-140 max-w-full w-[1000px]'>
      <DialogHeader>
        <DialogTitle>Do you want to perform a burst update for these users?</DialogTitle>
        <Button appearance={ButtonAppearance.Secondary} onClick={() => {
          console.log("BURST UPDATE")
          burstUpdateMatchingScores({ parallel_tasks: 10 }).then((results) => {
            //TODO: returns the task ID's so a progress monitor should be displayed
            console.log("BURST UPDATE RESULTS", results);
            setTaskIds(results.task_ids);
          });
        }}>Burst Update Scores</Button>
        {JSON.stringify(taskIds)}
      </DialogHeader>
    </DialogContent>
  </Dialog>
}

export function Scores() {
  let [searchParams, setSearchParams] = useSearchParams();
  const [matchingDialogOpen, setMatchingDialogOpen] = useState(false);
  const [burstUpdateDialogOpen, setBurstUpdateDialogOpen] = useState(false);

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
      <MatchingDialog matchingDialogOpen={matchingDialogOpen} setMatchingDialogOpen={setMatchingDialogOpen} />
      <BurstUpdateDialog burstUpdateDialogOpen={burstUpdateDialogOpen} setBurstUpdateDialogOpen={setBurstUpdateDialogOpen} />
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
            <Button appearance={ButtonAppearance.Secondary} onClick={() => {
              setBurstUpdateDialogOpen(true);
            }}>
              Burst Update Scores
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
