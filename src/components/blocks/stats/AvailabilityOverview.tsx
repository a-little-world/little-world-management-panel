import React, { useMemo, useRef, useState } from 'react';
import { Bar, BarChart, CartesianGrid, Cell, XAxis, YAxis } from 'recharts';
import styled from 'styled-components';
import useSWR from 'swr';

import {
  Loading,
  LoadingSizes,
  Switch,
} from '@a-little-world/little-world-design-system';
import { dataFetcher } from '../../../store';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '../../atoms/Card';
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
} from '../../atoms/Chart';

const DAY_LABELS: Record<string, string> = {
  mo: 'Mon',
  tu: 'Tue',
  we: 'Wed',
  th: 'Thu',
  fr: 'Fri',
  sa: 'Sat',
  su: 'Sun',
};

const SLOT_LABELS: Record<string, string> = {
  '08_10': '08:00-10:00',
  '10_12': '10:00-12:00',
  '12_14': '12:00-14:00',
  '14_16': '14:00-16:00',
  '16_18': '16:00-18:00',
  '18_20': '18:00-20:00',
  '20_22': '20:00-22:00',
};

const DAYS = ['mo', 'tu', 'we', 'th', 'fr', 'sa', 'su'];
const SLOTS = ['08_10', '10_12', '12_14', '14_16', '16_18', '18_20', '20_22'];

const DAY_COLORS: Record<string, string> = {
  mo: 'hsl(220, 70%, 50%)',
  tu: 'hsl(160, 60%, 45%)',
  we: 'hsl(40, 80%, 50%)',
  th: 'hsl(280, 60%, 55%)',
  fr: 'hsl(0, 65%, 55%)',
  sa: 'hsl(180, 55%, 45%)',
  su: 'hsl(340, 65%, 55%)',
};

const VOLUNTEER_COLOR = 'hsl(220, 70%, 50%)';
const LEARNER_COLOR = 'hsl(280, 60%, 55%)';

// Rank-based shades for Most popular slots (most frequent = darkest, least = lightest)
const BLUE_SHADES = [
  'hsl(220, 70%, 38%)',
  'hsl(220, 70%, 42%)',
  'hsl(220, 70%, 46%)',
  'hsl(220, 70%, 50%)',
  'hsl(220, 70%, 52%)',
  'hsl(220, 70%, 54%)',
  'hsl(220, 70%, 56%)',
  'hsl(220, 70%, 58%)',
  'hsl(220, 70%, 60%)',
  'hsl(220, 70%, 62%)',
  'hsl(220, 70%, 64%)',
  'hsl(220, 70%, 66%)',
  'hsl(220, 70%, 68%)',
  'hsl(220, 70%, 70%)',
  'hsl(220, 70%, 72%)',
];
const PURPLE_SHADES = [
  'hsl(280, 65%, 38%)',
  'hsl(280, 65%, 42%)',
  'hsl(280, 65%, 46%)',
  'hsl(280, 65%, 50%)',
  'hsl(280, 65%, 52%)',
  'hsl(280, 65%, 54%)',
  'hsl(280, 65%, 56%)',
  'hsl(280, 65%, 58%)',
  'hsl(280, 65%, 60%)',
  'hsl(280, 65%, 62%)',
  'hsl(280, 65%, 64%)',
  'hsl(280, 65%, 66%)',
  'hsl(280, 65%, 68%)',
  'hsl(280, 65%, 70%)',
  'hsl(280, 65%, 72%)',
];
const RED_SHADES = [
  'hsl(0, 70%, 38%)',
  'hsl(0, 70%, 42%)',
  'hsl(0, 70%, 46%)',
  'hsl(0, 70%, 50%)',
  'hsl(0, 70%, 52%)',
  'hsl(0, 70%, 54%)',
  'hsl(0, 70%, 56%)',
  'hsl(0, 70%, 58%)',
  'hsl(0, 70%, 60%)',
  'hsl(0, 70%, 62%)',
  'hsl(0, 70%, 64%)',
  'hsl(0, 70%, 66%)',
  'hsl(0, 70%, 68%)',
  'hsl(0, 70%, 70%)',
  'hsl(0, 70%, 72%)',
];

