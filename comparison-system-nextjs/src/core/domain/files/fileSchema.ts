import { z } from 'zod';

export const fileSchema = z
  .union([z.instanceof(File), z.instanceof(Blob), z.string()])
  .nullable();

export type CustomFile = z.infer<typeof fileSchema>;

