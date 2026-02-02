import {
  Button,
  ButtonAppearance,
  Card,
  CardHeader,
  CardSizes,
  Dropdown,
  Modal,
  Popover,
  ProgressBar,
  StatusMessage,
  StatusTypes,
  Text,
} from '@a-little-world/little-world-design-system';
import React, { useEffect, useMemo, useState } from 'react';
import { createSearchParams, useSearchParams } from 'react-router-dom';
import styled from 'styled-components';
import useSWR from 'swr';

import { burstUpdateMatchingScores } from '../../api/index';
import { formatTime } from '../../helpers/date';
import {
  dataFetcher,
  useGlobalState,
  useScoresFilterOptions,
  useScoresListData,
} from '../../store';
import Pagination from '../atoms/Pagination';
import { ScoresTable } from '../blocks/ScoresTable';
import Matching from './Matching';

interface BurstMatchingState {
  active: boolean;
  tasks?: BurstCalculationTask[];
}

interface BurstCalculationTask {
  state: string;
  info?: TaskProgressInfo | TaskResultInfo;
}

/** Running task: Celery sends progress under info.progress */
interface TaskProgressInfo {
  progress?: TaskProgress;
}

/** Completed task (SUCCESS): Celery sends return value directly as info */
interface TaskResultInfo {
  total_combinations?: number;
  combinations_processed?: number;
}

interface TaskProgress {
  total_combinations: number;
  combinations_processed: number;
}

function isRunningTask(
  task: BurstCalculationTask,
): task is BurstCalculationTask & { state: 'STARTED'; info: TaskProgressInfo } {
  return task.state === 'STARTED' && !!getTaskProgress(task);
}

/** Returns { total, processed } for any task (running or completed). Completed tasks count as 100% done. */
function getTaskProgress(
  task: BurstCalculationTask,
): { total: number; processed: number } | null {
  if (!task.info || typeof task.info !== 'object') return null;
  const info = task.info as Record<string, unknown>;
  const progress = info.progress as TaskProgress | undefined;
  const total =
    progress?.total_combinations ??
    (info.total_combinations as number | undefined);
  const processed =
    task.state === 'SUCCESS'
      ? (total ?? (info.combinations_processed as number | undefined))
      : (progress?.combinations_processed ??
        (info.combinations_processed as number | undefined));
  if (total == null || processed == null) return null;
  return {
    total,
    processed: task.state === 'SUCCESS' ? total : processed,
  };
}

/** Overall progress across all burst tasks (0–100). Completed tasks contribute 100% so progress never resets. */
function getBurstProgressPercent(
  tasks: BurstCalculationTask[] | undefined,
): number {
  if (!tasks?.length) return 0;
  let totalWork = 0;
  let totalDone = 0;
  for (const task of tasks) {
    const p = getTaskProgress(task);
    if (p) {
      totalWork += p.total;
      totalDone += p.processed;
    }
  }
  return totalWork === 0 ? 0 : (totalDone / totalWork) * 100;
}

function useBurstCalculation() {
  const { data, isLoading } = useSWR<BurstMatchingState>(
    `/api/matching/get_active_burst_calculation/`,
    dataFetcher,
    {
      refreshInterval: (data: BurstMatchingState | undefined) =>
        data?.active ? 1000 : 0,
    },
  );
  return {
    burstMatchingState: data,
    burstLoading: isLoading,
    isUpdating: data?.active ?? false,
    progressPercent: getBurstProgressPercent(data?.tasks),
  };
}

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
  setTaskIds,
}: {
  open: boolean;
  onClose: () => void;
  taskIds: string[];
  setTaskIds: (ids: string[]) => void;
}) {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!open) setError(null);
  }, [open]);

  return (
    <Modal open={open} onClose={onClose}>
      <Card width={CardSizes.Medium}>
        <CardHeader>
          Do you want to perform a burst update for these users?
        </CardHeader>

        {error && (
          <StatusMessage type={StatusTypes.Error} visible>
            {error}
          </StatusMessage>
        )}

        <Button
          disabled={isSubmitting}
          appearance={ButtonAppearance.Primary}
          onClick={() => {
            setError(null);
            setIsSubmitting(true);
            burstUpdateMatchingScores({
              parallel_tasks: 20,
              onSuccess: results => {
                const ids = Array.isArray(results)
                  ? results
                  : (results?.task_ids ?? []);
                setTaskIds(ids.map(String));
                onClose();
                setIsSubmitting(false);
              },
              onError: err => {
                setIsSubmitting(false);
                setError(
                  err?.message ??
                    'Failed to start score calculation. Please try again.',
                );
              },
            });
          }}
        >
          Burst Update Scores
        </Button>
      </Card>
    </Modal>
  );
}

