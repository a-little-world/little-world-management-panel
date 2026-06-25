import {
  Tag,
  TagAppearance,
  TagSizes,
  Text,
  TextTypes,
} from '@a-little-world/little-world-design-system';
import React from 'react';
import styled from 'styled-components';

import { useTheme } from 'styled-components';
import { BLUE_40, LANGUAGES, ORANGE_10, ORANGE_40 } from '../../../constants';
import { formatDate } from '../../../helpers/date';

type WeeklyActivity = {
  week: number;
  start_at: string;
  end_at: string;
  messages: number;
  video_calls: number;
  is_current_week: boolean;
  is_free_play_week: boolean;
};

const JourneyGrid = styled.div`
  display: flex;
  flex-direction: column;
  gap: ${({ theme }) => theme.spacing.medium};
`;

const PanelCard = styled.div`
  background: ${({ theme }) => theme.color.surface.primary};
  border: 1px solid ${({ theme }) => theme.color.border.subtle};
  border-radius: ${({ theme }) => theme.radius.small};
  padding: ${({ theme }) => theme.spacing.small};
`;

const SummaryGrid = styled.div`
  display: grid;
  grid-template-columns: minmax(220px, 0.7fr) minmax(0, 1.3fr);
  gap: ${({ theme }) => theme.spacing.xsmall};

  @media (max-width: ${({ theme }) => theme.breakpoints.medium}) {
    grid-template-columns: minmax(0, 1fr);
  }
`;

const SummaryCard = styled.div`
  background: ${({ theme }) => theme.color.surface.secondary};
  border: 1px solid ${({ theme }) => theme.color.border.subtle};
  border-radius: ${({ theme }) => theme.radius.xsmall};
  padding: ${({ theme }) => theme.spacing.xsmall};
  gap: ${({ theme }) => theme.spacing.xxsmall};
  display: flex;
  flex-direction: column;
`;

const SummaryContent = styled.div`
  display: flex;
  flex-direction: column;
  gap: ${({ theme }) => theme.spacing.xsmall};
`;

const SummaryMeta = styled.div`
  display: flex;
  flex-direction: column;
  gap: ${({ theme }) => theme.spacing.xxxsmall};
`;

const WeekMetrics = styled.div`
  display: flex;
  flex-wrap: wrap;
  gap: ${({ theme }) => theme.spacing.medium};
`;

const WeekMetric = styled.div`
  display: flex;
  flex-direction: column;
  gap: ${({ theme }) => theme.spacing.xxxsmall};
`;

const BadgeRow = styled.div`
  display: flex;
  flex-wrap: wrap;
  gap: ${({ theme }) => theme.spacing.xxsmall};
`;

const WeeklyGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(190px, 1fr));
  gap: ${({ theme }) => theme.spacing.xsmall};
`;

const WeekCard = styled.div<{ $isCurrentWeek: boolean }>`
  border: 1px solid
    ${({ $isCurrentWeek, theme }) =>
      $isCurrentWeek ? theme.color.border.selected : theme.color.border.subtle};
  border-radius: ${({ theme }) => theme.radius.xsmall};
  padding: ${({ theme }) => theme.spacing.xsmall};
  background: ${({ $isCurrentWeek, theme }) =>
    $isCurrentWeek ? theme.color.surface.accent : theme.color.surface.primary};
`;

const NoActivityCard = styled(WeekCard)`
  border-style: dashed;
  background: ${({ theme }) => theme.color.surface.error};
  display: flex;
  align-items: center;
  justify-content: center;
  text-align: center;
`;

const WeekHeader = styled.div`
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  gap: ${({ theme }) => theme.spacing.xxsmall};
  margin-bottom: ${({ theme }) => theme.spacing.xxsmall};
`;

const ActivityRows = styled.div`
  display: flex;
  flex-direction: column;
  gap: ${({ theme }) => theme.spacing.xxsmall};
`;

const ActivityRow = styled.div`
  display: grid;
  grid-template-columns: 72px minmax(0, 1fr) 28px;
  align-items: center;
  gap: ${({ theme }) => theme.spacing.xxsmall};
`;

const ActivityTrack = styled.div`
  height: ${({ theme }) => theme.spacing.xxxsmall};
  border-radius: ${({ theme }) => theme.radius.xxsmall};
  background: ${({ theme }) => theme.color.surface.secondary};
  overflow: hidden;
