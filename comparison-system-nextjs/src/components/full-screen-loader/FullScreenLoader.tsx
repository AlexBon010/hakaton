import { Spinner } from '../ui/spinner';

export const FullScreenLoader = () => (
  <div className="fixed inset-0 z-100 flex flex-col items-center justify-center bg-background/60 backdrop-blur-md transition-opacity">
    <div className="flex flex-col items-center gap-4">
      <Spinner className="size-24" />
      <p className="text-lg font-medium animate-pulse">Сверяем документы...</p>
    </div>
  </div>
);

