import type { ComponentProps } from 'react';

import { ArrowDown } from 'lucide-react';

import { cn } from '@/lib/utils';
import { getPriorityValues } from '@/utils/getPriorityValues';

import { ChangesPriority } from '../changes-priority';

import type { ChangeItem } from '@/core/domain/files';

interface CardWithChangesProps extends ComponentProps<'div'>, ChangeItem {
  onClick: () => void;
}

export const CardWithChanges = ({
  index,
  priority,
  oldFormulation,
  newFormulation,
  onClick: handleClick,
}: CardWithChangesProps) => {
  const { color, label } = getPriorityValues(priority);

  return (
    <div
      className="flex gap-4 rounded-xl border bg-secondary p-3 text-left focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50 active:translate-y-px transition-all outline-none select-none"
      onClick={handleClick}
    >
      <div className={cn('w-1.5 rounded-full', color)} />

      <div className="flex flex-col gap-3 flex-1">
        <div className="flex items-center justify-between">
          <span className="text-sm text-muted-foreground">№{index}</span>
          <ChangesPriority label={label} color={color} />
        </div>

        <div className="flex flex-col gap-3 text-sm">
          <p className="rounded-md text-xs line-clamp-3">{oldFormulation}</p>

          <div className="flex text-muted-foreground">
            <ArrowDown size={18} />
          </div>

          <p className="rounded-md text-xs line-clamp-3">{newFormulation}</p>
        </div>
      </div>
    </div>
  );
};

