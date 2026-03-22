import { memo } from "react";

import { type Message } from "../../types/chat.schema";
import { CopyButton } from "../common/CopyButton";
import { AttachmentsBlock } from "./AttachmentsBlock";

interface UserMessageProps {
  message: Message;
}

const UserMessageItem = memo(({ message }: UserMessageProps) => {
  const attachments = message.attachments ?? [];
  const hasAttachments = attachments.length > 0;
  const time = new Intl.DateTimeFormat(undefined, {
    hour: "2-digit",
    minute: "2-digit",
  }).format(new Date(message.timestamp));

  return (
    <div className="group flex w-full flex-row items-end justify-end gap-2">
      <div className="opacity-100 transition-opacity duration-200 sm:opacity-0 sm:group-hover:opacity-100">
        <CopyButton text={message.text} />
      </div>

      {/* Message bubble */}
      <div className="bg-primary text-primary-foreground inline-block max-w-[85%] rounded-2xl rounded-br-sm px-4 py-3 text-sm leading-relaxed wrap-break-word md:max-w-[65%]">
        {/* Attachments */}
        {hasAttachments && (
          <div className="mb-2.5">
            <AttachmentsBlock attachments={attachments} isUser />
          </div>
        )}

        <p className="whitespace-pre-wrap">{message.text}</p>

        {/* Timestamp */}
        <p className="text-primary-foreground/75 mt-1.5 text-right text-[11px]">{time}</p>
      </div>
    </div>
  );
});

export { UserMessageItem };