export function Scores() {
  let [searchParams, setSearchParams] = useSearchParams();
  const { clearMatching } = useGlobalState();

  const [burstUpdateDialogOpen, setBurstUpdateDialogOpen] = useState(false);
  const [burstTaskIds, setBurstTaskIds] = useState<string[]>([]);
  const {
    burstMatchingState,
    burstLoading,
    isUpdating: scoresUpdating,
    progressPercent: scoreCalculationProgress,
  } = useBurstCalculation();

  const [selectedMatch, setSelectedMatch] = useState(null);

  const { isLoading: filtersLoading } = useScoresFilterOptions();

  const {
    scoresList,
    isLoading: scoresLoading,
    mutate,
  } = useScoresListData(createSearchParams(searchParams));

  const scoresUpdatedAt = useMemo(() => {
    const first = scoresList?.results?.[0];
    const date = first?.latest_update;
    return date ? new Date(date) : null;
  }, [scoresList?.results]);

  const changeList = (value: string) => {
    if (value === 'current_suggestion') {
      searchParams.set('current_match_suggestion', 'true');
      searchParams.delete('matchable');
    } else if (value === 'matchable_scores') {
      searchParams.set('matchable', 'true');
      searchParams.delete('current_match_suggestion');
    } else {
      searchParams.delete('current_match_suggestion');
      searchParams.delete('matchable');
    }
    setSearchParams(searchParams);
  };

  useEffect(() => {
    clearMatching();
  }, []);

  const currentDropdownValue =
    searchParams.get('current_match_suggestion') === 'true'
      ? 'current_suggestion'
      : searchParams.get('matchable') === 'true'
        ? 'matchable_scores'
        : 'all_scores';

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
        open={burstUpdateDialogOpen}
        onClose={() => setBurstUpdateDialogOpen(false)}
        setTaskIds={setBurstTaskIds}
      />
      <div className="flex w-full gap-2 p-4 align-center z-100 justify-center items-center">
        {filtersLoading ? (
          'Loading filters...'
        ) : (
          <div className="w-full flex items-center gap-4 justify-between flex-wrap">
            <StyledDropdown
              value={currentDropdownValue}
              options={[
                { label: 'All Scores', value: 'all_scores' },
                {
                  label: 'Optimised Matches',
                  value: 'current_suggestion',
                },
                {
                  label: 'Matchable Scores',
                  value: 'matchable_scores',
                },
              ]}
              onValueChange={changeList}
              placeholder="Select a score list..."
              cannotError
            />
            <Popover
              trigger={
                <Button
                  disabled={burstLoading || scoresLoading}
                  onClick={() => {
                    if (!scoresUpdating) {
                      setBurstUpdateDialogOpen(true);
                    }
                  }}
                >
                  {scoresUpdating
                    ? `Scores updating... ${scoreCalculationProgress.toFixed(1)}%`
                    : 'Update Scores'}
                </Button>
              }
            >
              {burstMatchingState?.tasks?.length ? (
                burstMatchingState.tasks.map((task, i) => {
                  const p = getTaskProgress(task);
                  return (
                    <div key={`${task.state}-${i}`}>
                      {p ? (
                        <ProgressBar max={p.total} value={p.processed} />
                      ) : (
                        <div>{task.state}</div>
                      )}
                    </div>
                  );
                })
              ) : (
                <Text>No active tasks</Text>
              )}
            </Popover>
            {scoresUpdatedAt ? (
              <Text>Scores updated at {formatTime(scoresUpdatedAt)}</Text>
            ) : null}
            <Pagination list={scoresList} />
          </div>
        )}
      </div>

      <ScoresTable
        loading={scoresLoading}
        scoresList={scoresList?.results ?? []}
        onMatchClick={setSelectedMatch}
      />
    </>
  );
}

export default Scores;
