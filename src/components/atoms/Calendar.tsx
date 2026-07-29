import { ChevronLeft, ChevronRight } from 'lucide-react';
import * as React from 'react';
import { DayPicker, Matcher } from 'react-day-picker';

import { cn } from '../../lib/utils';
import { buttonVariants } from './Button';

export type CalendarProps = React.ComponentProps<typeof DayPicker>;

function Calendar({
  className,
  classNames,
  showOutsideDays = true,
  disablePastDays,
  disableFutureDays,
  ...props
}: CalendarProps & {
  disablePastDays?: boolean;
  disableFutureDays?: boolean;
}) {
  const today = new Date();
  const disabledDays: Matcher[] | undefined =
    disablePastDays || disableFutureDays
      ? [
          ...(disablePastDays ? [{ before: today }] : []),
          ...(disableFutureDays ? [{ after: today }] : []),
        ]
      : undefined;
  return (
    <DayPicker
      showOutsideDays={showOutsideDays}
      navLayout="around"
      disabled={disabledDays}
      className={cn('p-3', className)}
      classNames={{
        month:
          'flex flex-row flex-wrap gap-y-4 [&>.month_grid]:w-full [&>.weeks]:w-full',
        month_caption: 'flex flex-1 min-w-0 justify-center items-center pt-1',
        caption_label: 'text-sm font-medium',
        nav: 'flex items-center gap-1',
        button_previous: cn(
          buttonVariants({ variant: 'outline' }),
          'h-10 w-10 shrink-0 bg-transparent p-0 opacity-50 hover:opacity-100',
        ),
        button_next: cn(
          buttonVariants({ variant: 'outline' }),
          'h-10 w-10 shrink-0 bg-transparent p-0 opacity-50 hover:opacity-100',
        ),
        month_grid: 'w-full',
        weekdays: 'grid grid-cols-7',
        weekday:
          'flex items-center justify-center text-neutral-500 rounded-md h-10 w-10 font-normal text-[0.8rem] dark:text-neutral-400',
        weeks: 'space-y-1',
        week: 'grid grid-cols-7 w-full mt-2',
        day: cn(
          buttonVariants({ variant: 'ghost' }),
          'h-10 w-10 p-0 font-normal aria-selected:opacity-100',
        ),
        range_end: 'day-range-end',
        today:
          'bg-neutral-100 text-neutral-200 dark:bg-neutral-800 dark:text-neutral-50',
        selected:
          'bg-neutral-900 text-neutral-50 hover:bg-neutral-800 hover:text-white focus:bg-neutral-800 focus:text-white dark:bg-neutral-50 dark:text-white dark:hover:bg-neutral-80 dark:hover:text-white dark:focus:bg-neutral-50 dark:focus:text-white',

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
