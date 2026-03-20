import { FetchHttpClient } from '@/core/infrastructure/http';

import { ApiFileRepository } from './ApiFileRepository';

export const createFileRepository = (baseURL: string) => {
  const httpClient = new FetchHttpClient({ baseURL });

  return new ApiFileRepository(httpClient);
};

