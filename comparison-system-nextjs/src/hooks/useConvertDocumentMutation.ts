import { useMutation } from '@tanstack/react-query';

import { createConvertDocumentUseCase } from '@/core/application/use-cases';

import type { ConvertDocumentPayload } from '@/core/application/use-cases';

export const useConvertDocumentMutation = () => {
  const fn = createConvertDocumentUseCase();

  return useMutation({
    mutationFn: (payload: ConvertDocumentPayload) => fn.execute(payload),
  });
};

