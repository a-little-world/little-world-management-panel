import {
  Loading,
  LoadingSizes,
  Select,
  StatusMessage,
  StatusTypes,
  Text,
  TextTypes,
} from '@a-little-world/little-world-design-system';
import { format } from 'date-fns';
import React, { useMemo } from 'react';
import { useSearchParams } from 'react-router-dom';
import styled, { useTheme } from 'styled-components';
import useSWR from 'swr';

import {
  ADMIN_COURSES_ENDPOINT,
  AdminCourseList,
  fetchAdminCourses,
  fetchAdminCourseStats,
} from '../../../api/courses';
import { DatePicker } from '../../atoms/DatePicker';
import {
  ListPanel,
  ListScroll,
  NoResultsContainer,
  PageContainer,
  PageHeader,
  Title,
} from '../../atoms/PageLayout';
import Stat, { StatCards } from '../../atoms/stats/Stat';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '../../atoms/Table';

// ---------------------------------------------------------------------------
// Styled components
// ---------------------------------------------------------------------------

const FiltersRow = styled.div`
  display: flex;
  flex-wrap: wrap;
  align-items: flex-end;
  gap: ${({ theme }) => theme.spacing.small};
  padding-bottom: ${({ theme }) => theme.spacing.medium};
  border-bottom: 1px solid ${({ theme }) => theme.color.border.subtle};
`;

const DropOffBadge = styled.span<{ $high: boolean }>`
  display: inline-flex;
  align-items: center;
  padding: 2px 8px;
  border-radius: 999px;
  font-size: 0.75rem;
  font-weight: 600;
  background: ${({ $high, theme }) =>
    $high ? `${theme.color.surface.error}` : `${theme.color.surface.tertiary}`};
  color: ${({ $high, theme }) =>
    $high ? `${theme.color.text.error}` : `${theme.color.text.secondary}`};
`;

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

function parseDateParam(value: string | null): Date | null {
  if (!value) return null;
  const parsed = new Date(`${value}T00:00:00`);
  return Number.isNaN(parsed.getTime()) ? null : parsed;
}

// ---------------------------------------------------------------------------
// Component
// ---------------------------------------------------------------------------

function CourseStats() {
  const theme = useTheme();
  const [searchParams, setSearchParams] = useSearchParams();

  const selectedSlug = searchParams.get('course_slug') || '';
  const startDate = parseDateParam(searchParams.get('start_date'));
  const endDate = parseDateParam(searchParams.get('end_date'));

  const { data: coursesData, isLoading: coursesLoading } =
    useSWR<AdminCourseList>(
      `${ADMIN_COURSES_ENDPOINT}?page_size=100`,
      () => fetchAdminCourses('page_size=100'),
      {
        revalidateOnFocus: false,
      },
    );

  const courseOptions = useMemo(
    () =>
      (coursesData?.results ?? []).map(c => ({
        label: c.title,
        value: c.slug,
      })),
    [coursesData],
  );

  const statsQueryString = useMemo(() => {
    const p = new URLSearchParams();
    if (searchParams.get('start_date'))
      p.set('start_date', searchParams.get('start_date')!);
    if (searchParams.get('end_date'))
      p.set('end_date', searchParams.get('end_date')!);
    return p.toString();
  }, [searchParams]);

  const {
    data: stats,
    isLoading: statsLoading,
    error: statsError,
  } = useSWR(
    selectedSlug
      ? [`/api/admin/courses/${selectedSlug}/stats/`, statsQueryString]
      : null,
    ([, qs]) => fetchAdminCourseStats(selectedSlug, qs),
    { revalidateOnFocus: true, revalidateOnMount: true },
  );

  const updateParam = (key: string, value?: string) => {
    const next = new URLSearchParams(searchParams);
    if (!value) {
      next.delete(key);
    } else {
      next.set(key, value);
    }
    setSearchParams(next);
  };

  const onDateChange = (key: 'start_date' | 'end_date', value: Date | null) =>
    updateParam(key, value ? format(value, 'yyyy-MM-dd') : undefined);

  return (
    <PageContainer>
      <PageHeader>
        <Title>Course stats</Title>
      </PageHeader>

      <FiltersRow>
        <Select
          id="course-stats-course"
          label="Course"
          value={selectedSlug || 'all'}
          options={[
            { label: 'Select a course…', value: 'all' },
            ...courseOptions,
          ]}
          onValueChange={val =>
            updateParam('course_slug', val === 'all' ? undefined : val)
          }
          placeholder="Select a course…"
          cannotError
          maxWidth="280px"
          disabled={coursesLoading}
        />
        <DatePicker
          label="Start"
          date={startDate}
          setDate={date => onDateChange('start_date', date)}
        />
        <DatePicker
          label="End"
          date={endDate}
          setDate={date => onDateChange('end_date', date)}
        />
      </FiltersRow>

      {statsError && (
        <StatusMessage type={StatusTypes.Error} visible>
          Failed to load course stats.
        </StatusMessage>
      )}

      {!selectedSlug && (
        <NoResultsContainer>
          <Text type={TextTypes.Body4} color={theme.color.text.secondary}>
            Select a course above to view its stats.
          </Text>
        </NoResultsContainer>
      )}

      {selectedSlug && (statsLoading || !stats) ? (
        <NoResultsContainer>
          <Loading size={LoadingSizes.Medium} />
        </NoResultsContainer>
      ) : (
        stats && (
          <>
            <StatCards>
              <Stat label="Total started" stat={stats.total_started} />
              <Stat label="Total completed" stat={stats.total_completed} />
              <Stat
                label="Completion rate"
                stat={`${stats.completion_rate}%`}
              />
              <Stat
                label="Avg days to complete"
                stat={
                  stats.avg_days_to_complete !== null
                    ? `${stats.avg_days_to_complete}`
                    : '—'
                }
              />
            </StatCards>

            <ListPanel>
              <ListScroll>
                {stats.chapter_funnel.length === 0 ? (
                  <NoResultsContainer>
                    <Text
                      type={TextTypes.Body4}
                      color={theme.color.text.secondary}
                    >
                      This course has no chapters yet.
                    </Text>
                  </NoResultsContainer>
                ) : (
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>#</TableHead>
                        <TableHead>Chapter</TableHead>
                        <TableHead className="text-right">Steps</TableHead>
                        <TableHead className="text-right">Reached</TableHead>
                        <TableHead className="text-right">
                          Currently here
                        </TableHead>
                        <TableHead className="text-right">
                          Still on chapter
                        </TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {stats.chapter_funnel.map((row, i) => (
                        <TableRow key={row.chapter_id}>
                          <TableCell
                            style={{
                              color: theme.color.text.secondary,
                              width: '2rem',
                            }}
                          >
                            {i + 1}
                          </TableCell>
                          <TableCell>{row.title}</TableCell>
                          <TableCell className="text-right">
                            {row.step_count}
                          </TableCell>
                          <TableCell className="text-right">
                            {row.reached}
                          </TableCell>
                          <TableCell className="text-right">
                            {row.currently_here}
                          </TableCell>
                          <TableCell className="text-right">
                            <DropOffBadge $high={row.drop_off_pct >= 25}>
                              {row.drop_off_pct}%
                            </DropOffBadge>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                )}
              </ListScroll>
            </ListPanel>
          </>
        )
      )}
    </PageContainer>
  );
}

export default CourseStats;
