import { createFileRepository } from '../../repositories/file/createFileRepository';

import { CompareDocumentsUseCase } from './CompareDocumentsUseCase';

export const createCompareDocumentsUseCase = () => {
  const fileRepository = createFileRepository('http://localhost:3000/api');

  return new CompareDocumentsUseCase(fileRepository);
};

