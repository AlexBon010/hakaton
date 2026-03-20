import { comparisonResultSchema } from '@/core/domain/files/comparisonResultSchema';
import { mockChanges } from '@/mocks/mocksChanges';

import type { ComparisonResult } from '@/core/domain/files/comparisonResultSchema';
import type { FileRepository } from '../../interfaces';

export class MockFileRepository implements FileRepository {
  async convert(_data: FormData): Promise<Blob> {
    // Возвращаем пустой Blob как заглушку
    return new Blob();
  }

  async compare(_data: FormData): Promise<ComparisonResult> {
    const result: ComparisonResult = {
      annotatedNewDoc: '',
      annotatedOldDoc: '',
      changes: mockChanges,
    };

    // Эмулируем сетевую задержку и валидируем результат доменной схемой
    return new Promise((resolve) =>
      setTimeout(() => resolve(comparisonResultSchema.parse(result)), 500),
    );
  }
}

