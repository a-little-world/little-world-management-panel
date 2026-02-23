import { format, formatDistance, intervalToDuration, parseISO, startOfDay } from 'date-fns';
import { de, enGB } from 'date-fns/locale';

import { LANGUAGES } from '../constants';

const two = (n: number) => (n < 10 ? `0${n}` : n);

export const formatTime = (date: Date | null | undefined) =>
  date ? `${two(date.getHours())}:${two(date.getMinutes())}` : '';

export const formatEventTime = (date1: Date, date2?: Date) => {
  if (!date2) return formatTime(date1);
  return `${formatTime(date1)} - ${formatTime(date2)}`;
};

export const formatDate = (
  date: Date,
  formatStr = 'cccc, LLLL do', // eslint-disable-line default-param-last
  locale: string,
) =>
  format(date, formatStr, {
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
  locale: string,
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

/**
 * Formats a decimal number of hours as a human-readable duration (e.g. "2 hours 21 minutes", "45 minutes").
 */
export function formatVideoTimeHours(hours: number): string {
  const totalSeconds = Math.round(hours * 3600);
  const duration = intervalToDuration({ start: 0, end: totalSeconds * 1000 });
  const parts: string[] = [];
  if (duration.hours) {
    parts.push(duration.hours === 1 ? '1 hour' : `${duration.hours} hours`);
  }
  if (duration.minutes) {
    parts.push(duration.minutes === 1 ? '1 minute' : `${duration.minutes} minutes`);
  }
  if (parts.length === 0) {
    return '0 minutes';
  }
  return parts.join(' ');
}
