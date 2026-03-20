import type { Accept } from 'react-dropzone';

export const MAX_DOCUMENT_SIZE_MB = 10;
export const MAX_DOCUMENT_SIZE_BYTES = MAX_DOCUMENT_SIZE_MB * 1024 * 1024;

export const ACCEPTED_DOCUMENT_TYPES: Accept = {
  'application/pdf': ['.pdf'],
  'application/vnd.openxmlformats-officedocument.wordprocessingml.document': [
    '.docx',
  ],
};

export const DOCUMENT_UPLOADER_TEXTS = {
  loadingTitle: 'Идет загрузка документа',
  defaultTitle: 'Загрузите документ',
  defaultHint: 'Перетащите файл или нажмите для загрузки',
  errorHint: `Файл должен быть PDF или DOCX до ${MAX_DOCUMENT_SIZE_MB}MB`,
  loadingHint: 'Загрузка файла',
} as const;

