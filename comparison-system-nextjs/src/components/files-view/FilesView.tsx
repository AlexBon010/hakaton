'use client';

import { useRef } from 'react';

import { ArrowRightLeft } from 'lucide-react';

import { ChangesList } from '../changes-list';
import { DocumentManager } from '../document-manager';
import { Button } from '../ui/button';

import type { ChangeItem, CustomFile } from '@/core/domain/files';

import type { DocumentViewerRef } from '../document-viewer/DocumentViewer';

interface FilesViewProps {
  oldDoc: CustomFile;
  newDoc: CustomFile;
  setOldDoc: (file: CustomFile) => void;
  setNewDoc: (file: CustomFile) => void;
  changes: ChangeItem[];
}

export const FilesView = ({
  oldDoc,
  newDoc,
  setNewDoc,
  setOldDoc,
  changes,
}: FilesViewProps) => {
  const oldViewerRef = useRef<DocumentViewerRef>(null);
  const newViewerRef = useRef<DocumentViewerRef>(null);

  const handleSwap = () => {
    setOldDoc(newDoc);
    setNewDoc(oldDoc);
  };

  const handleScrollToAnnotation = (
    pageNumber: number,
    annotationId: string,
  ) => {
    newViewerRef.current?.highlightAnnotaion(pageNumber, annotationId);
    oldViewerRef.current?.highlightAnnotaion(pageNumber, annotationId);
  };

  return (
    <div className="flex justify-center gap-4">
      <div className="flex items-center gap-2">
        <div>
          <h2 className="text-2xl mb-2 text-center">Старое положение</h2>
          <DocumentManager
            file={oldDoc}
            onChange={setOldDoc}
            viewerRef={oldViewerRef}
          />
        </div>
        <Button variant="ghost" size="icon-lg" onClick={handleSwap}>
          <ArrowRightLeft />
        </Button>
        <div>
          <h2 className="text-2xl mb-2 text-center">Новое положение</h2>
          <DocumentManager
            file={newDoc}
            onChange={setNewDoc}
            viewerRef={newViewerRef}
          />
        </div>
      </div>

      {changes.length !== 0 && (
        <ChangesList changes={changes} onItemClick={handleScrollToAnnotation} />
      )}
    </div>
  );
};

