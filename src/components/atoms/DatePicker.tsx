import { format } from 'date-fns';
import { Calendar as CalendarIcon } from 'lucide-react';
import * as React from 'react';

import {
  Button,
  ButtonVariations,
  Label,
  Popover,
  PopoverSizes,
} from '@a-little-world/little-world-design-system';
import { Calendar } from './Calendar';

type SharedDatePickerProps = {
  disabled?: boolean;
  disablePastDays?: boolean;
  disableFutureDays?: boolean;
  inModal?: boolean;
  label?: string;
  tooltipText?: string;
};

export function DatePickerContainer({
  children,
  label,
  tooltipText,
}: {
  children: React.ReactNode;
  label?: string;
  tooltipText?: string;
}) {
  if (!label) return children;
  return (
    <div>
      <Label bold tooltipText={tooltipText}>
        {label}
      </Label>
      {children}
    </div>
  );
}

export function DatePicker({
  date,
  disabled,
  disablePastDays,
  disableFutureDays,
  setDate,
  inModal = false,
  label,
  tooltipText,
}: {
  date: Date | null;
  setDate: (date: Date | null) => void;
} & SharedDatePickerProps) {
  return (
    <DatePickerContainer label={label} tooltipText={tooltipText}>
      <Popover
        width={PopoverSizes.Large}
        inModal={inModal}
        trigger={
          <Button
            variation={ButtonVariations.Icon}
            disabled={disabled}
            style={{ minHeight: 40, height: 40, justifyContent: 'flex-start' }}
          >
            <CalendarIcon className="mr-2 h-4 w-4" />
            {date ? format(date, 'PPP') : <span>Pick a date</span>}
          </Button>
        }
      >
        <Calendar
          mode="single"
          selected={date ?? undefined}
          onSelect={d => setDate(d ?? null)}
          defaultMonth={date ?? undefined}
          disablePastDays={disablePastDays}
          disableFutureDays={disableFutureDays}
        />
      </Popover>
    </DatePickerContainer>
  );
}
