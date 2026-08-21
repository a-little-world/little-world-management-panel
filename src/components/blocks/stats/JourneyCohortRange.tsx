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

export function useJourneyCohortRange(
  initial: JourneyCohortDates | null,
  { allowEmpty = true }: { allowEmpty?: boolean } = {},
) {
  const [range, setRangeState] = React.useState<DateRange | undefined>(() =>
    initial ? rangeFromDates(initial) : undefined,
  );
  const [cohort, setCohort] = React.useState<JourneyCohortDates | null>(initial);

  const setRange = React.useCallback(
    (next: DateRange | undefined) => {
      setRangeState(next);
      const dates = datesFromRange(next);
      if (dates) {
        setCohort(dates);
        return;
      }
      if (allowEmpty && !next?.from && !next?.to) {
        setCohort(null);
      }
    },
    [allowEmpty],
  );

  return { range, setRange, cohort };
}

export function JourneyCohortRangePicker({
  label,
  tooltipText,
  range,
  setRange,
  clearLabel,
}: {
  label: string;
  tooltipText?: string;
  range: DateRange | undefined;
  setRange: (range: DateRange | undefined) => void;
  clearLabel?: string;
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
    </RangeWrap>
  );
}
