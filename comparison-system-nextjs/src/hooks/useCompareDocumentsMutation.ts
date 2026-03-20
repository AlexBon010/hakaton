import { useMutation } from '@tanstack/react-query';

import { createCompareDocumentsUseCase } from '@/core/application/use-cases';

import type { CompareDocumentsPayload } from '@/core/application/use-cases';

export const useCompareDocumentsMutation = () => {
  const fn = createCompareDocumentsUseCase();

  return useMutation({
    mutationFn: (payload: CompareDocumentsPayload) => fn.execute(payload),
  });
};

