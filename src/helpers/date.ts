import { format, formatDistance, parseISO, startOfDay } from 'date-fns';
import { de, enGB } from 'date-fns/locale';

import { LANGUAGES } from '../constants';

const two = (n: number) => (n < 10 ? `0${n}` : n);

export const formatTime = (date: Date | null | undefined) =>
  date ? `${two(date.getHours())}:${two(date.getMinutes())}` : '';

export const formatEventTime = (date1: Date, date2?: Date) => {
  if (!date2) return formatTime(date1);
  return `${formatTime(date1)} - ${formatTime(date2)}`;
};

export const formatDate = (date: Date, formatStr?: string, locale?: string) =>
  format(date, formatStr ?? 'cccc, LLLL do', {
    locale: locale === LANGUAGES.en ? enGB : de,
  });

export const formatMessageDate = (date: Date, locale: string): string => {
  const now = startOfDay(new Date());
  const messageDate = startOfDay(date);
  const diffInDays = Math.floor(
    (now.getTime() - messageDate.getTime()) / (1000 * 60 * 60 * 24),
  );
  const isCurrentYear = date.getFullYear() === now.getFullYear();

  if (diffInDays === 0) {
    return 'Heute';
  }
  if (diffInDays === 1) {
    return 'Gestern';
  }
  if (diffInDays < 7) {
    return formatDate(date, 'EEEE', locale); // weekday: 'short'
  }
  if (isCurrentYear) {
    return formatDate(date, 'EEE d MMM', locale); // "Thurs 10 May"
  }
  return formatDate(date, 'd MMM yyyy', locale); // "26 Nov 2024"
};

export const formatTimeDistance = (
  from: Date | string | number,
  to: Date | string | number,
  locale?: string,
  isPast?: boolean,
) => {
  let safeFrom = from;
  let safeTo = to;

  if (isPast) {
    // Convert inputs to Date objects if they aren't already
    const fromDate = from instanceof Date ? from : new Date(from);
    const toDate = to instanceof Date ? to : new Date(to);
    // Prevent clock synchronisation issues between server and client
    safeFrom = new Date(Math.min(fromDate.getTime(), toDate.getTime()));
    safeTo = new Date(Math.max(fromDate.getTime(), toDate.getTime()));
  }

  return formatDistance(safeFrom, safeTo, {
    addSuffix: true,
    locale: locale === LANGUAGES.en ? enGB : de,
  });
};

export const formatDateWithDistance = (date?: string) => {
  if (!date) {
    return '—';
  }

  const newDate = new Date(date);
  return `${formatDate(newDate)} (${formatTimeDistance(newDate, new Date(), LANGUAGES.en)})`;
};

export function addMinutesToDate(date: Date, minutes: number) {
  const MINUTE_IN_MS = 60 * 1000;
  return new Date(date.getTime() + minutes * MINUTE_IN_MS);
}

export function getEndTime(
  startDate: Date,
  durationInMinutes: number,
  endDate?: Date,
) {
  if (endDate) {
    return endDate;
  }
  return addMinutesToDate(startDate, durationInMinutes);
}

export function formatDateForCalendarUrl(date: Date) {
  return date.toISOString().replace(/-|:|\.\d+/g, '');
}

/** Returns today's date as YYYY-MM-DD string. */
export const getTodayDateString = (): string =>
  format(new Date(), 'yyyy-MM-dd');

/** Parses YYYY-MM-DD string to Date. */
export const stringToDate = (dateString: string): Date => parseISO(dateString);

/** Formats Date to YYYY-MM-DD string. */
export const dateToString = (date: Date): string => format(date, 'yyyy-MM-dd');

export const formatDurationSeconds = (seconds: number): string => {
  const hours = Math.floor(seconds / 3600);
  const minutes = Math.floor((seconds % 3600) / 60);
  const remainingSeconds = seconds % 60;
  return `${hours}h ${minutes}m ${remainingSeconds}s`;
};

/**
 * Formats a duration in seconds as days, hours, and minutes, rounded to the nearest minute.
 */
export function formatRoundedDuration(totalSeconds: number): string {
  const totalMinutes = Math.round(totalSeconds / 60);
  const days = Math.floor(totalMinutes / (60 * 24));
  const hours = Math.floor((totalMinutes % (60 * 24)) / 60);
  const minutes = totalMinutes % 60;
  const parts: string[] = [];

  if (days) {
    parts.push(days === 1 ? '1 day' : `${days} days`);
  }
  if (hours) {
    parts.push(hours === 1 ? '1 hour' : `${hours} hours`);
  }
  if (minutes || parts.length === 0) {
    parts.push(minutes === 1 ? '1 minute' : `${minutes} minutes`);
  }

  return parts.join(', ');
}
