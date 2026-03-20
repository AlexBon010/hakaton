'use client';

import { useDropzone } from 'react-dropzone';

import { cn } from '@/lib/utils';

import { DocumentUploaderContent } from './DocumentUploaderContent';
import {
  ACCEPTED_DOCUMENT_TYPES,
  MAX_DOCUMENT_SIZE_BYTES,
} from './documentUploader.constants';

interface DocumentUploaderProps {
  isLoading: boolean;
  onChange: (file: File | null) => void;
}

export const DocumentUploader = ({
  isLoading,
  onChange,
}: DocumentUploaderProps) => {
  const {
    getRootProps,
    getInputProps,
    isDragActive,
    isDragReject,
    fileRejections,
  } = useDropzone({
    maxFiles: 1,
    maxSize: MAX_DOCUMENT_SIZE_BYTES,
    accept: ACCEPTED_DOCUMENT_TYPES,
    onDragEnter: () => {},
    onDrop: (acceptedFiles) => {
      if (acceptedFiles.length > 0) onChange(acceptedFiles[0]);
    },
  });

  const hasError = isDragReject || fileRejections.length > 0;

  return (
    <div
      {...getRootProps()}
      className={cn(
        'flex flex-col items-center justify-center p-8 border-2 border-dashed border-input rounded-lg cursor-pointer w-160 h-200 focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50 active:translate-y-px transition-all outline-none select-none',
        isDragActive && !hasError
          ? 'border-primary bg-primary/5'
          : !hasError &&
              'border-muted-foreground/20 hover:border-primary/50 hover:bg-muted/50',
        hasError && 'border-destructive bg-destructive/10 ',
      )}
    >
      <input {...getInputProps()} />
      <DocumentUploaderContent hasError={hasError} isLoading={isLoading} />
    </div>
  );
};

