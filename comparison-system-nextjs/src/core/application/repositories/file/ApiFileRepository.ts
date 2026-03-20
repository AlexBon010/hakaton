import { comparisonResultSchema } from '@/core/domain/files/comparisonResultSchema';
import { HttpError } from '@/core/infrastructure/http/errors';

import { Repository } from '../../interfaces/Repository';

import type { ComparisonResult } from '@/core/domain/files/comparisonResultSchema';

import type { FileRepository } from '../../interfaces';

export class ApiFileRepository extends Repository implements FileRepository {
  async convert(data: FormData): Promise<Blob> {
    try {
      return await this.http.post<Blob>('/file/convert', data);
    } catch (error) {
      if (error instanceof HttpError) {
        throw error;
      }

      throw new HttpError('Не удалось конвертировать файл');
    }
  }

  async compare(data: FormData): Promise<ComparisonResult> {
    try {
      const res = await this.http.post<ComparisonResult>(
        '/documents/compare',
        data,
      );

      console.log('[ApiFileRepository] Raw response keys:', Object.keys(res as object));

      const parsed = comparisonResultSchema.safeParse(res);
      if (!parsed.success) {
        console.error('[ApiFileRepository] Zod validation failed:', JSON.stringify(parsed.error.issues, null, 2));
        throw new HttpError(`Validation error: ${parsed.error.issues.map(i => `${i.path.join('.')}: ${i.message}`).join('; ')}`);
      }

      return parsed.data;
    } catch (error) {
      console.error('[ApiFileRepository] Compare error:', error);

      if (error instanceof HttpError) {
        throw error;
      }

      const message = error instanceof Error ? error.message : String(error);
      throw new HttpError(`Ошибка сравнения файлов: ${message}`);
    }
  }
}

