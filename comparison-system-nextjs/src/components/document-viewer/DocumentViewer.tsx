'use client';

import {
  forwardRef,
  useEffect,
  useImperativeHandle,
  useRef,
  useState,
} from 'react';
import { Document, Page, pdfjs } from 'react-pdf';
import 'react-pdf/dist/Page/AnnotationLayer.css';
import 'react-pdf/dist/Page/TextLayer.css';
import type {
  Annotations,
  DocumentCallback,
} from 'react-pdf/dist/shared/types.js';

import { useVirtualizer } from '@tanstack/react-virtual';

import { cn } from '@/lib/utils';

import { Spinner } from '../ui/spinner';

import type { CustomFile } from '@/core/domain/files';

pdfjs.GlobalWorkerOptions.workerSrc = `//unpkg.com/pdfjs-dist@${pdfjs.version}/build/pdf.worker.min.mjs`;

export interface DocumentViewerRef {
  highlightAnnotaion: (pageNumber: number, annotationId: string) => void;
}

interface DocumentViewerProps {
  file: CustomFile;
}

const PAGE_HEIGHT = 800;
const PAGE_WIDTH = 640;

const DocumentViewer = forwardRef<DocumentViewerRef, DocumentViewerProps>(
  ({ file }, ref) => {
    const activeTimerRef = useRef<NodeJS.Timeout | null>(null);
    const parentRef = useRef<HTMLDivElement>(null);
    const [numPages, setNumPages] = useState(0);
    const [annotations, setAnnotations] = useState<Annotations>([]);
    const [activeAnnotationId, setActiveAnnotationId] = useState<string | null>(
      null,
    );

    const clearAllAnnotationTimers = () => {
      if (activeTimerRef.current) clearTimeout(activeTimerRef.current);
    };

    useImperativeHandle(ref, () => ({
      highlightAnnotaion: (pageNumber: number, annotationId: string) => {
        clearAllAnnotationTimers();

        if (pageNumber > 0 && pageNumber <= numPages) {
          rowVirtualizer.scrollToIndex(pageNumber - 1);
        }

        setActiveAnnotationId(annotationId);

        setTimeout(() => {
          setActiveAnnotationId(null);
        }, 3000);
      },
    }));

    useEffect(() => {
      return () => {
        clearAllAnnotationTimers();
      };
    }, []);

    const onDocumentLoadSuccess = async (pdf: DocumentCallback) => {
      setNumPages(pdf.numPages);

      const allAnnotations: Annotations = [];

      for (let i = 1; i <= pdf.numPages; i++) {
        const page = await pdf.getPage(i);
        const ann = await page.getAnnotations();

        console.log(ann);

        ann.forEach((a) => {
          if (a.subtype === 'Highlight') {
            allAnnotations.push({
              id: a.id,
              quadPoints: a.quadPoints,
              pageIndex: i - 1,
              color: a.color,
            });
          }
        });
      }

      setAnnotations(allAnnotations);
    };

    const rowVirtualizer = useVirtualizer({
      count: numPages,
      getScrollElement: () => parentRef.current,
      estimateSize: () => PAGE_HEIGHT,
      overscan: 3,
    });

    return (
      <div
        ref={parentRef}
        style={{
          height: PAGE_HEIGHT,
          overflowY: 'auto',
          width: PAGE_WIDTH,
        }}
        className="border rounded-xl bg-white shadow-sm "
      >
        <Document
          file={file}
          onLoadSuccess={onDocumentLoadSuccess}
          loading={
            <Spinner className="absolute top-1/2 left-1/2 size-18 -translate-1/2" />
          }
        >
          <div
            style={{
              height: rowVirtualizer.getTotalSize(),
              position: 'relative',
            }}
          >
            {rowVirtualizer.getVirtualItems().map((virtualRow) => {
              const pageIndex = virtualRow.index;

              const pageAnnotations = annotations.filter(
                (a) => a.pageIndex === pageIndex,
              );

              return (
                <div
                  key={virtualRow.key}
                  style={{
                    position: 'absolute',
                    top: 0,
                    left: 0,
                    width: '100%',
                    transform: `translateY(${virtualRow.start}px)`,
                    display: 'flex',
                    justifyContent: 'center',
                  }}
                >
                  <Page
                    pageNumber={virtualRow.index + 1}
                    renderAnnotationLayer={false}
                    renderTextLayer
                  />
                  <div>
                    {pageAnnotations.map((a) => {
                      const [r, g, b] = a.color;

                      const isTarget = a.id === activeAnnotationId;

                      if (!a.quadPoints) return null;

                      const quads = [];

                      for (let i = 0; i < a.quadPoints.length; i += 8) {
                        const x1 = a.quadPoints[i];
                        const y1 = a.quadPoints[i + 1];
                        const x2 = a.quadPoints[i + 2];
                        const y2 = a.quadPoints[i + 5];

                        quads.push(
                          <div
                            key={`${a.id}-${i}`}
                            data-id={a.id}
                            className={cn(
                              'transition duration-300 ease-in',
                              isTarget && 'annotation-blink',
                            )}
                            style={{
                              position: 'absolute',
                              left: x1 + 20,
                              top: PAGE_HEIGHT + 42 - y1,
                              width: x2 - x1,
                              height: y1 - y2,
                              background: `rgba(${r}, ${g}, ${b}, 0.4)`,
                              pointerEvents: 'none',
                            }}
                          />,
                        );
                      }

                      return quads;
                    })}
                  </div>
                </div>
              );
            })}
          </div>
        </Document>
      </div>
    );
  },
);

DocumentViewer.displayName = 'DocumentViewer';
export default DocumentViewer;

