import {
  ColumnDef,
  SortingState,
  TableMeta,
  flexRender,
  getCoreRowModel,
  getPaginationRowModel,
  getSortedRowModel,
  useReactTable,
} from '@tanstack/react-table';
import React, { useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';

import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '../atoms/Table';

const INTERACTIVE_SELECTOR =
  'a, button, input, select, textarea, [role="checkbox"], label';

function isInteractiveClickTarget(target: EventTarget | null) {
  return (
    target instanceof Element &&
    Boolean(target.closest(INTERACTIVE_SELECTOR))
  );
}

interface DataTableProps<TData, TValue> {
  columns: ColumnDef<TData, TValue>[];
  data: TData[];
  tableMeta?: TableMeta<TData>;
  getRowLink?: (row: TData) => string;
}

export function DataTable<TData, TValue>({
  columns,
  data,
  tableMeta,
  getRowLink,
}: DataTableProps<TData, TValue>) {
  const navigate = useNavigate();
  let [searchParams, setSearchParams] = useSearchParams();
  const [sorting, setSorting] = useState<SortingState>([]);
  const handleSorting = (sortingVal: SortingState) => {
    setSorting(sortingVal);
    const newParams = new URLSearchParams(searchParams);
    setSearchParams(newParams);
  };

  const table = useReactTable({
    data,
    columns,
    getCoreRowModel: getCoreRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    onSortingChange: handleSorting,
    getSortedRowModel: getSortedRowModel(),
    state: {
      sorting,
    },
    meta: tableMeta,
    manualPagination: true,
  });

  return (
    <Table>
      <TableHeader>
        {table.getHeaderGroups()?.map(headerGroup => (
          <TableRow key={headerGroup.id}>
            {headerGroup.headers?.map(header => {
              return (
                <TableHead key={header.id}>
                  {header.isPlaceholder
                    ? null
                    : flexRender(
                        header.column.columnDef.header,
                        header.getContext(),
                      )}
                </TableHead>
              );
            })}
          </TableRow>
        ))}
      </TableHeader>
      <TableBody>
        {table.getRowModel().rows?.length ? (
          table.getRowModel().rows.map(row => {
            const rowLink = getRowLink?.(row.original);
            return (
              <TableRow
                key={row.id}
                data-state={row.getIsSelected() && 'selected'}
                className={rowLink ? 'group cursor-pointer' : undefined}
                onClick={event => {
                  if (!rowLink || isInteractiveClickTarget(event.target)) {
                    return;
                  }
                  navigate(rowLink);
                }}
              >
                {row.getVisibleCells()?.map(cell => {
                  const isSelectCell = cell.column.id === 'select';
                  const stopSelectCellEvent = isSelectCell
                    ? (event: React.MouseEvent) => event.stopPropagation()
                    : undefined;

                  return (
                    <TableCell
                      key={cell.id}
                      className={
                        rowLink
                          ? 'transition-colors group-hover:bg-slate-100'
                          : undefined
                      }
                      onClick={stopSelectCellEvent}
                      onMouseDown={stopSelectCellEvent}
                    >
                      {flexRender(
                        cell.column.columnDef.cell,
                        cell.getContext(),
                      )}
                    </TableCell>
                  );
                })}
              </TableRow>
            );
          })
        ) : (
          <TableRow>
            <TableCell colSpan={columns.length} className="h-24 text-center">
              No results.
            </TableCell>
          </TableRow>
        )}
      </TableBody>
    </Table>
  );
}
