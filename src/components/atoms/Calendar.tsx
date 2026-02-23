import { ChevronLeft, ChevronRight } from 'lucide-react';
import * as React from 'react';
import { DayPicker } from 'react-day-picker';

import { cn } from '../../lib/utils';
import { buttonVariants } from './Button';

export type CalendarProps = React.ComponentProps<typeof DayPicker>;

function Calendar({
  className,
  classNames,
  showOutsideDays = true,
  ...props
}: CalendarProps) {
  return (
    <DayPicker
      showOutsideDays={showOutsideDays}
      navLayout="around"
      className={cn('p-3', className)}
      classNames={{
        months: 'flex flex-col sm:flex-row space-y-4 sm:space-x-4 sm:space-y-0',
        month:
          'flex flex-row flex-wrap gap-y-4 [&>.month_grid]:w-full [&>.weeks]:w-full',
        month_caption:
          'flex flex-1 min-w-0 justify-center items-center pt-1',
        caption_label: 'text-sm font-medium',
        nav: 'flex items-center gap-1',
        button_previous: cn(
          buttonVariants({ variant: 'outline' }),
          'h-7 w-7 shrink-0 bg-transparent p-0 opacity-50 hover:opacity-100',
        ),
        button_next: cn(
          buttonVariants({ variant: 'outline' }),
          'h-7 w-7 shrink-0 bg-transparent p-0 opacity-50 hover:opacity-100',
        ),
        month_grid: 'w-full',
        weekdays: 'grid grid-cols-7',
        weekday:
          'flex items-center justify-center text-neutral-500 rounded-md h-9 w-9 font-normal text-[0.8rem] dark:text-neutral-400',
        weeks: 'space-y-1',
        week: 'grid grid-cols-7 w-full mt-2',
        day: cn(
          buttonVariants({ variant: 'ghost' }),
          'h-9 w-9 p-0 font-normal aria-selected:opacity-100',
        ),
        range_end: 'day-range-end',
        selected:
          'bg-neutral-900 text-neutral-50 hover:bg-neutral-900 hover:text-neutral-50 focus:bg-neutral-900 focus:text-neutral-50 dark:bg-neutral-50 dark:text-neutral-900 dark:hover:bg-neutral-50 dark:hover:text-neutral-900 dark:focus:bg-neutral-50 dark:focus:text-neutral-900',
        today:
          'bg-neutral-100 text-neutral-900 dark:bg-neutral-800 dark:text-neutral-50',
        outside:
          'day-outside text-neutral-500 opacity-50 aria-selected:bg-neutral-100/50 aria-selected:text-neutral-500 aria-selected:opacity-30 dark:text-neutral-400 dark:aria-selected:bg-neutral-800/50 dark:aria-selected:text-neutral-400',
        disabled: 'text-neutral-500 opacity-50 dark:text-neutral-400',
        range_middle:
          'aria-selected:bg-neutral-100 aria-selected:text-neutral-900 dark:aria-selected:bg-neutral-800 dark:aria-selected:text-neutral-50',
        hidden: 'invisible',
        ...classNames,
      }}
      components={{
        Chevron: ({ orientation }) =>
          orientation === 'left' ? (
            <ChevronLeft className="h-4 w-4" />
          ) : (
            <ChevronRight className="h-4 w-4" />
          ),
      }}
      {...props}
    />
  );
}
Calendar.displayName = 'Calendar';

export { Calendar };
