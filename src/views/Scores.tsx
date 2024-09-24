import {
  Button,
  ButtonAppearance,
  Card,
  CardHeader,
  CardSizes,
  Dropdown,
  Modal,
  ProgressBar,
  Text,
} from '@a-little-world/little-world-design-system';
import React, { useEffect, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { createSearchParams } from 'react-router-dom';
import styled from 'styled-components';
import useSWR from 'swr';

import { burstUpdateMatchingScores, getTaskStatus } from '../api/index';
import Pagination from '../atoms/Pagination';
import { ScoresTable } from '../blocks/ScoresTable';
import { formatTime } from '../helpers/date';
import {
  dataFetcher,
  useGlobalState,
  useScoresFilterOptions,
  useScoresListData,
} from '../store';
import Matching from '../views/Matching';

export const TaskMonitorComponent = ({ task_id, finishedCallback }) => {
  const fetcher = (...args) => fetch(...args).then(res => res.json());
  const { data, error, mutate, isLoading } = useSWR(
    `/api/admin/tasks/${task_id}/status/`,
    fetcher,
    { refreshInterval: 1000 },
  );

  if (error) return <div>failed to load</div>;
  if (isLoading) return <div>loading...</div>;

  let progressInfo = null;
  console.log('INFO', data.info);
  if (data && data?.info && data.info.progress) {
    progressInfo = data.info.progress;
    console.log('MANGED TO PARSE', progressInfo);
  }

  if (data && data?.state && data.state === 'SUCCESS') {
    console.log('FINISHED');
    finishedCallback();
  }

  return (
    <div className="flex flex-row flex-grow rounded-xl content-center justify-center">
      {data?.state && (
        <div className="bg-base-300 p-1 rounded-xl">{data.state}</div>
      )}
      {progressInfo && (
        <div className="flex h-full flex-col items-start content-start justify-start w-52">
          <div className="text-xs">
            {progressInfo.progress}/{progressInfo.total_considered_users}
          </div>
          <progress
            className="progress progress-primary w-full"
            value={progressInfo.progress}
            max={progressInfo.total_considered_users}
          />
        </div>
      )}
      {progressInfo && (
        <div className="p-1 bg-success">{progressInfo.state}</div>
      )}
    </div>
  );
};

const StyledDropdown = styled(Dropdown)`
  div[data-radix-popper-content-wrapper] {
    z-index: 20 !important;
  }
`;

function MatchingDialog({
  open,
  onClose,
  onMatch,
  score,
}: {
  open: boolean;
  onClose: () => void;
  onMatch: () => void;
  score: any;
}) {
  return (
    <Modal open={open} onClose={onClose}>
      <Card height={'100%'}>
        <CardHeader>Match users?</CardHeader>
        <Matching
          preCalculatedScoreData={score}
          onMatch={() => {
            onMatch();
          }}
        />
      </Card>
    </Modal>
  );
}

function BurstUpdateDialog({
  open,
  onClose,
  burstMatchingState,
  taskIds,
  setTaskIds,
}) {
  const activeScoreCalculation = burstMatchingState?.active || true;
  const [isSubmitting, setIsSubmitting] = useState(false);

  return (
    <Modal open={open} onClose={onClose}>
      <Card width={CardSizes.Medium}>
        <CardHeader>
          Do you want to perform a burst update for these users?
        </CardHeader>

        <Button
          disabled={isSubmitting}
          appearance={ButtonAppearance.Primary}
          onClick={() => {
            setIsSubmitting(true);
            burstUpdateMatchingScores({ parallel_tasks: 10 }).then(results => {
              //TODO: returns the task ID's so a progress monitor should be displayed
              console.log('BURST UPDATE RESULTS', results);
              onClose();
              setIsSubmitting(false);
              setTaskIds(results.task_ids);
            });
          }}
        >
          Burst Update Scores
        </Button>
        <Text>{taskIds?.map(task => task)}</Text>
      </Card>
    </Modal>
  );
}

export function Scores() {
  let [searchParams, setSearchParams] = useSearchParams();
  const { clearMatching } = useGlobalState();

  // Score calculation
  const [burstUpdateDialogOpen, setBurstUpdateDialogOpen] = useState(false);
  const [burstTasks, setBurstTasks] = useState([]);
  const [burstProgress, setBurstProgress] = useState(0);

  const {
    data: burstMatchingState,
    error,
    mutate: mutateBurstUpdateState,
    isLoading: burstLoading,
  } = useSWR(`/api/matching/get_active_burst_calculation/`, dataFetcher, {
    refreshInterval: 1000,
  });
  const activeScoreCalculation = burstMatchingState?.active;

  console.log({ burstMatchingState, error, burstLoading });

  // Quick matching
  const [selectedMatch, setSelectedMatch] = useState(null);

  // Score api lookup
  const { isLoading: filtersLoading } = useScoresFilterOptions();
  const [scoresUpdated, setScoresUpdated] = useState(new Date());

  const {
    scoresList,
    isLoading: scoresLoading,
    mutate,
  } = useScoresListData(createSearchParams(searchParams));

  const changeList = (value: string) => {
    searchParams.set('current_match_suggestion', value);
    setSearchParams(searchParams);
  };

  // useEffect(() => {
  //   if (burstMatchingState?.active) {
  //     if (isEmpty(burstTasks)) setBurstTasks(burstMatchingState.tasks);
  //     burstTasks?.forEach(taskId =>
  //       getTaskStatus({
  //         taskId,
  //         onSuccess: res => console.log({ res }),
  //         onError: error => console.log({ error }),
  //       }),
  //     );
  //   }
  // }, [burstTasks, burstMatchingState?.active]);

  const scoresUpdating =
    activeScoreCalculation || burstLoading || scoresLoading;

  useEffect(() => {
    clearMatching();
  }, []);

  return (
    <>
      <MatchingDialog
        open={!!selectedMatch}
        onClose={() => {
          clearMatching();
          setSelectedMatch(null);
        }}
        onMatch={mutate}
        score={selectedMatch}
      />
      <BurstUpdateDialog
        burstMatchingState={burstMatchingState}
        open={burstUpdateDialogOpen}
        onClose={() => setBurstUpdateDialogOpen(false)}
        taskIds={burstTasks}
        setTaskIds={setBurstTasks}
      />
      <div className="flex w-full gap-2 p-4 align-center z-100 justify-center items-center">
        {filtersLoading ? (
          'Loading filters...'
        ) : (
          <div className="w-full flex items-center w-full gap-4 justify-between flex-wrap">
            <StyledDropdown
              value={searchParams.get('current_match_suggestion') ?? 'false'}
              options={[
                { label: 'All Scores', value: 'false' },
                {
                  label: 'Optimised Matches',
                  value: 'true',
                },
              ]}
              onValueChange={changeList}
              placeholder="Select a score list..."
              cannotError
            />
            <Button
              disabled={scoresUpdating}
              onClick={() => {
                setBurstUpdateDialogOpen(true);
              }}
              backgroundColor={scoresUpdating ? 'gray' : undefined}
            >
              {scoresUpdating ? 'Scores updating...' : 'Update Scores'}
            </Button>
            {scoresUpdated && (
              <Text>Scores Updated at {formatTime(scoresUpdated)}</Text>
            )}
            <Pagination list={scoresList} />
            {/* <ProgressBar max={burstTasks.length} value={burstProgress} /> */}
          </div>
        )}
      </div>

      <ScoresTable
        loading={scoresLoading}
        scoresList={scoresList?.results ?? []}
        onMatchClick={score => {
          console.log({ score });
          setSelectedMatch(score);
        }}
      />
    </>
  );
}

export default Scores;
