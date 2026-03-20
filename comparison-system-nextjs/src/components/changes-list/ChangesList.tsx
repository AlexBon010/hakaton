'use client';

import { useMemo, useState } from 'react';

import { Search } from 'lucide-react';

import { cn } from '@/lib/utils';
import { priorityConfig } from '@/utils/getPriorityValues';

import { CardWithChanges } from '../card-with-changes';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { ScrollArea } from '../ui/scroll-area';

import { ChangesListEmptyState } from './ChangesListEmptyState';
import { ChangesListNotReadyState } from './ChangesListNotReadyState';

import type { ChangeItem, Priority } from '@/core/domain/files';

interface ChangesListProps {
  changes: ChangeItem[];
  onItemClick: (pageNumber: number, annotationId: string) => void;
}

export function ChangesList({
  changes,
  onItemClick: handleItemClick,
}: ChangesListProps) {
  const [query, setQuery] = useState('');
  const [activePriorities, setActivePriorities] = useState<Priority[]>([]);

  const filteredChanges = useMemo(() => {
    let result = changes;

    if (query) {
      const lowerQuery = query.toLowerCase();
      result = result.filter(
        (item) =>
          item.oldFormulation.toLowerCase().includes(lowerQuery) ||
          item.newFormulation.toLowerCase().includes(lowerQuery),
      );
    }

    if (activePriorities.length > 0) {
      result = result.filter((item) =>
        activePriorities.includes(item.priority),
      );
    }

    return result;
  }, [query, activePriorities, changes]);

  const counts = useMemo(() => {
    const c: Record<Priority, number> = {
      safely: 0,
      doubtful: 0,
      contradictory: 0,
    };

    changes.forEach((item) => {
      c[item.priority]++;
    });
    return c;
  }, [changes]);

  const handlePriorityClick = (priority: Priority) => {
    setActivePriorities((prev) =>
      prev.includes(priority)
        ? prev.filter((p) => p !== priority)
        : [...prev, priority],
    );
  };

  if (changes.length === 0) return <ChangesListNotReadyState />;

  return (
    <div className="flex flex-col gap-4 w-full">
      <div className="flex flex-col gap-4 mr-4">
        <div className="relative">
          <Search className="absolute size-4 top-1/2 left-2 -translate-y-1/2" />
          <Input
            placeholder="Поиск..."
            className="pl-8"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
          />
        </div>

        <div className="grid grid-cols-3 gap-2">
          {(['safely', 'doubtful', 'contradictory'] as const).map((p) => (
            <Button
              key={p}
              onClick={() => handlePriorityClick(p)}
              className={cn(
                'rounded-lg border transition',
                priorityConfig[p].color,
                !activePriorities.includes(p) && 'opacity-60',
              )}
            >
              {counts[p]}
            </Button>
          ))}
        </div>
      </div>

      <ScrollArea className="h-186 pr-4 rounded-lg">
        <div className="flex flex-col gap-2 overflow-auto">
          {filteredChanges.map((item) => (
            <CardWithChanges
              key={item.index}
              onClick={() => handleItemClick(3, item.annotationId)}
              {...item}
            />
          ))}

          {filteredChanges.length === 0 && <ChangesListEmptyState />}
        </div>
      </ScrollArea>
    </div>
  );
}

