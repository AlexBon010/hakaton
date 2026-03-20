import type { ComparisonResult } from '@/core/domain/files/comparisonResultSchema';

export interface FileRepository {
  convert: (data: FormData) => Promise<Blob>;
  compare: (data: FormData) => Promise<ComparisonResult>;
}

