import type { Priority } from '@/core/domain/files';

export const priorityConfig = {
  safely: {
    label: 'Безопасно',
    color: 'text-green-800 bg-green-200 border-green-400',
  },
  doubtful: {
    label: 'Требует проверки',
    color: 'text-yellow-800 bg-yellow-200 border-yellow-400',
  },
  contradictory: {
    label: 'Потенциальное противоречие',
    color: 'text-red-800 bg-red-200 border-red-400',
  },
};

export const getPriorityValues = (priority: Priority) => ({
  label: priorityConfig[priority].label,
  color: priorityConfig[priority].color,
});

