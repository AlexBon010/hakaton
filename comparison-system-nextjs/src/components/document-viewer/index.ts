'use client';

import dynamic from 'next/dynamic';

export const DocumentViewerLazy = dynamic(
  () => import('@/components/document-viewer/DocumentViewer'),
  { ssr: false },
);

