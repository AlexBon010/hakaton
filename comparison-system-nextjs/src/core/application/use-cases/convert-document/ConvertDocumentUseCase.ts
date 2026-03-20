import { HttpError } from '@/core/infrastructure/http/errors';

import type { CustomFile } from '@/core/domain/files';

import type { FileRepository, UseCase } from '../../interfaces';

export type ConvertDocumentPayload = {
  file: CustomFile;
};
export type ConvertDocumentResponse = Blob;

export class ConvertDocumentUseCase implements UseCase<
  ConvertDocumentPayload,
  ConvertDocumentResponse
> {
  constructor(private readonly fileRepository: FileRepository) {}

  async execute(
    payload: ConvertDocumentPayload,
  ): Promise<ConvertDocumentResponse> {
    const { file } = payload;

    const formData = new FormData();
    if (file) formData.append('file', file);

    try {
      return await this.fileRepository.convert(formData);
    } catch (error) {
      if (error instanceof HttpError) {
        throw error;
      }

      throw new HttpError('Ошибка конвертации документа!');
    }
  }
}

