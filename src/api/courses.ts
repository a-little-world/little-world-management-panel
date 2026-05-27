import { apiFetch } from './helpers';

export type UserTypeAvailability = 'all' | 'learner' | 'volunteer';

export interface QuizStep {
  order: number;
  question: string;
  answers: string[];
  correct_answer: string;
}

export interface CourseChapter {
  chapter_id: string;
  order: number;
  available_to: UserTypeAvailability;
  title: string;
  description: string;
  video_url: string;
  video_title: string;
  completed_title: string;
  completed_description: string;
  completed_additional_text: string;
  completed_cta_label: string;
  quiz_steps: QuizStep[];
}

export interface AdminCourse {
  id: number;
  slug: string;
  title: string;
  description: string;
  /** Relative or absolute URL of the course image, or null if none. */
  image: string | null;
  is_active: boolean;
  /** When false the course is excluded from public listings (e.g. Trainings page). */
  is_listed: boolean;
  available_to: UserTypeAvailability;
  created_at: string;
  updated_at: string;
  chapters: CourseChapter[];
}

export interface AdminCourseListItem {
  id: number;
  slug: string;
  title: string;
  description: string;
  image: string | null;
  is_active: boolean;
  is_listed: boolean;
  available_to: UserTypeAvailability;
  created_at: string;
  updated_at: string;
  chapter_count: number;
}

/** Payload for create/update. Image is managed separately via uploadCourseImage/removeCourseImage. */
export type CoursePayload = Omit<AdminCourse, 'id' | 'image' | 'created_at' | 'updated_at'>;

export const ADMIN_COURSES_ENDPOINT = '/api/admin/courses/';

export const fetchAdminCourses = () =>
  apiFetch<AdminCourseListItem[]>(ADMIN_COURSES_ENDPOINT);

export const fetchAdminCourse = (slug: string) =>
  apiFetch<AdminCourse>(`${ADMIN_COURSES_ENDPOINT}${slug}/`);

export const createAdminCourse = (body: CoursePayload) =>
  apiFetch<AdminCourse>(ADMIN_COURSES_ENDPOINT, { method: 'POST', body });

export const updateAdminCourse = (slug: string, body: CoursePayload) =>
  apiFetch<AdminCourse>(`${ADMIN_COURSES_ENDPOINT}${slug}/`, {
    method: 'PUT',
    body,
  });

export const deleteAdminCourse = (slug: string) =>
  apiFetch<void>(`${ADMIN_COURSES_ENDPOINT}${slug}/`, { method: 'DELETE' });

/** Upload a new image for a course (multipart PATCH to the dedicated image endpoint). */
export const uploadCourseImage = (slug: string, file: File): Promise<AdminCourse> => {
  const fd = new FormData();
  fd.append('image', file);
  return apiFetch<AdminCourse>(`${ADMIN_COURSES_ENDPOINT}${slug}/image/`, {
    method: 'PATCH',
    body: fd,
  });
};

/** Remove the existing image from a course. */
export const removeCourseImage = (slug: string): Promise<AdminCourse> => {
  const fd = new FormData();
  fd.append('clear', 'true');
  return apiFetch<AdminCourse>(`${ADMIN_COURSES_ENDPOINT}${slug}/image/`, {
    method: 'PATCH',
    body: fd,
  });
};

/**
 * Resolves a course image URL to an absolute URL. The backend may return a
 * relative path (e.g. /media/courses/img.jpg).
 */
export const resolveCourseImageUrl = (url: string | null | undefined): string | null => {
  if (!url) return null;
  if (url.startsWith('http://') || url.startsWith('https://')) return url;
  if (typeof window === 'undefined') return url;
  return url.startsWith('/') ? `${window.location.origin}${url}` : `${window.location.origin}/${url}`;
};

// ---------------------------------------------------------------------------
// Stats
// ---------------------------------------------------------------------------

export interface ChapterFunnelRow {
  chapter_id: string;
  title: string;
  order: number;
  step_count: number;
  reached: number;
  currently_here: number;
  drop_off_pct: number;
}

export interface CourseStatsResponse {
  course_slug: string;
  course_title: string;
  total_started: number;
  total_completed: number;
  completion_rate: number;
  avg_days_to_complete: number | null;
  chapter_funnel: ChapterFunnelRow[];
}

export const fetchAdminCourseStats = (slug: string, queryString: string) =>
  apiFetch<CourseStatsResponse>(
    `${ADMIN_COURSES_ENDPOINT}${slug}/stats/${queryString ? `?${queryString}` : ''}`,
  );
