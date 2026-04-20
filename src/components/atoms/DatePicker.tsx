import { format } from 'date-fns';
import { Calendar as CalendarIcon } from 'lucide-react';
import * as React from 'react';

import {
  Button,
  ButtonVariations,
  Popover,
  PopoverSizes,
} from '@a-little-world/little-world-design-system';
import { Calendar } from './Calendar';

export function DatePicker({
  date,
  disabled,
  disablePastDays,
  disableFutureDays,
  setDate,
  inModal = false,
}: {
  date: Date | null;
  disabled?: boolean;
  disablePastDays?: boolean;
  disableFutureDays?: boolean;
  setDate: (date: Date | null) => void;
  inModal?: boolean;
}) {
  return (
    <Popover
      width={PopoverSizes.Large}
      inModal={inModal}
      trigger={
        <Button variation={ButtonVariations.Icon} disabled={disabled}>
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
  );
}
