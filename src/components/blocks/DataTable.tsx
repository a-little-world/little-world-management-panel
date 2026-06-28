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

const CellLinkHost = styled.div`
  position: relative;
`;

// Link overlay scoped to a single cell (not the full row)
const RowLinkOverlay = styled(Link)`
  position: absolute;
  inset: 0;
  z-index: 0;
`;

const SelectCellContent = styled.div`
  position: relative;
  z-index: 1;
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
            const linkColumnIndex = row
              .getVisibleCells()
              .findIndex(cell => cell.column.id !== 'select');
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
                {row.getVisibleCells()?.map((cell, idx) => {
                  const isSelectCell = cell.column.id === 'select';
                  const isLinkCell = idx === linkColumnIndex && rowLink;
                  const cellContent = flexRender(
                    cell.column.columnDef.cell,
                    cell.getContext(),
                  );

                  return (
                    <TableCell key={cell.id}>
                      {isSelectCell ? (
                        <SelectCellContent>{cellContent}</SelectCellContent>
                      ) : isLinkCell ? (
                        <CellLinkHost>
                          <RowLinkOverlay
                            to={rowLink}
                            tabIndex={-1}
                            aria-hidden
                          />
                          {cellContent}
                        </CellLinkHost>
                      ) : (
                        cellContent
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
