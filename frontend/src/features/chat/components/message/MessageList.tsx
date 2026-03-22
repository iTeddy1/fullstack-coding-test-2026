import { SESSION_ID } from "@/common/config";
import { Spinner } from "@/components/ui/spinner";
import { cn } from "@/lib/utils";
import { useEffect, useLayoutEffect, useRef } from "react";
import { useChatHistory, useGenerateMessage } from "../../hooks/useChatQueries";
import { MessageItem } from "./MessageItem";

interface MessageListProps {
  className?: string;
  /** The _id of the AI message that should render with a typewriter effect. */
  newMessageId?: string | null;
  /** Called when the typewriter animation on the new message completes. */
  onTypewriterComplete?: () => void;
}

export function MessageList({ className, newMessageId, onTypewriterComplete }: MessageListProps) {
  const { data, isLoading, fetchNextPage, hasNextPage, isFetchingNextPage } = useChatHistory(SESSION_ID);
  const { isPending } = useGenerateMessage();

  const messages =
    data?.pages
      .slice()
      .reverse()
      .flatMap((page) => page.data) || [];
  const loadMoreRef = useRef<HTMLDivElement>(null);
  const previousScrollHeightRef = useRef<number>(0);
  const previousIsFetchingNextPageRef = useRef<boolean>(false);

  useEffect(() => {
    if (isFetchingNextPage && !previousIsFetchingNextPageRef.current) {
      previousScrollHeightRef.current = document.documentElement.scrollHeight;
    }

    previousIsFetchingNextPageRef.current = isFetchingNextPage;
  }, [isFetchingNextPage, data?.pages.length, messages.length]);

  useLayoutEffect(() => {
    const wasFetchingNextPage = previousIsFetchingNextPageRef.current;
    // 1. Only compensate if we are actually loading older messages from the top
    // (check if isFetchingNextPage just turned from true to false, or compare data lengths)
    // Compensate only when a top-pagination fetch has just completed.
    if (!isFetchingNextPage && wasFetchingNextPage && previousScrollHeightRef.current > 0) {
      const currentScrollHeight = document.documentElement.scrollHeight;
      const heightDifference = currentScrollHeight - previousScrollHeightRef.current;

      if (heightDifference > 0) {
        window.scrollBy({ top: heightDifference, behavior: "auto" });
      }

      previousScrollHeightRef.current = 0;
    }
  }, [data, isFetchingNextPage]);

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0]?.isIntersecting && hasNextPage && !isFetchingNextPage) {
          void fetchNextPage();
        }
      },
      { root: null, rootMargin: "100px", threshold: 0.1 },
    );

    if (loadMoreRef.current) {
      observer.observe(loadMoreRef.current);
    }

    return () => observer.disconnect();
  }, [hasNextPage, isFetchingNextPage, fetchNextPage]);

  return (
    <div className={cn("w-full flex-1 space-y-6 overflow-y-auto px-4 pb-12 md:px-8", className)}>
      <div ref={loadMoreRef} className="h-4 w-full bg-transparent" aria-hidden="true" />
      {isFetchingNextPage && (
        <div className="bg-background/80 sticky top-0 z-10 flex justify-center px-2 py-2 pt-4 pb-3 backdrop-blur md:px-4">
          <Spinner />
        </div>
      )}
      {messages.length === 0 && !isLoading ? (
        <p className="text-muted-foreground px-2 pt-4 pb-3 text-sm md:px-0">
          Start the conversation by sending a prompt.
        </p>
      ) : (
        messages.map((message) => (
          <MessageItem
            key={`${message._id}`}
            message={message}
            isNewMessage={message._id === newMessageId}
            onTypewriterComplete={message._id === newMessageId ? onTypewriterComplete : undefined}
          />
        ))
      )}
      {/* //Loading */}
      {isPending || isLoading ? (
        <div className="px-2 pt-4 pb-3 md:px-4">
          <Spinner />
        </div>
      ) : null}
    </div>
  );
}
