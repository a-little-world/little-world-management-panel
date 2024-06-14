import { cn } from '@/lib/utils';
import {
  ChevronLeftIcon,
  ChevronRightIcon,
  DotsIcon,
  Text,
} from '@a-little-world/little-world-design-system';
import React from 'react';
import { Link, LinkProps, useSearchParams } from 'react-router-dom';

const PaginationRoot = ({
  className,
  ...props
}: React.ComponentProps<'nav'>) => (
  <nav
    role="navigation"
    aria-label="pagination"
    className={cn('flex', className)}
    {...props}
  />
);
PaginationRoot.displayName = 'PaginationRoot';

const PaginationContent = React.forwardRef<
  HTMLUListElement,
  React.ComponentProps<'ul'>
>(({ className, ...props }, ref) => (
  <ul
    ref={ref}
    className={cn('flex flex-row items-center gap-1', className)}
    {...props}
  />
));
PaginationContent.displayName = 'PaginationContent';

const PaginationItem = React.forwardRef<
  HTMLLIElement,
  React.ComponentProps<'li'>
>(({ className, ...props }, ref) => (
  <li ref={ref} className={cn('', className)} {...props} />
));
PaginationItem.displayName = 'PaginationItem';

type PaginationLinkProps = {
  isActive?: boolean;
} & LinkProps;

const PaginationLink = ({
  className,
  isActive,
  to,
  ...props
}: PaginationLinkProps) => (
  <Link
    to={to}
    aria-current={isActive ? 'page' : undefined}
    className={`inline-flex items-center justify-center whitespace-nowrap rounded-md text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 hover:bg-slate-200 hover:text-accent-foreground h-10 px-4 py-2 gap-1 ${
      isActive && 'border border-slate-300'
    }`}
    {...props}
  />
);
PaginationLink.displayName = 'PaginationLink';

type PaginationButtonProps = {
  isActive?: boolean;
} & React.ButtonHTMLAttributes<HTMLButtonElement>;

const PaginationButton = ({
  className,
  isActive,
  onClick,
  ...props
}: PaginationButtonProps) => (
  <button
    onClick={onClick}
    aria-current={isActive ? 'page' : undefined}
    className={`inline-flex items-center justify-center whitespace-nowrap rounded-md text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 hover:bg-slate-200 hover:text-accent-foreground h-10 px-4 py-2 gap-1 border ${
      isActive && 'border-solid border-slate-300'
    }`}
    {...props}
  />
);
PaginationButton.displayName = 'PaginationButton';

const PaginationPrevious = ({
  className,
  ...props
}: React.ComponentProps<typeof PaginationButton>) => (
  <PaginationButton
    aria-label="Go to previous page"
    className={cn('gap-1 pl-2.5', className)}
    {...props}
  >
    <ChevronLeftIcon
      label="previous page icon"
      labelId="prevPageIcon"
      className="h-3 w-3"
    />
    <span className="max-md:hidden">Previous</span>
  </PaginationButton>
);
PaginationPrevious.displayName = 'PaginationPrevious';

const PaginationNext = ({
  className,
  ...props
}: React.ComponentProps<typeof PaginationButton>) => (
  <PaginationButton
    aria-label="Go to next page"
    className={cn('gap-1 pr-2.5', className)}
    {...props}
  >
    <span className="max-md:hidden">Next</span>
    <ChevronRightIcon
      label="next page icon"
      labelId="nextPageIcon"
      className="h-3 w-3"
    />
  </PaginationButton>
);
PaginationNext.displayName = 'PaginationNext';

const PaginationEllipsis = ({
  className,
  ...props
}: React.ComponentProps<'span'>) => (
  <span
    aria-hidden
    className={cn('flex h-9 w-9 items-center justify-center', className)}
    {...props}
  >
    <DotsIcon
      label="more pages icon"
      labelId="morePageIcon"
      className="h-3 w-3"
    />
    <span className="sr-only">More pages</span>
  </span>
);
PaginationEllipsis.displayName = 'PaginationEllipsis';

const Pagination = ({ list }: { list: any }) => {
  let [searchParams, setSearchParams] = useSearchParams();
  const handlePagination = newPage => {
    const newParams = new URLSearchParams(searchParams);
    newParams.set('page', newPage);
    setSearchParams(newParams);
  };
  return (
    <PaginationRoot>
      <PaginationContent>
        <Text>{list?.count ? `${list?.count} items` : ''}</Text>
        <PaginationItem>
          <PaginationPrevious
            disabled={!list?.previous_page}
            onClick={() => handlePagination(list?.previous_page)}
          />
        </PaginationItem>
        {list?.previous_page && (
          <PaginationItem>
            <PaginationButton
              onClick={() => handlePagination(list?.previous_page)}
            >
              {list?.previous_page}
            </PaginationButton>
          </PaginationItem>
        )}
        <PaginationItem>
          <PaginationButton isActive>{list?.page}</PaginationButton>
        </PaginationItem>
        {list?.page !== list?.last_page && (
          <>
            <PaginationItem>
              <PaginationEllipsis />
            </PaginationItem>
            <PaginationItem>
              <PaginationButton
                onClick={() => handlePagination(list?.last_page)}
              >
                {list?.last_page}
              </PaginationButton>
            </PaginationItem>
          </>
        )}

        <PaginationItem>
          <PaginationNext
            disabled={!list?.next_page}
            onClick={() => handlePagination(list?.next_page)}
          />
        </PaginationItem>
      </PaginationContent>
    </PaginationRoot>
  );
};

export {
  PaginationRoot,
  PaginationButton,
  PaginationContent,
  PaginationEllipsis,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
};
export default Pagination;
