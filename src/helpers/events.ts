import {
  addDays,
  addMonths,
  getDate,
  getDay,
  isAfter,
  isBefore,
  startOfMonth,
} from 'date-fns';

import { COMMUNITY_EVENT_FREQUENCIES } from '../constants';

export interface Event {
  id: string;
  frequency: string;
  description: string;
  image?: string;
  group_id?: string;
  title: string;
  time: string;
  end_time?: string;
  link: string;
}

export interface CalendarEvent {
  frequency: string;
  description: string;
  durationInMinutes: number;
  title: string;
  endDate?: Date;
  startDate: Date;
  link: string;
}

export function calculateNextOccurrence(
  startDate: string | Date,
  frequency: string,
  endDate?: string | Date,
): Date {
  if (!frequency || frequency === COMMUNITY_EVENT_FREQUENCIES.once) {
    return new Date(startDate);
  }

  const originalDate = new Date(startDate);
  const originalEndDate = endDate ? new Date(endDate) : undefined;
  const now = new Date();

  // Early return if the original date is in the future
  if (isAfter(originalDate, now)) {
    return originalDate;
  }

  const originalDayOfWeek = getDay(originalDate);
  const currentDayOfWeek = getDay(now);

  // Preserve the original time (hours, minutes, seconds)
  const originalTime = {
    hours: originalDate.getHours(),
    minutes: originalDate.getMinutes(),
    seconds: originalDate.getSeconds(),
    milliseconds: originalDate.getMilliseconds(),
  };

  let currentOccurrence: Date;

  if (frequency === COMMUNITY_EVENT_FREQUENCIES.weekly) {
    // Calculate days until next occurrence of the same weekday
    const daysUntilNext = (originalDayOfWeek - currentDayOfWeek + 7) % 7;
    // If it's the same day, check if we're still within the event window
    if (daysUntilNext === 0) {
      currentOccurrence = new Date(now);
      currentOccurrence.setHours(
        originalTime.hours,
        originalTime.minutes,
        originalTime.seconds,
        originalTime.milliseconds,
      );

      // Check if we should return the current occurrence or move to next week
      if (originalEndDate) {
        // If we have an end time, check if we're past it
        const currentOccurrenceEndTime = new Date(now);
        currentOccurrenceEndTime.setHours(
          originalEndDate.getHours(),
          originalEndDate.getMinutes(),
          originalEndDate.getSeconds(),
          originalEndDate.getMilliseconds(),
        );

        // If we're past the end time, move to next week
        if (isAfter(now, currentOccurrenceEndTime)) {
          currentOccurrence = addDays(currentOccurrence, 7);
        }
        // Otherwise return current occurrence (we're before end time)
      } else if (isAfter(now, currentOccurrence)) {
        // No end time provided, but we're past the start time
        // Move to next week
        currentOccurrence = addDays(currentOccurrence, 7);
      }
      // Otherwise return current occurrence (event hasn't started yet)
    } else {
      currentOccurrence = addDays(now, daysUntilNext);
      currentOccurrence.setHours(
        originalTime.hours,
        originalTime.minutes,
        originalTime.seconds,
        originalTime.milliseconds,
      );
    }
    return currentOccurrence;
  }

  if (frequency === COMMUNITY_EVENT_FREQUENCIES.fortnightly) {
    // Start from the original date and add 14 days until we find the next occurrence >= now
    currentOccurrence = new Date(originalDate);
    currentOccurrence.setHours(
      originalTime.hours,
      originalTime.minutes,
      originalTime.seconds,
      originalTime.milliseconds,
    );

    // Keep adding 14 days until we get a date >= now
    while (isBefore(currentOccurrence, now)) {
      currentOccurrence = addDays(currentOccurrence, 14);
    }

    // Now check if we're on the same calendar day but past the time (with or without end time)
    if (currentOccurrence.toDateString() === now.toDateString()) {
      if (originalEndDate) {
        // If we have an end time, check if we're past it
        const currentOccurrenceEndTime = new Date(currentOccurrence);
        currentOccurrenceEndTime.setHours(
          originalEndDate.getHours(),
          originalEndDate.getMinutes(),
          originalEndDate.getSeconds(),
          originalEndDate.getMilliseconds(),
        );

        // If we're past the end time, move to next fortnight
        if (isAfter(now, currentOccurrenceEndTime)) {
          currentOccurrence = addDays(currentOccurrence, 14);
        }
        // Otherwise return current occurrence (we're before end time)
      } else if (isAfter(now, currentOccurrence)) {
        // No end time provided, but we're past the start time
        // Move to next fortnight
        currentOccurrence = addDays(currentOccurrence, 14);
      }
      // Otherwise return current occurrence (event hasn't started yet)
    }

    return currentOccurrence;
  }

  if (frequency === COMMUNITY_EVENT_FREQUENCIES.monthly) {
    // For monthly, find the same week of month and day of week
    const weekOfMonth = Math.ceil(getDate(originalDate) / 7);

    // Helper function to calculate the Nth occurrence of a weekday in a month
    const getNthWeekdayOfMonth = (
      month: Date,
      weekday: number,
      n: number,
    ): Date => {
      const firstDayOfMonth = startOfMonth(month);
      let date = addDays(firstDayOfMonth, (n - 1) * 7);

      // Adjust to the correct day of week
      while (getDay(date) !== weekday) {
        date = addDays(date, 1);
      }

      return date;
    };

    // Start with current month
    let nextDate = getNthWeekdayOfMonth(now, originalDayOfWeek, weekOfMonth);

    // Set the original time
    nextDate.setHours(
      originalTime.hours,
      originalTime.minutes,
      originalTime.seconds,
      originalTime.milliseconds,
    );

    // Determine if we need to move to next month
    let shouldMoveToNextMonth = false;

    if (nextDate.toDateString() === now.toDateString()) {
      // It's the event day - check if we should still show this occurrence
      if (originalEndDate) {
        // If we have an end time, check if we're past it
        const currentOccurrenceEndTime = new Date(nextDate);
        currentOccurrenceEndTime.setHours(
          originalEndDate.getHours(),
          originalEndDate.getMinutes(),
          originalEndDate.getSeconds(),
          originalEndDate.getMilliseconds(),
        );

        // Only move to next month if we're past the end time
        if (isAfter(now, currentOccurrenceEndTime)) {
          shouldMoveToNextMonth = true;
        }
      } else if (isAfter(now, nextDate)) {
        // No end time - only move to next month if we're past the start time
        shouldMoveToNextMonth = true;
      }
    } else if (isBefore(nextDate, now)) {
      // The date is in the past (not today), move to next month
      shouldMoveToNextMonth = true;
    }

    if (shouldMoveToNextMonth) {
      const nextMonth = addMonths(now, 1);
      nextDate = getNthWeekdayOfMonth(
        nextMonth,
        originalDayOfWeek,
        weekOfMonth,
      );
      nextDate.setHours(
        originalTime.hours,
        originalTime.minutes,
        originalTime.seconds,
        originalTime.milliseconds,
      );
    }

    return nextDate;
  }

  return originalDate;
}