// Purple and red shades per day for split-by-user-type Overview chart (dark Mon → bright Sun)
const VOLUNTEER_DAY_SHADES: Record<string, string> = {
  mo: 'hsl(280, 65%, 38%)',
  tu: 'hsl(280, 65%, 44%)',
  we: 'hsl(280, 65%, 50%)',
  th: 'hsl(280, 65%, 54%)',
  fr: 'hsl(280, 65%, 58%)',
  sa: 'hsl(280, 65%, 62%)',
  su: 'hsl(280, 65%, 68%)',
};
const LEARNER_DAY_SHADES: Record<string, string> = {
  mo: 'hsl(0, 70%, 38%)',
  tu: 'hsl(0, 70%, 44%)',
  we: 'hsl(0, 70%, 50%)',
  th: 'hsl(0, 70%, 54%)',
  fr: 'hsl(0, 70%, 58%)',
  sa: 'hsl(0, 70%, 62%)',
  su: 'hsl(0, 70%, 68%)',
};

type SlotData = { name: string; frequency: number; day: string; fill: string };
type TopSlotData = { name: string; frequency: number; fill: string };
type GroupedSlotData = {
  name: string;
  volunteer: number;
  learner: number;
  frequency: number;
  day: string;
  volunteerFill: string;
  learnerFill: string;
};

function transformCountsToChartData(
  counts: Record<string, Record<string, number>> | undefined,
): SlotData[] {
  if (!counts) return [];
  const data: SlotData[] = [];
  for (const day of DAYS) {
    for (const slot of SLOTS) {
      const count = counts[day]?.[slot] ?? 0;
      const dayLabel = DAY_LABELS[day] ?? day;
      const slotLabel = SLOT_LABELS[slot] ?? slot;
      data.push({
        name: `${dayLabel}\u00A0${slotLabel}`,
        frequency: count,
        day: dayLabel,
        fill: DAY_COLORS[day] ?? 'hsl(0, 0%, 60%)',
      });
    }
  }
  return data;
}

function transformCountsToGroupedChartData(
  countsVolunteer: Record<string, Record<string, number>> | undefined,
  countsLearner: Record<string, Record<string, number>> | undefined,
): GroupedSlotData[] {
  if (!countsVolunteer || !countsLearner) return [];
  const data: GroupedSlotData[] = [];
  for (const day of DAYS) {
    for (const slot of SLOTS) {
      const vol = countsVolunteer[day]?.[slot] ?? 0;
      const ler = countsLearner[day]?.[slot] ?? 0;
      const dayLabel = DAY_LABELS[day] ?? day;
      const slotLabel = SLOT_LABELS[slot] ?? slot;
      data.push({
        name: `${dayLabel}\u00A0${slotLabel}`,
        volunteer: vol,
        learner: ler,
        frequency: vol + ler,
        day: dayLabel,
        volunteerFill: VOLUNTEER_DAY_SHADES[day] ?? 'hsl(280, 65%, 50%)',
        learnerFill: LEARNER_DAY_SHADES[day] ?? 'hsl(0, 70%, 50%)',
      });
    }
  }
  return data;
}

const chartConfig = {
  frequency: { label: 'Frequency' },
  volunteer: { label: 'Volunteer', color: VOLUNTEER_COLOR },
  learner: { label: 'Learner', color: LEARNER_COLOR },
  ...Object.fromEntries(
    DAYS.map(d => [
      DAY_LABELS[d],
      { label: DAY_LABELS[d], color: DAY_COLORS[d] },
    ]),
  ),
};

const LegendWrapper = styled.div`
  display: flex;
  flex-wrap: wrap;
  gap: 1rem;
  margin-top: 1rem;
  justify-content: center;
`;

const LegendRow = styled.div`
  display: flex;
  align-items: center;
  gap: 0.5rem;
  flex-wrap: wrap;
  font-size: 0.875rem;
`;

const LegendItem = styled.div`
  display: flex;
  align-items: center;
  gap: 0.5rem;
  font-size: 0.875rem;
`;

const LegendSwatch = styled.span<{ $color: string }>`
  width: 12px;
  height: 12px;
  border-radius: 2px;
  background-color: ${({ $color }) => $color};
`;

