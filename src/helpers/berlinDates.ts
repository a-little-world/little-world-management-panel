import { isValid, parseISO } from 'date-fns';

/**
 * Date-only scheduling fields (banner windows, survey windows) are picked as calendar days but
 * stored as instants. The team schedules in Berlin time, so a day has to be anchored there
 * rather than in the browser's timezone — otherwise the same pick means a different moment
 * depending on who saved it.
 */

const BERLIN_TZ = 'Europe/Berlin';

/** Berlin wall-clock fields for an instant (DST-aware). */
export function berlinParts(utcMs: number) {
  const dtf = new Intl.DateTimeFormat('en-US', {
    timeZone: BERLIN_TZ,
    hour12: false,
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
  });
  const p = Object.fromEntries(
    dtf.formatToParts(new Date(utcMs)).map(x => [x.type, x.value]),
  );
  return {
    y: Number(p.year),
    mo: Number(p.month) - 1,
    d: Number(p.day),
    h: Number(p.hour),
    mi: Number(p.minute),
    s: Number(p.second),
  };
}

/** Treat (y, mo, d, h, mi, s, ms) as a clock time in Europe/Berlin; return that instant as ISO UTC. */
export function berlinWallToIso(
  y: number,
  mo: number,
  d: number,
  h: number,
  mi: number,
  s: number,
  ms: number,
): string {
  const utcGuess = Date.UTC(y, mo, d, h, mi, s, ms);
  const wall = berlinParts(utcGuess);
  const wallAsUtc = Date.UTC(wall.y, wall.mo, wall.d, wall.h, wall.mi, wall.s);
  return new Date(utcGuess - (wallAsUtc - utcGuess)).toISOString();
}

/** ISO instant to the calendar day it falls on in Berlin, as a local Date for the picker. */
export function parseIsoToDate(value: string | null | undefined): Date | null {
  if (value == null || value === '') return null;
  const d = parseISO(value);
  if (!isValid(d)) return null;
  const { y, mo, d: day } = berlinParts(d.getTime());
  return new Date(y, mo, day);
}

/** Start of the picked day in Berlin — when a window opens. */
export function toStartOfDayIso(date: Date | null): string | null {
  if (!date) return null;
  return berlinWallToIso(
    date.getFullYear(),
    date.getMonth(),
    date.getDate(),
    0,
    0,
    0,
    0,
  );
}

/** End of the picked day in Berlin, so the window includes the day itself. */
export function toEndOfDayIso(date: Date | null): string | null {
  if (!date) return null;
  return berlinWallToIso(
    date.getFullYear(),
    date.getMonth(),
    date.getDate(),
    23,
    59,
    59,
    999,
  );
}
