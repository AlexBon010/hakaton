'use client';

import { useState } from 'react';

import {
  flexRender,
  getCoreRowModel,
  getFilteredRowModel,
  getSortedRowModel,
  useReactTable,
} from '@tanstack/react-table';

import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';

import { Input } from '../ui/input';

import type { ColumnDef, SortingState } from '@tanstack/react-table';

interface ChangesTableProps<TData, TValue> {
  columns: ColumnDef<TData, TValue>[];
  data: TData[];
}

export function ChangesTable<TData, TValue>({
  columns,
  data,
}: ChangesTableProps<TData, TValue>) {
  const [sorting, setSorting] = useState<SortingState>([]);
  const [globalFilter, setGlobalFilter] = useState('');

  const table = useReactTable({
    data,
    columns,

    getCoreRowModel: getCoreRowModel(),

    // ✅ сортировка
    onSortingChange: setSorting,
    getSortedRowModel: getSortedRowModel(),

    // ✅ фильтрация
    getFilteredRowModel: getFilteredRowModel(),
    onGlobalFilterChange: setGlobalFilter,

    globalFilterFn: (row, _columnId, value) => {
      const search = String(value).toLowerCase();

      const oldText = String(
        row.getValue('oldFormulation') ?? '',
      ).toLowerCase();
      const newText = String(
        row.getValue('newFormulation') ?? '',
      ).toLowerCase();

      return oldText.includes(search) || newText.includes(search);
    },

    state: {
      sorting,
      globalFilter,
    },
  });

  return (
    <div className="overflow-hidden rounded-md border">
      {/* 🔍 Поиск */}
      <div className="flex items-center py-4 px-4">
        <Input
          placeholder="Поиск по формулировкам..."
          value={globalFilter ?? ''}
          onChange={(event) => setGlobalFilter(event.target.value)}
          className="max-w-sm"
        />
      </div>

      <Table>
        <TableHeader>
          {table.getHeaderGroups().map((headerGroup) => (
            <TableRow key={headerGroup.id}>
              {headerGroup.headers.map((header) => (
                <TableHead key={header.id}>
                  {header.isPlaceholder
                    ? null
                    : flexRender(
                        header.column.columnDef.header,
                        header.getContext(),
                      )}
                </TableHead>
              ))}
            </TableRow>
          ))}
        </TableHeader>

        <TableBody>
          {table.getRowModel().rows.length ? (
            table.getRowModel().rows.map((row) => (
              <TableRow key={row.id}>
                {row.getVisibleCells().map((cell) => (
                  <TableCell key={cell.id}>
                    {flexRender(cell.column.columnDef.cell, cell.getContext())}
                  </TableCell>
                ))}
              </TableRow>
            ))
          ) : (
            <TableRow>
              <TableCell colSpan={columns.length} className="h-24 text-center">
                Ничего не найдено
              </TableCell>
            </TableRow>
          )}
        </TableBody>
      </Table>
    </div>
  );
}
