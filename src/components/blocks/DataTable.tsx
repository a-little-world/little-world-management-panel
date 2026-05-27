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
import { Link, useSearchParams } from 'react-router-dom';
import styled from 'styled-components';

import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '../atoms/Table';

// Overlay over full table row
const RowLinkOverlay = styled(Link)`
  position: absolute;
  inset: 0;
`;

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
                className={
                  rowLink
                    ? 'relative cursor-pointer hover:bg-slate-100'
                    : undefined
                }
              >
                {row.getVisibleCells()?.map((cell, idx) => (
                  <TableCell key={cell.id}>
                    {idx === 0 && rowLink && (
                      <RowLinkOverlay to={rowLink} tabIndex={-1} aria-hidden />
                    )}
                    {flexRender(cell.column.columnDef.cell, cell.getContext())}
                  </TableCell>
                ))}
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
