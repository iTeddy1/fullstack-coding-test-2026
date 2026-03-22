import { useCallback, useEffect, useRef, useState } from "react";

import { SESSION_ID } from "@/common/config";
import { Button } from "@/components/ui/button";
import { useChatForm } from "../hooks/useChatForm";
import { useChatHistory, useClearChat } from "../hooks/useChatQueries";
import { useScrollToBottom } from "../hooks/useScrollToBottom";
import { ScrollToBottomButton } from "./common/ScrollToBottomButton";
import { ChatInput } from "./input/ChatInput";
import { MessageList } from "./message/MessageList";

export default function ChatContainer() {
  const { isSuccess: isHistorySuccess } = useChatHistory(SESSION_ID);
  const { mutate: clearChat, isPending: isClearingChat } = useClearChat();

  // Track the _id of the most recent AI response that should animate
  const [newAiMessageId, setNewAiMessageId] = useState<string | null>(null);
  const hasAutoScrolledInitialHistoryRef = useRef(false);

  const { scrollToBottom } = useScrollToBottom(0);

  useEffect(() => {
    if (!isHistorySuccess || hasAutoScrolledInitialHistoryRef.current) {
      return;
    }

    scrollToBottom("auto");
    hasAutoScrolledInitialHistoryRef.current = true;
  }, [isHistorySuccess, scrollToBottom]);

  const handleTypewriterComplete = useCallback(() => {
    setNewAiMessageId(null);
  }, []);

  const chatForm = useChatForm({
    sessionId: SESSION_ID,
    onSuccess: (aiMessageId) => {
      if (aiMessageId) {
        setNewAiMessageId(aiMessageId);
      }
    },
    onSettled: () => {
      scrollToBottom();
    },
  });

  const handleClearChat = useCallback(() => {
    setNewAiMessageId(null);
    clearChat(SESSION_ID);
  }, [clearChat]);

  return (
    <main className="bg-background relative flex min-h-dvh flex-col pt-16 md:pt-24">
      {/* Header */}
      <header className="bg-background/95 supports-backdrop-filter:bg-background/80 fixed top-0 right-0 left-0 z-30 backdrop-blur">
        <div className="mx-auto flex w-full max-w-4xl justify-between px-4 pt-4 pb-3 md:px-8 md:pt-6">
          <div>
            <h1 className="text-2xl font-semibold tracking-tight text-balance md:text-3xl">AI Chat</h1>
            <p className="text-muted-foreground mt-1 text-sm">Ask anything and get an instant generated response.</p>
          </div>
          <Button onClick={handleClearChat} disabled={isClearingChat}>
            Clear chat
          </Button>
        </div>
      </header>

      <div className="relative mx-auto flex w-full max-w-4xl flex-1 flex-col">
        {/* Message list */}
        <MessageList
          className="w-full flex-1 space-y-6 px-2 sm:px-4 md:px-8"
          newMessageId={newAiMessageId}
          onTypewriterComplete={handleTypewriterComplete}
        />

        {/* Chat input */}
        <div className="bg-background/95 supports-backdrop-filter:bg-background/80 sticky bottom-0 z-20 w-full px-2 pt-2 pb-4 backdrop-blur sm:px-4 sm:pt-4 sm:pb-6 md:px-8">
          <div className="absolute -top-14 left-1/2 z-50 -translate-x-1/2">
            <ScrollToBottomButton />
          </div>
          <ChatInput
            prompt={chatForm.prompt}
            attachments={chatForm.attachments}
            selectedModel={chatForm.selectedModel}
            selectedTool={chatForm.selectedTool}
            isGenerating={chatForm.isGenerating}
            error={chatForm.error}
            handlers={chatForm.handlers}
          />
        </div>
      </div>
    </main>
  );
}