`;

const ActivityBar = styled.div<{
  $value: number;
  $max: number;
  $activity: 'messages' | 'video';
}>`
  width: ${({ $value, $max }) => `${Math.round(($value / $max) * 100)}%`};
  min-width: ${({ $value }) => ($value > 0 ? '4px' : '0')};
  height: 100%;
  border-radius: ${({ theme }) => theme.radius.xxsmall};
  background: ${({ $activity }) =>
    $activity === 'messages' ? BLUE_40 : ORANGE_40};
`;

const EmptyState = styled.div`
  border: 1px dashed ${({ theme }) => theme.color.border.moderate};
  border-radius: ${({ theme }) => theme.radius.xsmall};
  padding: ${({ theme }) => theme.spacing.small};
  text-align: center;
`;

const StreakRows = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(160px, 1fr));
  gap: ${({ theme }) => theme.spacing.xsmall};
`;

const StreakRow = styled.div`
  display: flex;
  flex-direction: column;
  gap: ${({ theme }) => theme.spacing.xxxsmall};
  border: 1px solid ${({ theme }) => theme.color.border.subtle};
  border-radius: ${({ theme }) => theme.radius.xsmall};
  padding: ${({ theme }) => theme.spacing.xsmall};
  background: ${({ theme }) => theme.color.surface.primary};
`;

const StreakStats = styled.div`
  display: flex;
  align-items: baseline;
  justify-content: space-between;
  gap: ${({ theme }) => theme.spacing.xxsmall};
`;

const ActivityPanelHeader = styled.div`
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  gap: ${({ theme }) => theme.spacing.small};
  margin-bottom: ${({ theme }) => theme.spacing.small};

  @media (max-width: ${({ theme }) => theme.breakpoints.medium}) {
    flex-direction: column;
  }
`;

const ActivityIntro = styled.div`
  display: flex;
  flex-direction: column;
  gap: ${({ theme }) => theme.spacing.xxxsmall};
`;

const LastActivityNotice = styled.div`
  border: 1px solid ${({ theme }) => theme.color.border.subtle};
  border-radius: ${({ theme }) => theme.radius.xsmall};
  padding: ${({ theme }) => theme.spacing.xxsmall}
    ${({ theme }) => theme.spacing.xsmall};
  background: ${ORANGE_10};
  color: ${ORANGE_40};
`;

const pluralizeWeeks = (count: number) =>
  `${count} ${count === 1 ? 'week' : 'weeks'}`;

const formatWeekRange = (week: WeeklyActivity) =>
  `${formatDate(new Date(week.start_at), 'dd MMM yy', LANGUAGES.en)} - ${formatDate(
    new Date(week.end_at),
    'dd MMM yy',
    LANGUAGES.en,
  )}`;

const formatBestRun = (startWeek: number | null, endWeek: number | null) => {
  if (startWeek === null || endWeek === null) {
    return 'No streak yet';
  }

  if (startWeek === endWeek) {
    return `Week ${startWeek}`;
  }

  return `Weeks ${startWeek} to ${endWeek}`;
};

const getStreakStats = (
  weeklyActivity: WeeklyActivity[],
  predicate: (week: WeeklyActivity) => boolean,
  currentWeek: number,
) => {
  const elapsedWeeks = weeklyActivity
    .filter(week => week.week <= currentWeek)
    .sort((a, b) => a.week - b.week);
  let runningRecord = 0;
  let record = 0;
  let recordStartWeek: number | null = null;
  let recordEndWeek: number | null = null;
  let runningStartWeek: number | null = null;

  elapsedWeeks.forEach(week => {
    if (predicate(week)) {
      if (runningRecord === 0) {
        runningStartWeek = week.week;
      }
      runningRecord += 1;
      if (runningRecord > record) {
        record = runningRecord;
        recordStartWeek = runningStartWeek;
        recordEndWeek = week.week;
      }
      return;
    }

    runningRecord = 0;
    runningStartWeek = null;
  });

  let current = 0;
  for (let i = elapsedWeeks.length - 1; i >= 0; i--) {
    const week = elapsedWeeks[i];
    if (predicate(week)) {
      current += 1;
      continue;
    }

    break;
  }

  return { current, record, recordStartWeek, recordEndWeek };
};

const hasActivity = (week: WeeklyActivity) =>
  week.messages > 0 || week.video_calls > 0;

