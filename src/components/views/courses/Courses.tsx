import {
  Button,
  ButtonAppearance,
  ButtonSizes,
  Loading,
  LoadingSizes,
  StatusMessage,
  StatusTypes,
  Tag,
  TagAppearance,
} from '@a-little-world/little-world-design-system';
import { format } from 'date-fns';
import React from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import useSWR from 'swr';

import {
  ADMIN_COURSES_ENDPOINT,
  fetchAdminCourses,
} from '../../../api/courses';
import { getCourseEditRoute } from '../../../router/routes';
import {
  Description,
  ListPanel,
  ListScroll,
  PageContainer,
  PageHeader,
} from '../../atoms/PageLayout';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '../../atoms/Table';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../../atoms/Tabs';
import { FiltersToolbar } from '../../blocks/FiltersToolbar';
import { usePageHeader } from '../../blocks/LayoutHeaderContext';
import CourseStats from './CourseStats';

const AUDIENCE_LABELS: Record<string, string> = {
  all: 'All',
  learner: 'Learner',
  volunteer: 'Volunteer',
};

function ManageCourses() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams({ page_size: '50' });
  const { data, error, isLoading } = useSWR(
    [ADMIN_COURSES_ENDPOINT, searchParams.toString()] as const,
    ([, queryString]) => fetchAdminCourses(queryString),
    { revalidateOnFocus: true, revalidateOnMount: true },
  );
  const courses = data?.results ?? [];

  usePageHeader({
    actions: (
      <Button
        appearance={ButtonAppearance.Primary}
        size={ButtonSizes.Small}
        onClick={() => navigate(getCourseEditRoute('new'))}
      >
        Create course
      </Button>
    ),
  });

  return (
    <PageContainer>
      <PageHeader>
        <Description>
          Manage courses, workshops, and walkthroughs available to users.
        </Description>
      </PageHeader>

      {error && (
        <StatusMessage type={StatusTypes.Error} visible>
          Failed to load courses.
        </StatusMessage>
      )}

      {courses?.length > 10 && (
        <FiltersToolbar
          paginationList={data}
          isLoading={isLoading}
          loadingText="Loading courses..."
        />
      )}

      <ListPanel>
        <ListScroll>
          {isLoading ? (
            <div style={{ padding: '1rem 1.25rem' }}>
              <Loading size={LoadingSizes.Medium} />
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Title</TableHead>
                  <TableHead>Slug</TableHead>
                  <TableHead className="w-24 text-center">Chapters</TableHead>
                  <TableHead className="w-28 text-center">Audience</TableHead>
                  <TableHead className="w-28 text-center">Status</TableHead>
                  <TableHead className="w-32">Created</TableHead>
                  <TableHead className="w-[5.5rem] text-center">Edit</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {courses.map(course => (
                  <TableRow key={course.id}>
                    <TableCell>{course.title}</TableCell>
                    <TableCell>
                      <code style={{ fontSize: '0.8rem' }}>{course.slug}</code>
                    </TableCell>
                    <TableCell className="text-center">
                      {course.chapter_count}
                    </TableCell>
                    <TableCell className="text-center">
                      {AUDIENCE_LABELS[course.available_to] ??
                        course.available_to}
                    </TableCell>
                    <TableCell className="text-center">
                      <Tag
                        appearance={
                          course.is_active
                            ? TagAppearance.success
                            : TagAppearance.error
                        }
                      >
                        {course.is_active ? 'Active' : 'Inactive'}
                      </Tag>
                    </TableCell>
                    <TableCell
                      style={{ fontSize: '0.8125rem', whiteSpace: 'nowrap' }}
                    >
                      {format(new Date(course.created_at), 'd MMM yyyy')}
                    </TableCell>
                    <TableCell className="text-center">
                      <Button
                        appearance={ButtonAppearance.Secondary}
                        size={ButtonSizes.Small}
                        onClick={() =>
                          navigate(getCourseEditRoute(course.slug))
                        }
                      >
                        Edit
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
                {!isLoading && courses.length === 0 && (
                  <TableRow>
                    <TableCell
                      colSpan={7}
                      style={{
                        textAlign: 'center',
                        color: 'var(--text-muted-foreground)',
                        padding: '2rem',
                      }}
                    >
                      No courses yet. Create your first one.
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          )}
        </ListScroll>
      </ListPanel>
    </PageContainer>
  );
}

function Courses() {
  const [searchParams, setSearchParams] = useSearchParams();
  const tab = searchParams.get('tab') || 'manage';

  const onTabChange = (value: string) => {
    const next = new URLSearchParams(searchParams);
    next.set('tab', value);
    // Clear stats-specific params when switching away
    if (value !== 'stats') {
      next.delete('course_slug');
      next.delete('start_date');
      next.delete('end_date');
    }
    setSearchParams(next);
  };

  return (
    <div className="flex flex-col min-h-0 w-full relative">
      <Tabs value={tab} onValueChange={onTabChange}>
        <TabsList>
          <TabsTrigger value="manage">Manage</TabsTrigger>
          <TabsTrigger value="stats">Stats</TabsTrigger>
        </TabsList>
        {tab === 'manage' && (
          <TabsContent value="manage">
            <ManageCourses />
          </TabsContent>
        )}
        {tab === 'stats' && (
          <TabsContent value="stats">
            <CourseStats />
          </TabsContent>
        )}
      </Tabs>
    </div>
  );
}

export default Courses;