const Wrapper = styled.div`
  padding: ${({ theme }) => theme.spacing.medium};
  display: flex;
  flex-direction: column;
  gap: ${({ theme }) => theme.spacing.medium};
`;

const ChartHeaderRow = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  flex-wrap: wrap;
  gap: 0.5rem;
`;

const LoadingContainer = styled.div`
  display: flex;
  align-items: center;
  justify-content: center;
  min-height: 400px;
`;

const ChartsSideBySide = styled.div`
  display: flex;
  gap: ${({ theme }) => theme.spacing.medium};
  flex-wrap: wrap;

  @media (min-width: 768px) {
    flex-wrap: nowrap;
  }
`;

const HalfChartWrapper = styled.div`
  flex: 1;
  min-width: 280px;
`;

const ChartSubtitle = styled.div`
  font-size: 0.875rem;
  font-weight: 500;
  margin-bottom: 0.5rem;
`;

function getTopSlots(chartData: SlotData[], limit: number): TopSlotData[] {
  return [...chartData]
    .filter(d => d.frequency > 0)
    .sort((a, b) => b.frequency - a.frequency)
    .slice(0, limit)
    .map((d, i) => ({
      name: d.name,
      frequency: d.frequency,
      fill: BLUE_SHADES[Math.min(i, BLUE_SHADES.length - 1)],
    }));
}

function getTopSlotsVolunteer(
  groupedData: GroupedSlotData[],
  limit: number,
): TopSlotData[] {
  return [...groupedData]
    .filter(d => d.volunteer > 0)
    .sort((a, b) => b.volunteer - a.volunteer)
    .slice(0, limit)
    .map((d, i) => ({
      name: d.name,
      frequency: d.volunteer,
      fill: PURPLE_SHADES[Math.min(i, PURPLE_SHADES.length - 1)],
    }));
}

function getTopSlotsLearner(
  groupedData: GroupedSlotData[],
  limit: number,
): TopSlotData[] {
  return [...groupedData]
    .filter(d => d.learner > 0)
    .sort((a, b) => b.learner - a.learner)
    .slice(0, limit)
    .map((d, i) => ({
      name: d.name,
      frequency: d.learner,
      fill: RED_SHADES[Math.min(i, RED_SHADES.length - 1)],
    }));
}

const AvailabilityOverview = () => {
  const topSlotsSwitchRef = useRef<HTMLButtonElement>(null);
  const overviewSwitchRef = useRef<HTMLButtonElement>(null);
  const [splitByUserTypeTopSlots, setSplitByUserTypeTopSlots] = useState(false);
  const [splitByUserTypeOverview, setSplitByUserTypeOverview] = useState(false);

  const { data, isLoading } = useSWR(
    '/api/matching/users/statistics/time_slot_counts/',
    dataFetcher,
  );

  const chartData = useMemo(
    () => transformCountsToChartData(data?.counts),
    [data?.counts],
  );

  const groupedChartData = useMemo(
    () =>
      transformCountsToGroupedChartData(
        data?.counts_by_user_type?.volunteer,
        data?.counts_by_user_type?.learner,
      ),
    [data?.counts_by_user_type],
  );

  const topSlotsData = useMemo(() => getTopSlots(chartData, 15), [chartData]);
  const topSlotsVolunteer = useMemo(
    () => getTopSlotsVolunteer(groupedChartData, 15),
    [groupedChartData],
  );
  const topSlotsLearner = useMemo(
    () => getTopSlotsLearner(groupedChartData, 15),
    [groupedChartData],
  );
  const displayChartData = splitByUserTypeOverview
    ? groupedChartData
    : chartData;

  const hasNoGroupedData =
    (splitByUserTypeTopSlots &&
      topSlotsVolunteer.length === 0 &&
      topSlotsLearner.length === 0) ||
    (splitByUserTypeOverview && displayChartData.length === 0);
  const missingApiSupport =
    hasNoGroupedData && !data?.counts_by_user_type && chartData.length > 0;

  return (
    <Wrapper>
      <Card center={false}>
        <CardHeader>
          <ChartHeaderRow>
            <div>
              <CardTitle>Most popular slots</CardTitle>
              <CardDescription>Top 15 most popular time slots.</CardDescription>
            </div>
            <Switch
              inputRef={topSlotsSwitchRef as React.RefObject<HTMLButtonElement>}
              label="Split by user type"
              labelInline
              checked={splitByUserTypeTopSlots}
              onCheckedChange={setSplitByUserTypeTopSlots}
            />
          </ChartHeaderRow>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <LoadingContainer>
              <Loading size={LoadingSizes.Large} inline={false} />
            </LoadingContainer>
          ) : missingApiSupport ? (
            <div
              style={{
                padding: '2rem',
                textAlign: 'center',
                color: 'var(--color-muted)',
              }}
            >
              Split by user type requires the latest API. The backend may not be
              returning <code>counts_by_user_type</code>. Check the browser
              console for debug info.
            </div>
          ) : splitByUserTypeTopSlots ? (
            <ChartsSideBySide>
              <HalfChartWrapper>
                <ChartSubtitle>Volunteers</ChartSubtitle>
                <ChartContainer
                  config={{
                    ...chartConfig,
                    frequency: { label: 'Volunteers' },
                  }}
                  className="h-[400px] w-full"
                >
                  <BarChart
                    layout="vertical"
                    accessibilityLayer
                    data={topSlotsVolunteer}
                    margin={{ top: 5, right: 30, left: 130, bottom: 5 }}
                  >
                    <CartesianGrid horizontal={false} />
                    <XAxis type="number" tickLine axisLine />
                    <YAxis
                      type="category"
                      dataKey="name"
                      width={120}
                      tickLine={false}
                      axisLine={false}
                      tick={{ fontSize: 12 }}
                    />
                    <ChartTooltip
                      cursor={false}
                      content={<ChartTooltipContent />}
                    />
                    <Bar dataKey="frequency" radius={[0, 4, 4, 0]}>
                      {topSlotsVolunteer.map((entry, index) => (
                        <Cell key={index} fill={entry.fill} />
                      ))}
                    </Bar>
                  </BarChart>
                </ChartContainer>
              </HalfChartWrapper>
              <HalfChartWrapper>
                <ChartSubtitle>Learners</ChartSubtitle>
                <ChartContainer
                  config={{ ...chartConfig, frequency: { label: 'Learners' } }}
                  className="h-[400px] w-full"
                >
                  <BarChart
                    layout="vertical"
                    accessibilityLayer
                    data={topSlotsLearner}
                    margin={{ top: 5, right: 30, left: 130, bottom: 5 }}
                  >
                    <CartesianGrid horizontal={false} />
                    <XAxis type="number" tickLine axisLine />
                    <YAxis
                      type="category"
                      dataKey="name"
                      width={120}
                      tickLine={false}
                      axisLine={false}
                      tick={{ fontSize: 12 }}
                    />
                    <ChartTooltip
                      cursor={false}
                      content={<ChartTooltipContent />}
                    />
                    <Bar dataKey="frequency" radius={[0, 4, 4, 0]}>
                      {topSlotsLearner.map((entry, index) => (
                        <Cell key={index} fill={entry.fill} />
                      ))}
                    </Bar>
                  </BarChart>
                </ChartContainer>
              </HalfChartWrapper>
            </ChartsSideBySide>
          ) : (
            <>
              <ChartContainer config={chartConfig} className="h-[400px] w-full">
                <BarChart
                  layout="vertical"
                  accessibilityLayer
                  data={topSlotsData}
                  margin={{ top: 5, right: 30, left: 130, bottom: 5 }}
                >
                  <CartesianGrid horizontal={false} />
                  <XAxis type="number" tickLine axisLine />
                  <YAxis
                    type="category"
                    dataKey="name"
                    width={120}
                    tickLine={false}
                    axisLine={false}
                    tick={{ fontSize: 12 }}
                  />
                  <ChartTooltip
                    cursor={false}
                    content={<ChartTooltipContent />}
                  />
                  <Bar dataKey="frequency" radius={[0, 4, 4, 0]}>
                    {topSlotsData.map((entry, index) => (
                      <Cell key={index} fill={entry.fill} />
                    ))}
                  </Bar>
                </BarChart>
              </ChartContainer>
            </>
          )}
        </CardContent>
      </Card>
      <Card center={false}>
        <CardHeader>
          <ChartHeaderRow>
            <CardTitle>Availability Overview</CardTitle>
            <Switch
              inputRef={overviewSwitchRef as React.RefObject<HTMLButtonElement>}
              label="Split by user type"
              labelInline
              checked={splitByUserTypeOverview}
              onCheckedChange={setSplitByUserTypeOverview}
            />
          </ChartHeaderRow>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <LoadingContainer>
              <Loading size={LoadingSizes.Large} inline={false} />
            </LoadingContainer>
          ) : missingApiSupport ? (
            <div
              style={{
                padding: '2rem',
                textAlign: 'center',
                color: 'var(--color-muted)',
              }}
            >
              Split by user type requires the latest API. The backend may not be
              returning <code>counts_by_user_type</code>. Check the browser
              console for debug info.
            </div>
          ) : (
            <>
              <ChartContainer config={chartConfig} className="h-[400px] w-full">
                <BarChart
                  accessibilityLayer
                  data={displayChartData}
                  margin={{ top: 10, right: 10, left: 10, bottom: 80 }}
                >
                  <CartesianGrid vertical={false} />
                  <XAxis
                    dataKey="name"
                    tickLine
                    axisLine
                    angle={-45}
                    textAnchor="end"
                    interval={0}
                    tick={{ fontSize: 10 }}
                  />
                  <YAxis dataKey="frequency" tickLine axisLine />
                  <ChartTooltip
                    cursor={false}
                    content={<ChartTooltipContent />}
                  />
                  {splitByUserTypeOverview ? (
                    <>
                      <Bar
                        dataKey="volunteer"
                        fill={VOLUNTEER_COLOR}
                        radius={[4, 4, 0, 0]}
                        name="Volunteer"
                      >
                        {(displayChartData as GroupedSlotData[]).map(
                          (entry, index) => (
                            <Cell
                              key={`vol-${index}`}
                              fill={entry.volunteerFill}
                            />
                          ),
                        )}
                      </Bar>
                      <Bar
                        dataKey="learner"
                        fill={LEARNER_COLOR}
                        radius={[4, 4, 0, 0]}
                        name="Learner"
                      >
                        {(displayChartData as GroupedSlotData[]).map(
                          (entry, index) => (
                            <Cell
                              key={`ler-${index}`}
                              fill={entry.learnerFill}
                            />
                          ),
                        )}
                      </Bar>
                    </>
                  ) : (
                    <Bar dataKey="frequency" radius={[4, 4, 0, 0]}>
                      {chartData.map((entry, index) => (
                        <Cell key={index} fill={entry.fill} />
                      ))}
                    </Bar>
                  )}
                </BarChart>
              </ChartContainer>
              {splitByUserTypeOverview ? (
                <LegendWrapper>
                  <LegendRow>
                    <span style={{ fontWeight: 500, marginRight: '0.5rem' }}>
                      Volunteer:
                    </span>
                    {DAYS.map(day => (
                      <LegendItem key={day}>
                        <LegendSwatch $color={VOLUNTEER_DAY_SHADES[day]} />
                        {DAY_LABELS[day]}
                      </LegendItem>
                    ))}
                  </LegendRow>
                  <LegendRow>
                    <span style={{ fontWeight: 500, marginRight: '0.5rem' }}>
                      Learner:
                    </span>
                    {DAYS.map(day => (
                      <LegendItem key={`ler-${day}`}>
                        <LegendSwatch $color={LEARNER_DAY_SHADES[day]} />
                        {DAY_LABELS[day]}
                      </LegendItem>
                    ))}
                  </LegendRow>
                </LegendWrapper>
              ) : (
                <LegendWrapper>
                  {DAYS.map(day => (
                    <LegendItem key={day}>
                      <LegendSwatch $color={DAY_COLORS[day]} />
                      {DAY_LABELS[day]}
                    </LegendItem>
                  ))}
                </LegendWrapper>
              )}
            </>
          )}
        </CardContent>
      </Card>
    </Wrapper>
  );
};

export default AvailabilityOverview;
