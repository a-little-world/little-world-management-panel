import {
  Button,
  ButtonAppearance,
  Card,
  CardHeader,
  CardSizes,
  Select,
  Modal,
  Popover,
  ProgressBar,
  StatusMessage,
  StatusTypes,
  Text,
} from '@a-little-world/little-world-design-system';
import React, { useEffect, useMemo, useRef, useState } from 'react';
import { createSearchParams, useSearchParams } from 'react-router-dom';
import styled from 'styled-components';
import useSWR from 'swr';

import {
  burstUpdateMatchingScores,
  clearActiveBurstCalculation,
} from '../../api/index';
import { LANGUAGES } from '../../constants';
import { formatDate, formatTime } from '../../helpers/date';
import {
  dataFetcher,
  useFilterOptions,
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
  const { data, isLoading, mutate } = useSWR<BurstMatchingState>(
    '/api/matching/get_active_burst_calculation/',
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
    revalidateBurst: mutate,
  };
}

const StyledDropdown = styled(Select)`
  div[data-radix-popper-content-wrapper] {
    z-index: 20 !important;
  }
`;

const ScoresToolbarWrapper = styled.div`
  display: flex;
  width: 100%;
  gap: 0.5rem;
  padding: ${({ theme }) => theme.spacing.small};
  align-items: center;
  justify-content: center;
  z-index: 100;
`;

const ScoresToolbarInner = styled.div`
  width: 100%;
  display: flex;
  align-items: flex-end;
  gap: ${({ theme }) => theme.spacing.small};
  justify-content: space-between;
  flex-wrap: wrap;
`;

const ScoresFiltersRow = styled.div`
  display: flex;
  align-items: center;
  gap: ${({ theme }) => theme.spacing.small};
`;

const ProgressTaskItem = styled.div``;

const ScoresToolbarActions = styled.div`
  display: flex;
  align-items: flex-end;
  gap: ${({ theme }) => theme.spacing.medium};
  flex-wrap: wrap;
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
  onBurstStarted,
  scoringList,
}: {
  open: boolean;
  onClose: () => void;
  setTaskIds: (ids: string[]) => void;
  onBurstStarted?: () => void;
  scoringList: string;
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
              parallel_tasks: 40,
              scoring_list: scoringList,
              onSuccess: results => {
                const ids = Array.isArray(results)
                  ? results
                  : (results?.task_ids ?? []);
                setTaskIds(ids.map(String));
                onBurstStarted?.();
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

function ForceResetWarningDialog({
  open,
  onClose,
  onForceReset,
  isSubmitting,
}: {
  open: boolean;
  onClose: () => void;
  onForceReset: () => void;
  isSubmitting: boolean;
}) {
  return (
    <Modal open={open} onClose={onClose}>
      <Card width={CardSizes.Medium}>
        <CardHeader>Not all tasks could be cleared</CardHeader>
        <Text>
          There might still be running and pending tasks. Press the button below
          to forcefully try stopping them.
        </Text>
        <Text>
          This can affect ongoing and pending tasks, so only use this if really
          required.
        </Text>
        <Button
          appearance={ButtonAppearance.Primary}
          disabled={isSubmitting}
          onClick={onForceReset}
        >
          Force Stop Remaining Tasks
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
    revalidateBurst,
  } = useBurstCalculation();

  const [selectedMatch, setSelectedMatch] = useState(null);
  const [scoringList, setScoringList] = useState<string>('default');
  const [forceResetWarningOpen, setForceResetWarningOpen] = useState(false);
  const [isForceClearing, setIsForceClearing] = useState(false);

  const { isLoading: filtersLoading } = useScoresFilterOptions();
  const { filterOptions: userFilterOptions } = useFilterOptions();

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

  const wasUpdatingRef = useRef(scoresUpdating);
  useEffect(() => {
    if (wasUpdatingRef.current && !scoresUpdating) {
      mutate();
    }
    wasUpdatingRef.current = scoresUpdating;
  }, [scoresUpdating, mutate]);

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
        onBurstStarted={revalidateBurst}
        scoringList={scoringList}
      />
      <ForceResetWarningDialog
        open={forceResetWarningOpen}
        onClose={() => setForceResetWarningOpen(false)}
        isSubmitting={isForceClearing}
        onForceReset={() => {
          setIsForceClearing(true);
          clearActiveBurstCalculation({
            force: true,
            onSuccess: () => {
              setIsForceClearing(false);
              setForceResetWarningOpen(false);
              revalidateBurst();
            },
            onError: err => {
              setIsForceClearing(false);
              console.error('Force clear burst calculation failed:', err);
            },
          });
        }}
      />
      <ScoresToolbarWrapper>
        {filtersLoading ? (
          'Loading filters...'
        ) : (
          <ScoresToolbarInner>
            <ScoresFiltersRow>
              <StyledDropdown
                label="User list"
                value={scoringList}
                options={[
                  { label: 'Default', value: 'default' },
                  ...(userFilterOptions?.lists?.map(
                    ({ name, description }: any) => ({
                      value: name,
                      label: description,
                    }),
                  ) ?? []),
                ]}
                onValueChange={setScoringList}
                placeholder="Select a scoring list..."
                cannotError
              />
              <StyledDropdown
                label="Score type"
                value={currentDropdownValue}
                maxWidth="200px"
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
            </ScoresFiltersRow>

            <ScoresToolbarActions>
              {scoresUpdatedAt ? (
                <Text>
                  Scores updated at{' '}
                  {formatDate(scoresUpdatedAt, 'LLLL do', LANGUAGES.en)} at{' '}
                  {formatTime(scoresUpdatedAt)}
                </Text>
              ) : null}
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
                      <ProgressTaskItem key={`${task.state}-${i}`}>
                        {p ? (
                          <ProgressBar max={p.total} value={p.processed} />
                        ) : (
                          <div>{task.state}</div>
                        )}
                      </ProgressTaskItem>
                    );
                  })
                ) : (
                  <Text>No active tasks</Text>
                )}
              </Popover>

              <Button
                appearance={ButtonAppearance.Secondary}
                disabled={!scoresUpdating || burstLoading}
                onClick={() => {
                  clearActiveBurstCalculation({
                    onSuccess: revalidateBurst,
                    onError: err => {
                      if (err?.status === 400) {
                        setForceResetWarningOpen(true);
                        return;
                      }
                      console.error('Clear burst calculation failed:', err);
                    },
                  });
                }}
              >
                Reset
              </Button>
              <Pagination list={scoresList} />
            </ScoresToolbarActions>
          </ScoresToolbarInner>
        )}
      </ScoresToolbarWrapper>

      <ScoresTable
        loading={scoresLoading}
        scoresList={scoresList?.results ?? []}
        onMatchClick={setSelectedMatch}
      />
    </>
  );
}

export default Scores;
