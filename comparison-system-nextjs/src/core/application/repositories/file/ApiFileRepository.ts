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

      return comparisonResultSchema.parse(res);
    } catch (error) {
      if (error instanceof HttpError) {
        throw error;
      }

      throw new HttpError('Ошибка сравнения файлов!');
    }
  }
}

