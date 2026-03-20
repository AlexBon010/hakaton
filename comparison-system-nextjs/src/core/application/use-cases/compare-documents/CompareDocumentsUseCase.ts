import { HttpError } from '@/core/infrastructure/http/errors';

import type { ComparisonResult, CustomFile } from '@/core/domain/files';

import type { FileRepository, UseCase } from '../../interfaces';

export type CompareDocumentsPayload = {
  oldDoc: CustomFile;
  newDoc: CustomFile;
};
export type CompareDocumentsResponse = ComparisonResult;

export class CompareDocumentsUseCase implements UseCase<
  CompareDocumentsPayload,
  CompareDocumentsResponse
> {
  constructor(private readonly fileRepository: FileRepository) {}

  async execute(
    payload: CompareDocumentsPayload,
  ): Promise<CompareDocumentsResponse> {
    const { oldDoc, newDoc } = payload;

    const formData = new FormData();
    if (oldDoc) formData.append('oldDoc', oldDoc);
    if (newDoc) formData.append('newDoc', newDoc);

    try {
      return await this.fileRepository.compare(formData);
    } catch (error) {
      if (error instanceof HttpError) {
        throw error;
      }

      throw new HttpError('Ошибка сравнения документов!');
    }
  }
}

