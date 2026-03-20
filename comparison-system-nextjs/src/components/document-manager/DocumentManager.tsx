'use client';

import type { Ref } from 'react';

import { Loader2, X } from 'lucide-react';

import { useConvertDocumentMutation } from '@/hooks/useConvertDocumentMutation';

import { DocumentUploader } from '../document-uploader';
import { DocumentViewerLazy } from '../document-viewer';
import { Button } from '../ui/button';

import type { CustomFile } from '@/core/domain/files';

import type { DocumentViewerRef } from '../document-viewer/DocumentViewer';

interface DocumentManagerProps {
  file: CustomFile | null;
  onChange: (file: CustomFile | null) => void;
  viewerRef: Ref<DocumentViewerRef>;
}

const WORD_MIME_TYPE =
  'application/vnd.openxmlformats-officedocument.wordprocessingml.document';
const PDF_MIME_TYPE = 'application/pdf';

export const DocumentManager = ({
  file,
  onChange,
  viewerRef,
}: DocumentManagerProps) => {
  const { mutateAsync, isPending } = useConvertDocumentMutation();

  const handleFileChange = async (newFile: CustomFile) => {
    if (!newFile) return;

    if (typeof newFile === 'string') {
      if (
        newFile.endsWith('.pdf') ||
        newFile.startsWith('data:application/pdf')
      ) {
        onChange(newFile);
      }
      return;
    }

    const fileType = newFile.type;

    if (fileType === WORD_MIME_TYPE) {
      try {
        const pdfBlob = await mutateAsync({ file: newFile as File });
        onChange(pdfBlob);
      } catch (error) {
        console.error('Ошибка:', error);
        onChange(null);
      }
    } else if (fileType === PDF_MIME_TYPE) {
      onChange(newFile);
    }
  };

  return (
    <div className="w-160">
      {!file ? (
        <DocumentUploader isLoading={isPending} onChange={handleFileChange} />
      ) : (
        <div className="flex flex-col gap-4 relative group">
          <Button
            onClick={() => onChange(null)}
            variant="destructive"
            size="icon"
            className="absolute top-2 right-2 z-50 opacity-0 group-hover:opacity-100 transition-opacity"
            title="Удалить файл"
          >
            <X className="h-4 w-4" />
          </Button>

          {isPending && (
            <div className="absolute inset-0 z-40 flex items-center justify-center bg-background/50 backdrop-blur-sm">
              <Loader2 className="h-8 w-8 animate-spin" />
            </div>
          )}

          <DocumentViewerLazy file={file} ref={viewerRef} />
        </div>
      )}
    </div>
  );
};

