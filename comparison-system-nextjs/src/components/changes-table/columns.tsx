'use client';

import { ArrowUpDown } from 'lucide-react';

import { priorityEnum } from '@/core/domain/files';
import { getPriorityValues } from '@/utils/getPriorityValues';

import { ChangesPriority } from '../changes-priority';
import { Button } from '../ui/button';

import type { Column, ColumnDef } from '@tanstack/react-table';

import type { ChangeItem, Priority } from '@/core/domain/files';

interface SortableHeaderProps {
  column: Column<ChangeItem>;
  title: string;
}

const SortableHeader = ({ column, title }: SortableHeaderProps) => (
  <Button
    variant="ghost"
    onClick={() => column.toggleSorting(column.getIsSorted() === 'asc')}
  >
    {title}
    <ArrowUpDown className="ml-2 h-4 w-4" />
  </Button>
);

export const columns: ColumnDef<ChangeItem>[] = [
  {
    accessorKey: 'priority',
    enableSorting: true,
    header: ({ column }) => (
      <SortableHeader column={column} title="Приоритет" />
    ),
    cell: ({ row }) => {
      const priority = row.getValue('priority') as Priority;
      const { label, color } = getPriorityValues(priority);

      return <ChangesPriority label={label} color={color} />;
    },
    sortingFn: (rowA, rowB) => {
      const order = priorityEnum.options;

      return (
        order.indexOf(rowA.getValue('priority')) -
        order.indexOf(rowB.getValue('priority'))
      );
    },
  },
  {
    accessorKey: 'oldFormulation',
    enableSorting: true,
    header: ({ column }) => (
      <SortableHeader column={column} title="Старая формулировка" />
    ),
    cell: ({ row }) => {
      const oldFormulation = row.getValue('oldFormulation') as string;

      return (
        <p className="max-w-300 whitespace-normal wrap-break-words">
          {oldFormulation}
        </p>
      );
    },
  },
  {
    accessorKey: 'newFormulation',
    enableSorting: true,
    header: ({ column }) => (
      <SortableHeader column={column} title="Новая формулировка" />
    ),
    cell: ({ row }) => {
      const newFormulation = row.getValue('newFormulation') as string;

      return (
        <p className="max-w-300 whitespace-normal wrap-break-words">
          {newFormulation}
        </p>
      );
    },
  },
];

