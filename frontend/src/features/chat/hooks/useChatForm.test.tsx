import { act, renderHook, waitFor } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";

import { MAX_ATTACHMENT_SIZE_BYTES } from "@/common/config";
import { useChatForm } from "./useChatForm";

const mockGenerateMessage = vi.fn(async () => ({
  data: {
    aiMessage: {
      _id: "ai-test",
    },
  },
}));

const mockToastError = vi.fn();

vi.mock("./useChatQueries", () => ({
  useGenerateMessage: () => ({
    mutateAsync: mockGenerateMessage,
    isPending: false,
  }),
}));

vi.mock("../api/chat.api", () => ({
  uploadChatFile: vi.fn(),
}));

vi.mock("sonner", () => ({
  toast: {
    error: (...args: unknown[]) => mockToastError(...args),
  },
}));

describe("useChatForm", () => {
  afterEach(() => {
    mockToastError.mockReset();
  });

  it("rejects oversized attachments", () => {
    const { result } = renderHook(() =>
      useChatForm({
        sessionId: "session-files",
      }),
    );

    const oversizedFile = new File([new ArrayBuffer(MAX_ATTACHMENT_SIZE_BYTES + 1)], "big.txt", {
      type: "text/plain",
    });

    act(() => {
      result.current.handlers.addAttachment({
        target: {
          files: [oversizedFile],
          value: "",
        },
      } as unknown as React.ChangeEvent<HTMLInputElement>);
    });

    expect(result.current.attachments).toHaveLength(0);

    return waitFor(() => {
      expect(result.current.error).toBe(
        `Some files were skipped. Max size is ${Math.floor(MAX_ATTACHMENT_SIZE_BYTES / (1024 * 1024))}MB per file.`,
      );
      expect(mockToastError).toHaveBeenCalledTimes(1);
    });
  });
});
