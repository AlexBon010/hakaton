import { FetchHttpClient } from '@/core/infrastructure/http';

import { ApiFileRepository } from './ApiFileRepository';

export const createFileRepository = (baseURL: string, timeout = 15 * 60 * 1000) => {
  const httpClient = new FetchHttpClient({ baseURL, timeout });

  return new ApiFileRepository(httpClient);
};

