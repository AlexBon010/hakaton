import { z } from 'zod';

import { priorityEnum } from './priorityEnum';

export const changeItemSchema = z.object({
  index: z.number(),
  priority: priorityEnum,
  oldFormulation: z.string(),
  newFormulation: z.string(),
  annotationId: z.string(),
});

export type ChangeItem = z.infer<typeof changeItemSchema>;

