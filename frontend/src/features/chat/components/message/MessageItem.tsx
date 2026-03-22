import { memo } from "react";

import { type Message } from "../../types/chat.schema";
import { AiMessageItem } from "./AiMessageItem";
import { UserMessageItem } from "./UserMessageItem";

interface MessageItemProps {
  message: Message;
  /** When true the AI text is revealed with a typewriter animation. */
  isNewMessage?: boolean;
  onTypewriterComplete?: () => void;
}

const MessageItem = memo(({ message, isNewMessage = false, onTypewriterComplete }: MessageItemProps) => {
  if (message.role === "user") {
    return <UserMessageItem message={message} />;
  }

  return <AiMessageItem message={message} isNewMessage={isNewMessage} onTypewriterComplete={onTypewriterComplete} />;
});

export { MessageItem };
