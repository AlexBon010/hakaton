'use client';

import { useState } from 'react';

import { ChangesTable, columns } from '@/components/changes-table';
import { FilesView } from '@/components/files-view';
import { FullScreenLoader } from '@/components/full-screen-loader';
import { ModeToggle } from '@/components/mode-toggle';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useCompareDocumentsMutation } from '@/hooks/useCompareDocumentsMutation';

import type { ChangeItem, CustomFile } from '@/core/domain/files';

export default function Page() {
  const [oldDoc, setOldDoc] = useState<CustomFile>(null);
  const [newDoc, setNewDoc] = useState<CustomFile>(null);
  const [changes, setChanges] = useState<ChangeItem[]>([]);

  const { mutateAsync, isPending } = useCompareDocumentsMutation();

  const handleCompare = async (oldDoc: CustomFile, newDoc: CustomFile) => {
    try {
      const { changes, annotatedNewDoc, annotatedOldDoc } = await mutateAsync({
        oldDoc,
        newDoc,
      });

      setOldDoc(`data:application/pdf;base64,${annotatedOldDoc}`);
      setNewDoc(`data:application/pdf;base64,${annotatedNewDoc}`);
      setChanges(changes);
    } catch (error) {
      console.error('Ошибка', error);
    }
  };

  const isDisabled = !oldDoc || !newDoc;

  return (
    <>
      {isPending && <FullScreenLoader />}
      <Tabs defaultValue="files" className="mx-4 mt-2 gap-4 px-2 flex-row">
        <div className="flex justify-between items-center w-full">
          <div className="flex flex-row gap-4">
            <Button
              disabled={isDisabled}
              size="lg"
              onClick={() => handleCompare(oldDoc, newDoc)}
            >
              Сверить
            </Button>
            <ModeToggle />
          </div>
          <TabsList>
            <TabsTrigger value="files">Файлы</TabsTrigger>
            <TabsTrigger value="table" disabled={changes.length === 0}>
              Таблица
            </TabsTrigger>
          </TabsList>
        </div>
        <div className="flex gap-8">
          <TabsContent value="files">
            <FilesView
              oldDoc={oldDoc}
              newDoc={newDoc}
              setNewDoc={setNewDoc}
              setOldDoc={setOldDoc}
              changes={changes}
            />
          </TabsContent>
          <TabsContent value="table">
            <ChangesTable columns={columns} data={changes} />
          </TabsContent>
        </div>
      </Tabs>
    </>
  );
}

