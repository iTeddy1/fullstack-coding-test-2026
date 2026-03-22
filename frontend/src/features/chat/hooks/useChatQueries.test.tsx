import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { act, renderHook, waitFor } from "@testing-library/react";
import type { PropsWithChildren } from "react";
import { afterEach, describe, expect, it, vi } from "vitest";

import { chatKeys, useGenerateMessage } from "./useChatQueries";

const mockGenerateChatMessage = vi.fn();

vi.mock("../api/chat.api", () => ({
  generateChatMessage: (...args: unknown[]) => mockGenerateChatMessage(...args),
  getChatHistory: vi.fn(),
  clearChatMessage: vi.fn(),
}));

describe("useGenerateMessage", () => {
  afterEach(() => {
    mockGenerateChatMessage.mockReset();
  });

  it("adds optimistic user message before mutation resolves", async () => {
    const queryClient = new QueryClient();
    const sessionId = "session-optimistic";

    queryClient.setQueryData(chatKeys.history(sessionId), {
      pageParams: [undefined],
      pages: [
        {
          success: true,
          data: [],
          nextCursor: null,
          hasNextPage: false,
        },
      ],
    });

    let resolveMutation: (value: unknown) => void = () => {
      return;
    };
    mockGenerateChatMessage.mockImplementation(
      () =>
        new Promise((resolve) => {
          resolveMutation = resolve;
        }),
    );

    const wrapper = ({ children }: PropsWithChildren) => (
      <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
    );

    const { result } = renderHook(() => useGenerateMessage(), { wrapper });

    await act(async () => {
      result.current.mutate({
        sessionId,
        text: "  optimistic text  ",
        attachments: [],
      });
    });

    await waitFor(() => {
      const data = queryClient.getQueryData<{
        pages: Array<{ data: Array<{ text: string; role: string }> }>;
      }>(chatKeys.history(sessionId));

      expect(data?.pages[0]?.data).toHaveLength(1);
      expect(data?.pages[0]?.data[0]?.role).toBe("user");
      expect(data?.pages[0]?.data[0]?.text).toBe("optimistic text");
    });

    resolveMutation({ success: true, data: { aiMessage: { _id: "ai-1" } } });
  });
});
