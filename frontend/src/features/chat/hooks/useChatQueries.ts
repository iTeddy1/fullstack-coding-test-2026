import type { InfiniteData } from "@tanstack/react-query";
import { useInfiniteQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  clearChatMessage,
  generateChatMessage,
  getChatHistory,
  type GenerateChatMessagePayload,
} from "../api/chat.api";
import type { Message } from "../types/chat.schema";

type ChatHistoryQueryData = {
  success: boolean;
  data: Message[];
  nextCursor: string | null;
  hasNextPage: boolean;
};

type GenerateMessageContext = {
  previousMessages?: InfiniteData<ChatHistoryQueryData>;
  sessionId: string;
};

export const chatKeys = {
  history: (sessionId: string) => ["chatHistory", sessionId] as const,
} as const;

export const useChatHistory = (sessionId: string): ReturnType<typeof useInfiniteQuery<ChatHistoryQueryData>> => {
  return useInfiniteQuery({
    queryKey: chatKeys.history(sessionId),
    queryFn: ({ pageParam }) => getChatHistory(sessionId, pageParam as string | undefined),
    initialPageParam: undefined as string | undefined,
    getNextPageParam: (lastPage) => (lastPage.hasNextPage ? (lastPage.nextCursor ?? undefined) : undefined),
    enabled: !!sessionId,
  });
};

export const useGenerateMessage = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: generateChatMessage,
    onMutate: async (variables): Promise<GenerateMessageContext | undefined> => {
      const typedVariables = variables as GenerateChatMessagePayload;
      const sessionId = typedVariables.sessionId;

      if (!sessionId) {
        return undefined;
      }

      await queryClient.cancelQueries({
        queryKey: chatKeys.history(sessionId),
      });

      const previousMessages = queryClient.getQueryData<InfiniteData<ChatHistoryQueryData>>(
        chatKeys.history(sessionId),
      );
      const text = typedVariables.text.trim();
      const optimisticAttachments = typedVariables.attachments ?? [];

      const optimisticMessage: Message = {
        _id: Date.now().toString(),
        role: "user",
        text,
        timestamp: new Date().toISOString(),
        attachments: optimisticAttachments,
      };

      queryClient.setQueryData<InfiniteData<ChatHistoryQueryData>>(chatKeys.history(sessionId), (old) => {
        if (!old) {
          return {
            pageParams: [undefined],
            pages: [
              {
                success: true,
                data: [optimisticMessage],
                nextCursor: null,
                hasNextPage: false,
              },
            ],
          };
        }

        const firstPage = old.pages[0];

        if (!firstPage) {
          return old;
        }

        return {
          ...old,
          pages: [
            {
              ...firstPage,
              data: [...firstPage.data, optimisticMessage],
            },
            ...old.pages.slice(1),
          ],
        };
      });

      return { previousMessages, sessionId };
    },
    onError: (_error, _variables, context) => {
      if (!context?.sessionId) {
        return;
      }

      queryClient.setQueryData(chatKeys.history(context.sessionId), context.previousMessages);
    },
    onSettled: (_data, _error, variables, context) => {
      const typedVariables = variables as GenerateChatMessagePayload;
      const sessionId = typedVariables.sessionId || context?.sessionId;

      if (!sessionId) {
        return;
      }

      queryClient.invalidateQueries({
        queryKey: chatKeys.history(sessionId),
      });
    },
  });
};

type ClearChatContext = {
  previousMessages?: InfiniteData<ChatHistoryQueryData>;
  sessionId: string;
};

export const useClearChat = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: clearChatMessage,
    onMutate: async (sessionId): Promise<ClearChatContext | undefined> => {
      if (!sessionId) {
        return undefined;
      }

      await queryClient.cancelQueries({
        queryKey: chatKeys.history(sessionId),
      });

      const previousMessages = queryClient.getQueryData<InfiniteData<ChatHistoryQueryData>>(
        chatKeys.history(sessionId),
      );

      queryClient.setQueryData<InfiniteData<ChatHistoryQueryData>>(chatKeys.history(sessionId), (old) => {
        if (!old) {
          return {
            pageParams: [undefined],
            pages: [
              {
                success: true,
                data: [],
                nextCursor: null,
                hasNextPage: false,
              },
            ],
          };
        }

        return {
          ...old,
          pages: old.pages.map((page) => ({
            ...page,
            data: [],
            nextCursor: null,
            hasNextPage: false,
          })),
        };
      });

      return { previousMessages, sessionId };
    },
    onError: (_error, _sessionId, context) => {
      if (!context?.sessionId) {
        return;
      }

      queryClient.setQueryData(chatKeys.history(context.sessionId), context.previousMessages);
    },
    onSettled: (_data, _error, sessionId, context) => {
      const querySessionId = sessionId || context?.sessionId;

      if (!querySessionId) {
        return;
      }

      queryClient.invalidateQueries({
        queryKey: chatKeys.history(querySessionId),
      });
    },
  });
};
