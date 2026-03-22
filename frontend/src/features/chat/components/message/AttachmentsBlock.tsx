import { isSupportedFileAttachment } from "../../lib/file";
import { resolveAttachmentUrl } from "../../lib/message.utils";
import { type Message } from "../../types/chat.schema";
import { MessageFileAttachment } from "./MessageFileAttachment";
import { MessageImageAttachment } from "./MessageImageAttachment";

interface AttachmentsBlockProps {
  attachments: NonNullable<Message["attachments"]>;
  isUser: boolean;
}

export function AttachmentsBlock({ attachments, isUser }: AttachmentsBlockProps) {
  if (attachments.length === 0) return null;

  return (
    <div className="flex flex-col gap-2">
      <div className="flex flex-wrap gap-2">
        {attachments.map((attachment) => {
          const resolvedUrl = resolveAttachmentUrl(attachment.url);
          const key = `${attachment.url}-${attachment.name}`;

          if (attachment.type.startsWith("image/")) {
            return <MessageImageAttachment key={key} url={resolvedUrl} name={attachment.name} isUser={isUser} />;
          }

          if (isSupportedFileAttachment(attachment)) {
            return <MessageFileAttachment key={key} url={resolvedUrl} name={attachment.name} isUser={isUser} />;
          }

          return (
            <div
              key={key}
              className="border-border/60 bg-muted/40 text-muted-foreground rounded-xl border px-3 py-2 text-xs"
            >
              Unsupported file type: {attachment.name}
            </div>
          );
        })}
      </div>
    </div>
  );
}
