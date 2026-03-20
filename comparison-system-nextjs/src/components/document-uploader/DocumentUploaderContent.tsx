import { AlertCircle, UploadCloud } from 'lucide-react';

import { Spinner } from '../ui/spinner';

import { DOCUMENT_UPLOADER_TEXTS } from './documentUploader.constants';

interface DocumentUploaderContentProps {
  hasError: boolean;
  isLoading: boolean;
}

interface StateBlockProps {
  icon: React.ReactNode;
  title: string;
  hint?: string;
  hintClassName?: string;
}

const StateBlock = ({ icon, title, hint, hintClassName }: StateBlockProps) => (
  <>
    {icon}
    <p className="text-center text-sm font-medium">{title}</p>
    {hint && (
      <p
        className={
          hintClassName ?? 'mt-1 text-xs text-muted-foreground'
        }
      >
        {hint}
      </p>
    )}
  </>
);

export const DocumentUploaderContent = ({
  hasError,
  isLoading,
}: DocumentUploaderContentProps) => {
  if (hasError) {
    return (
      <StateBlock
        icon={<AlertCircle className="mb-3 h-10 w-10 text-destructive" />}
        title={DOCUMENT_UPLOADER_TEXTS.defaultTitle}
        hint={DOCUMENT_UPLOADER_TEXTS.errorHint}
        hintClassName="mt-2 text-xs text-destructive"
      />
    );
  }

  if (isLoading) {
    return (
      <StateBlock
        icon={<Spinner className="size-18" />}
        title={DOCUMENT_UPLOADER_TEXTS.loadingTitle}
        hint={DOCUMENT_UPLOADER_TEXTS.loadingHint}
      />
    );
  }

  return (
    <StateBlock
      icon={
        <UploadCloud className="mb-3 h-10 w-10 text-muted-foreground transition-colors group-hover:text-primary" />
      }
      title={DOCUMENT_UPLOADER_TEXTS.defaultTitle}
      hint={DOCUMENT_UPLOADER_TEXTS.defaultHint}
    />
  );
};

