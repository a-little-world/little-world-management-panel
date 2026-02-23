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
  setDate,
  inModal = false,
}: {
  date: Date | null;
  setDate: (date: Date | null) => void;
  inModal?: boolean;
}) {
  return (
    // <Popover modal={Boolean(!inModal)}>
    //   <PopoverTrigger asChild>
    //     <Button
    //       variant={'outline'}
    //       className={cn(
    //         'max-w-[280px] justify-start text-left font-normal flex-1',
    //         !date && 'text-muted-foreground',
    //       )}
    //     >
    //       <CalendarIcon className="mr-2 h-4 w-4" />
    //       {date ? format(date, 'PPP') : <span>Pick a date</span>}
    //     </Button>
    //   </PopoverTrigger>
    //   <PopoverContent
    //     className="w-auto p-0 z-[1000]"
    //     onOpenAutoFocus={e => e.preventDefault()}
    //   >
    //     <Calendar
    //       mode="single"
    //       selected={date ?? undefined}
    //       onSelect={d => setDate(d ?? null)}
    //       defaultMonth={date ?? undefined}
    //       initialFocus
    //     />
    //   </PopoverContent>
    // </Popover>
    <Popover
      width={PopoverSizes.Large}
      modal={!inModal}
      trigger={
        <Button variation={ButtonVariations.Icon}>
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
      />
    </Popover>
  );
}
