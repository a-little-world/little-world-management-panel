import { format, parse } from 'date-fns';
import { Calendar as CalendarIcon } from 'lucide-react';
import * as React from 'react';
import type { DateRange } from 'react-day-picker';

import {
  Button,
  ButtonVariations,
  Popover,
  PopoverSizes,
} from '@a-little-world/little-world-design-system';
import { Calendar } from './Calendar';
import { DatePickerContainer } from './DatePicker';

export function parseYmdToLocalDate(value: string): Date {
  return parse(value, 'yyyy-MM-dd', new Date());
}

export function formatLocalDateYmd(date: Date): string {
  return format(date, 'yyyy-MM-dd');
}

export function DateRangePicker({
  label,
  tooltipText,
  range,
  disabled,
  setRange,
  inModal = false,
  numberOfMonths = 2,
}: {
  label?: string;
  tooltipText?: string;
  range: DateRange | undefined;
  disabled?: boolean;
  setRange: (range: DateRange | undefined) => void;
  inModal?: boolean;
  numberOfMonths?: number;
}) {
  const { from, to } = range ?? {};
  const placeholder =
    from && to
      ? `${format(from, 'PP')} – ${format(to, 'PP')}`
      : from
        ? `${format(from, 'PP')} – …`
        : 'Pick dates';

  return (
    <DatePickerContainer label={label} tooltipText={tooltipText}>
      <Popover
        width={PopoverSizes.Large}
        inModal={inModal}
        trigger={
          <Button variation={ButtonVariations.Icon} disabled={disabled}>
            <CalendarIcon className="mr-2 h-4 w-4" />
            <span>{placeholder}</span>
          </Button>
        }
      >
        <Calendar
          mode="range"
          selected={range}
          onSelect={setRange}
          defaultMonth={from ?? to}
          numberOfMonths={numberOfMonths}
        />
      </Popover>
    </DatePickerContainer>
  );
}