const getVisibleWeeklyActivity = (
  weeklyActivity: WeeklyActivity[],
  desiredDurationWeeks: number,
) => {
  const lastActivityWeek = weeklyActivity.reduce(
    (lastWeek, week) => (hasActivity(week) ? week.week : lastWeek),
    0,
  );
  const lastVisibleWeek = Math.max(desiredDurationWeeks, lastActivityWeek);

  return {
    lastActivityWeek,
    weeks: weeklyActivity.filter(week => week.week <= lastVisibleWeek),
    nextInactiveWeek: weeklyActivity.find(week => week.week > lastVisibleWeek),
    hiddenTrailingWeeks: weeklyActivity.filter(
      week => week.week > lastVisibleWeek,
    ).length,
  };
};

const StreakSummaryRow = ({
  label,
  current,
  record,
  recordStartWeek,
  recordEndWeek,
}: {
  label: string;
  current: number;
  record: number;
  recordStartWeek: number | null;
  recordEndWeek: number | null;
}) => (
  <StreakRow>
    <Text type={TextTypes.Body7} bold>
      {label}
    </Text>
    <StreakStats>
      <div>
        <Text type={TextTypes.Body7}>Current</Text>
        <Text type={TextTypes.Body4} bold>
          {current}
        </Text>
      </div>
      <div>
        <Text type={TextTypes.Body7}>Record</Text>
        <Text type={TextTypes.Body4} bold>
          {record}
        </Text>
      </div>
    </StreakStats>
    <Text type={TextTypes.Body7}>
      {record > 0
        ? `Best run: ${pluralizeWeeks(record)} in a row (${formatBestRun(
            recordStartWeek,
            recordEndWeek,
          )})`
        : 'No streak yet'}
    </Text>
  </StreakRow>
);

