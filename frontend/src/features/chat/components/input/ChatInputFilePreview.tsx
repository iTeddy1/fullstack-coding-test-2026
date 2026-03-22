import { FileText, X } from "lucide-react";

import { Button } from "@/components/ui/button";

export type ChatInputAttachment = {
  id: string;
  file: File;
  previewUrl: string;
  type: AttachmentType;
};

type AttachmentType = "image" | "document";

type ChatInputFilePreviewProps = {
  attachments: ChatInputAttachment[];
  onRemove: (id: string) => void;
};

export function ChatInputFilePreview({ attachments, onRemove }: ChatInputFilePreviewProps) {
  return (
    <div className="my-4 flex gap-2 overflow-x-auto py-2">
      {attachments.map((attachment) => (
        <div key={attachment.id} className="relative shrink-0">
          {attachment.type === "image" ? (
            <img
              src={attachment.previewUrl}
              alt={attachment.file.name}
              className="border-border size-16 rounded-xl border object-cover"
            />
          ) : (
            <div className="border-border bg-muted/60 flex size-16 flex-col items-center justify-center gap-1 rounded-xl border px-1">
              <FileText className="text-muted-foreground size-4" aria-hidden="true" />
              <span className="text-foreground w-full truncate text-center text-[10px]" title={attachment.file.name}>
                {attachment.file.name}
              </span>
            </div>
          )}

          <Button
            type="button"
            variant="secondary"
            size="icon-xs"
            className="border-border absolute -top-1 -right-1 rounded-full border"
            onClick={() => onRemove(attachment.id)}
            aria-label={`Remove ${attachment.file.name}`}
          >
            <X aria-hidden="true" />
          </Button>
        </div>
      ))}
    </div>
  );
}
