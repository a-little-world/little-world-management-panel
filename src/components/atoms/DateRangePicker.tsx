import { format, isValid, parse } from 'date-fns';
import { Calendar as CalendarIcon } from 'lucide-react';
import * as React from 'react';
import type { DateRange } from 'react-day-picker';
import styled from 'styled-components';

import {
  Button,
  ButtonVariations,
  InputWidth,
  Popover,
  PopoverSizes,
  TextInput,
} from '@a-little-world/little-world-design-system';
import { Calendar } from './Calendar';
import { DatePickerContainer } from './DatePicker';

export function parseYmdToLocalDate(value: string): Date {
  return parse(value, 'yyyy-MM-dd', new Date());
}

export function formatLocalDateYmd(date: Date): string {
  return format(date, 'yyyy-MM-dd');
}

const DISPLAY_DATE_FORMAT = 'dd-MM-yyyy';

function formatDisplayDate(date: Date): string {
  return format(date, DISPLAY_DATE_FORMAT);
}

function parseInputDate(value: string): Date | undefined {
  const trimmed = value.trim();
  if (!trimmed) return undefined;

  // Prefer EU display format; also accept common variants / ISO for paste.
  for (const pattern of [
    DISPLAY_DATE_FORMAT,
    'dd.MM.yyyy',
    'dd/MM/yyyy',
    'yyyy-MM-dd',
  ]) {
    const date = parse(trimmed, pattern, new Date());
    if (isValid(date) && format(date, pattern) === trimmed) {
      return date;
    }
  }
  return undefined;
}

const RangeRow = styled.div`
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  gap: ${({ theme }) => theme.spacing.xxsmall};
`;

const RangeSeparator = styled.span`
  color: ${({ theme }) => theme.color.text.secondary};
  font-size: 0.875rem;
`;

export function DateRangePicker({
  label,
  tooltipText,
  range,
  disabled,
  setRange,
  inModal = false,
  numberOfMonths = 1,
  clearLabel,
}: {
  label?: string;
  tooltipText?: string;
  range: DateRange | undefined;
  disabled?: boolean;
  setRange: (range: DateRange | undefined) => void;
  inModal?: boolean;
  numberOfMonths?: number;
  clearLabel?: string;
}) {
  const { from, to } = range ?? {};
  const fromValue = from ? formatDisplayDate(from) : '';
  const toValue = to ? formatDisplayDate(to) : '';
  const canClear = Boolean(clearLabel && (from || to));

  const [fromText, setFromText] = React.useState(fromValue);
  const [toText, setToText] = React.useState(toValue);

  React.useEffect(() => {
    setFromText(fromValue);
  }, [fromValue]);

  React.useEffect(() => {
    setToText(toValue);
  }, [toValue]);

  const commitFrom = () => {
    const nextFrom = parseInputDate(fromText);
    if (!nextFrom) {
      setFromText(fromValue);
      return;
    }
    const nextTo = to && to < nextFrom ? nextFrom : to;
    setRange({ from: nextFrom, to: nextTo });
  };

  const commitTo = () => {
    const nextTo = parseInputDate(toText);
    if (!nextTo) {
      setToText(toValue);
      return;
    }
    const nextFrom = from && nextTo < from ? nextTo : from;
    setRange({ from: nextFrom ?? nextTo, to: nextTo });
  };

  return (
    <DatePickerContainer label={label} tooltipText={tooltipText}>
      <RangeRow>
        <TextInput
          cannotError
          width={InputWidth.Small}
          type="text"
          inputMode="numeric"
          placeholder="DD-MM-YYYY"
          aria-label="Start date"
          disabled={disabled}
          value={fromText}
          onChange={e => setFromText(e.target.value)}
          onBlur={commitFrom}
          onKeyDown={e => {
            if (e.key === 'Enter') {
              e.currentTarget.blur();
            }
          }}
        />
        <RangeSeparator>–</RangeSeparator>
        <TextInput
          cannotError
          width={InputWidth.Small}
          type="text"
          inputMode="numeric"
          placeholder="DD-MM-YYYY"
          aria-label="End date"
          disabled={disabled}
          value={toText}
          onChange={e => setToText(e.target.value)}
          onBlur={commitTo}
          onKeyDown={e => {
            if (e.key === 'Enter') {
              e.currentTarget.blur();
            }
          }}
        />
        <Popover
          width={PopoverSizes.Large}
          inModal={inModal}
          trigger={
            <Button
              variation={ButtonVariations.Icon}
              disabled={disabled}
              aria-label="Open calendar"
            >
              <CalendarIcon className="h-5 w-5" />
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
        {canClear && (
          <Button
            variation={ButtonVariations.Inline}
            disabled={disabled}
            onClick={() => setRange(undefined)}
          >
            {clearLabel}
          </Button>
        )}
      </RangeRow>
    </DatePickerContainer>
  );
}