const MatchJourney = ({ match }: { match: any }) => {
  const theme = useTheme();
  const weeklyActivity: WeeklyActivity[] =
    match?.journey?.weekly_activity ?? [];
  const currentWeek = match?.journey?.current_week ?? 1;
  const desiredDurationWeeks = match?.journey?.desired_duration_weeks ?? 10;
  const maxActivity = Math.max(
    1,
    ...weeklyActivity.flatMap(week => [week.messages, week.video_calls]),
  );
  const messageStreak = getStreakStats(
    weeklyActivity,
    week => week.messages > 0,
    currentWeek,
  );
  const videoCallStreak = getStreakStats(
    weeklyActivity,
    week => week.video_calls > 0,
    currentWeek,
  );
  const activeStreak = getStreakStats(
    weeklyActivity,
    week => week.messages > 0 || week.video_calls > 0,
    currentWeek,
  );
  const {
    lastActivityWeek,
    weeks: visibleWeeklyActivity,
    nextInactiveWeek,
    hiddenTrailingWeeks,
  } = getVisibleWeeklyActivity(weeklyActivity, desiredDurationWeeks);

  return (
    <JourneyGrid>
      <SummaryGrid>
        <SummaryCard>
          <SummaryContent>
            <SummaryMeta>
              <WeekMetrics>
                <WeekMetric>
                  <Text type={TextTypes.Body7}>Current week</Text>
                  <Text type={TextTypes.Body4} bold>
                    Week {currentWeek}
                  </Text>
                </WeekMetric>
                <WeekMetric>
                  <Text type={TextTypes.Body7}>Last week of activity</Text>
                  <Text type={TextTypes.Body4} bold>
                    {lastActivityWeek > 0 ? `Week ${lastActivityWeek}` : 'None'}
                  </Text>
                </WeekMetric>
              </WeekMetrics>
              <Text type={TextTypes.Body7}>
                Planned journey: {desiredDurationWeeks} weeks
              </Text>
              <Text type={TextTypes.Body7}>
                Created:{' '}
                {formatDate(
                  new Date(match.created_at),
                  'dd MMM yy',
                  LANGUAGES.en,
                )}
              </Text>
            </SummaryMeta>
            <BadgeRow>
              {match.journey?.is_free_play && (
                <Tag
                  appearance={TagAppearance.filled}
                  size={TagSizes.small}
                  color={theme.color.status.info}
                >
                  Free play
                </Tag>
              )}
              {match.completed_off_plattform && (
                <Tag
                  appearance={TagAppearance.success}
                  size={TagSizes.small}
                  bold
                >
                  Completed off-platform
                </Tag>
              )}
            </BadgeRow>
          </SummaryContent>
        </SummaryCard>
        <SummaryCard>
          <Text type={TextTypes.Body7}>Weekly streaks</Text>
          <StreakRows>
            <StreakSummaryRow
              label="Messages"
              current={messageStreak.current}
              record={messageStreak.record}
              recordStartWeek={messageStreak.recordStartWeek}
              recordEndWeek={messageStreak.recordEndWeek}
            />
            <StreakSummaryRow
              label="Video calls"
              current={videoCallStreak.current}
              record={videoCallStreak.record}
              recordStartWeek={videoCallStreak.recordStartWeek}
              recordEndWeek={videoCallStreak.recordEndWeek}
            />
            <StreakSummaryRow
              label="Any activity"
              current={activeStreak.current}
              record={activeStreak.record}
              recordStartWeek={activeStreak.recordStartWeek}
              recordEndWeek={activeStreak.recordEndWeek}
            />
          </StreakRows>
        </SummaryCard>
      </SummaryGrid>
      <PanelCard>
        <ActivityPanelHeader>
          <ActivityIntro>
            <Text type={TextTypes.Body4} bold>
              Weekly Activity
            </Text>
            <Text type={TextTypes.Body6}>
              Messages and mutual video calls grouped by week since this match
              was created.
            </Text>
          </ActivityIntro>
          {hiddenTrailingWeeks > 0 && lastActivityWeek > 0 && (
            <LastActivityNotice>
              <Text type={TextTypes.Body7} tag="span" bold>
                Last week of activity: week {lastActivityWeek}. Empty weeks
                after that are hidden.
              </Text>
            </LastActivityNotice>
          )}
        </ActivityPanelHeader>
        {weeklyActivity.length === 0 ? (
          <EmptyState>
            <Text type={TextTypes.Body6}>
              No weekly activity available yet.
            </Text>
          </EmptyState>
        ) : (
          <WeeklyGrid>
            {visibleWeeklyActivity.map(week => (
              <WeekCard key={week.week} $isCurrentWeek={week.is_current_week}>
                <WeekHeader>
                  <div>
                    <Text type={TextTypes.Body6} bold>
                      Week {week.week}
                    </Text>
                    <Text type={TextTypes.Body7}>{formatWeekRange(week)}</Text>
                  </div>
                  <BadgeRow>
                    {week.is_current_week && (
                      <Tag
                        appearance={TagAppearance.success}
                        size={TagSizes.small}
                        bold
                      >
                        Current
                      </Tag>
                    )}
                    {week.is_free_play_week && (
                      <Tag
                        appearance={TagAppearance.filled}
                        size={TagSizes.small}
                        color={theme.color.status.info}
                      >
                        Free play
                      </Tag>
                    )}
                  </BadgeRow>
                </WeekHeader>
                <ActivityRows>
                  <ActivityRow>
                    <Text type={TextTypes.Body7}>Messages</Text>
                    <ActivityTrack>
                      <ActivityBar
                        $activity="messages"
                        $value={week.messages}
                        $max={maxActivity}
                      />
                    </ActivityTrack>
                    <Text type={TextTypes.Body7} bold>
                      {week.messages}
                    </Text>
                  </ActivityRow>
                  <ActivityRow>
                    <Text type={TextTypes.Body7}>Calls</Text>
                    <ActivityTrack>
                      <ActivityBar
                        $activity="video"
                        $value={week.video_calls}
                        $max={maxActivity}
                      />
                    </ActivityTrack>
                    <Text type={TextTypes.Body7} bold>
                      {week.video_calls}
                    </Text>
                  </ActivityRow>
                </ActivityRows>
              </WeekCard>
            ))}
            {hiddenTrailingWeeks > 0 && lastActivityWeek > 0 && (
              <NoActivityCard $isCurrentWeek={false}>
                <WeekHeader>
                  <div>
                    <Text type={TextTypes.Body6} bold>
                      No activity since Week {lastActivityWeek}
                    </Text>
                    {nextInactiveWeek && (
                      <Text type={TextTypes.Body7}>
                        From{' '}
                        {formatDate(
                          new Date(nextInactiveWeek.start_at),
                          'dd MMM yy',
                          LANGUAGES.en,
                        )}
                      </Text>
                    )}
                  </div>
                </WeekHeader>
              </NoActivityCard>
            )}
          </WeeklyGrid>
        )}
      </PanelCard>
    </JourneyGrid>
  );
};

export default MatchJourney;
