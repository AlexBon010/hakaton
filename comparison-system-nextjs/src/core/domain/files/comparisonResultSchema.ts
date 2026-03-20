import { z } from 'zod';

import { changeItemSchema } from './changeItemSchema';

export const comparisonResultSchema = z.object({
  annotatedOldDoc: z
    .string()
    .describe('Base64-encoded annotated old PDF'),
  annotatedNewDoc: z
    .string()
    .describe('Base64-encoded annotated new PDF'),
  changes: z.array(changeItemSchema).describe('Список найденных различий'),
});

export type ComparisonResult = z.infer<typeof comparisonResultSchema>;

