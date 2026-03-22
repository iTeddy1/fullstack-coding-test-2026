import { ThumbsDown, ThumbsUp } from "lucide-react";
import { memo } from "react";

import { Button } from "@/components/ui/button";
import { type Message } from "../../types/chat.schema";
import { CopyButton } from "../common/CopyButton";
import { TypewriterText } from "../conversation/TypewriterText";
import { AttachmentsBlock } from "./AttachmentsBlock";

interface AiMessageItemProps {
  message: Message;
  isNewMessage?: boolean;
  onTypewriterComplete?: () => void;
}

const AiMessageItem = memo(({ message, isNewMessage = false, onTypewriterComplete }: AiMessageItemProps) => {
  const attachments = message.attachments ?? [];
  const hasAttachments = attachments.length > 0;
  const time = new Intl.DateTimeFormat(undefined, {
    hour: "2-digit",
    minute: "2-digit",
  }).format(new Date(message.timestamp));

  return (
    <div className="flex w-full flex-col items-start gap-1">
      {/* Message bubble */}
      <div className="text-foreground max-w-full rounded-bl-sm text-sm leading-relaxed wrap-break-word">
        <p className="whitespace-pre-wrap">
          {isNewMessage ? <TypewriterText content={message.text} onComplete={onTypewriterComplete} /> : message.text}
        </p>

        {/* Attachments */}
        {hasAttachments && (
          <div className="mt-3">
            <AttachmentsBlock attachments={attachments} isUser={false} />
          </div>
        )}

        {/* Timestamp */}
        <p className="text-muted-foreground mt-1.5 text-[11px]">{time}</p>
      </div>

      {/* Action bar */}
      {!isNewMessage && (
        <div className="flex items-center gap-0.5">
          <CopyButton text={message.text} />

          <Button
            variant={"ghost"}
            size={"icon-sm"}
            type="button"
            aria-label="Like response"
            className="text-muted-foreground hover:text-foreground hover:bg-muted inline-flex items-center justify-center rounded-lg p-1.5 transition-colors"
          >
            <ThumbsUp className="size-3.5" />
          </Button>

          <Button
            variant={"ghost"}
            size={"icon-sm"}
            type="button"
            aria-label="Dislike response"
            className="text-muted-foreground hover:text-foreground hover:bg-muted inline-flex items-center justify-center rounded-lg p-1.5 transition-colors"
          >
            <ThumbsDown className="size-3.5" />
          </Button>
        </div>
      )}
    </div>
  );
});

export { AiMessageItem };
