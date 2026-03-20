import { z } from 'zod';

import { changeItemSchema } from './changeItemSchema';
import { fileSchema } from './fileSchema';

export const comparisonResultSchema = z.object({
  annotatedOldDoc: z
    .url()
    .or(fileSchema)
    .describe('URL или файл старой версии'),
  annotatedNewDoc: z
    .string()
    .or(fileSchema)
    .describe('URL или файл новой версии'),
  changes: z.array(changeItemSchema).describe('Список найденных различий'),
});

export type ComparisonResult = z.infer<typeof comparisonResultSchema>;

