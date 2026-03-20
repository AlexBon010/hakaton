import { cn } from '@/lib/utils';

interface ChagesPriorityProps {
  label: string;
  color: string;
}

export const ChangesPriority = ({ label, color }: ChagesPriorityProps) => (
  <span
    className={cn('rounded-md px-2 py-1 text-xs font-medium border', color)}
  >
    {label}
  </span>
);

