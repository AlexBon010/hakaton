import { z } from 'zod';

export const priorityEnum = z.enum(['safely', 'doubtful', 'contradictory']);

export type Priority = z.infer<typeof priorityEnum>;

