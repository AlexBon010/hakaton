import { createFileRepository } from '../../repositories/file/createFileRepository';

import { CompareDocumentsUseCase } from './CompareDocumentsUseCase';

export const createCompareDocumentsUseCase = () => {
  const fileRepository = createFileRepository('http://localhost:3000');

  return new CompareDocumentsUseCase(fileRepository);
};

