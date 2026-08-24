import { Text, TextTypes } from '@a-little-world/little-world-design-system';
import * as React from 'react';
import type { DateRange } from 'react-day-picker';
import { styled } from 'styled-components';

import {
  DateRangePicker,
  formatLocalDateYmd,
  parseYmdToLocalDate,
} from '../../atoms/DateRangePicker';

export const USER_JOURNEY_DEFAULT_START = '2022-01-01';

export type JourneyCohortDates = {
  start_date: string;
  end_date: string;
};

const RangeWrap = styled.div`
  margin-top: ${({ theme }) => theme.spacing.small};
  margin-bottom: ${({ theme }) => theme.spacing.small};
`;

const RangeNote = styled(Text).attrs({
  type: TextTypes.Body7,
  tag: 'p' as const,
})`
  margin-top: ${({ theme }) => theme.spacing.xxxsmall};
  color: ${({ theme }) => theme.color.text.tertiary};
`;

export function localTodayYmd(): string {
  return formatLocalDateYmd(new Date());
}

export function datesFromRange(
  range: DateRange | undefined,
): JourneyCohortDates | undefined {
  if (!range?.from || !range?.to) return undefined;
  return {
    start_date: formatLocalDateYmd(range.from),
    end_date: formatLocalDateYmd(range.to),
  };
}

export function rangeFromDates(dates: JourneyCohortDates): DateRange {
  return {
    from: parseYmdToLocalDate(dates.start_date),
    to: parseYmdToLocalDate(dates.end_date),
  };
}

export function useJourneyCohortRange(initial: JourneyCohortDates | null) {
  const [range, setRange] = React.useState<DateRange | undefined>(() =>
    initial ? rangeFromDates(initial) : undefined,
  );

  /**
   * Derived from the picker rather than held alongside it. Kept as its own state, the
   * cohort could disagree with what the inputs showed: clearing the picker left the
   * previous range applied, so the counts stayed filtered while the filter read as
   * empty, and a half-entered range silently kept the old cohort. No cohort means no
   * date filter at all — the whole point of the clear action.
   */
  const cohort = datesFromRange(range) ?? null;

  /** One end filled and not the other. Nothing is filtered until both are set. */
  const isPartialRange = Boolean(range?.from) !== Boolean(range?.to);

  return { range, setRange, cohort, isPartialRange };
}

export function JourneyCohortRangePicker({
  label,
  tooltipText,
  range,
  setRange,
  clearLabel,
  isPartialRange = false,
}: {
  label: string;
  tooltipText?: string;
  range: DateRange | undefined;
  setRange: (range: DateRange | undefined) => void;
  clearLabel?: string;
  isPartialRange?: boolean;
}) {
  return (
    <RangeWrap>
      <DateRangePicker
        label={label}
        tooltipText={tooltipText}
        range={range}
        setRange={setRange}
        numberOfMonths={1}
        clearLabel={clearLabel}
      />
      {isPartialRange && (
        <RangeNote>
          Both dates are needed to filter. Until then the figures below cover
          all time.
        </RangeNote>
      )}
    </RangeWrap>
  );
}
