import { createFileRepository } from '../../repositories/file/createFileRepository';

import { ConvertDocumentUseCase } from './ConvertDocumentUseCase';

export const createConvertDocumentUseCase = () => {
  const fileRepository = createFileRepository('/api');

  return new ConvertDocumentUseCase(fileRepository);
};

