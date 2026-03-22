import { isAxiosError } from "axios";
import { useCallback, useEffect, useMemo, useRef, useState, type ChangeEvent, type SubmitEvent } from "react";
import { toast } from "sonner";

import { MAX_ATTACHMENT_COUNT, MAX_ATTACHMENT_SIZE_BYTES } from "@/common/config";
import { uploadChatFile, type ChatGenerateAttachment } from "../api/chat.api";
import type { ChatInputAttachment } from "../components/input/ChatInputFilePreview";
import { MODEL_OPTIONS, TOOL_OPTIONS } from "../lib/config";
import { chatInputSchema } from "../types/chat.schema";
import { useGenerateMessage } from "./useChatQueries";

export type ChatFormModel = (typeof MODEL_OPTIONS)[number];
export type ChatFormTool = (typeof TOOL_OPTIONS)[number] | null;

type UseChatFormOptions = {
  sessionId: string;
  onSuccess?: (aiMessageId: string | null) => void;
  onSettled?: () => void;
};

type UseChatFormReturn = {
  prompt: string;
  attachments: ChatInputAttachment[];
  selectedModel: ChatFormModel;
  selectedTool: ChatFormTool;
  isGenerating: boolean;
  error: string | null;
  handlers: {
    setPrompt: (nextPrompt: string) => void;
    addAttachment: (event: ChangeEvent<HTMLInputElement>) => void;
    addFiles: (files: File[]) => void;
    removeAttachment: (id: string) => void;
    setModel: (model: ChatFormModel) => void;
    setTool: (tool: ChatFormTool) => void;
    submit: (event?: SubmitEvent) => Promise<boolean>;
  };
};

export function useChatForm({ sessionId, onSuccess, onSettled }: UseChatFormOptions): UseChatFormReturn {
  const [prompt, setPrompt] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [attachments, setAttachments] = useState<ChatInputAttachment[]>([]);
  const [selectedModel, setSelectedModel] = useState<ChatFormModel>(MODEL_OPTIONS[0]);
  const [selectedTool, setSelectedTool] = useState<ChatFormTool>(null);
  const attachmentsRef = useRef<ChatInputAttachment[]>([]);
  const { mutateAsync: generateMessage, isPending: isGenerating } = useGenerateMessage();

  useEffect(() => {
    attachmentsRef.current = attachments;
  }, [attachments]);

  useEffect(() => {
    return () => {
      attachmentsRef.current.forEach((attachment) => {
        URL.revokeObjectURL(attachment.previewUrl);
      });
    };
  }, []);

  const handleTextChange = useCallback((nextPrompt: string) => {
    setPrompt(nextPrompt);
    setError(null);
  }, []);

  const handleFilesAdd = useCallback((selectedFiles: File[]) => {
    if (selectedFiles.length === 0) {
      return;
    }

    const currentCount = attachmentsRef.current.length;
    if (currentCount >= MAX_ATTACHMENT_COUNT) {
      const message = `You can upload up to ${MAX_ATTACHMENT_COUNT} files.`;
      setError(message);
      toast.error(message);
      return;
    }

    const validFiles = selectedFiles.filter((file) => file.size <= MAX_ATTACHMENT_SIZE_BYTES);
    const oversizedCount = selectedFiles.length - validFiles.length;
    if (oversizedCount > 0) {
      const message = `Some files were skipped. Max size is ${Math.floor(MAX_ATTACHMENT_SIZE_BYTES / (1024 * 1024))}MB per file.`;
      setError(message);
      toast.error(message);
    }

    if (validFiles.length === 0) {
      return;
    }

    const availableSlots = MAX_ATTACHMENT_COUNT - currentCount;
    const acceptedFiles = validFiles.slice(0, availableSlots);

    if (acceptedFiles.length < validFiles.length) {
      const message = `Only ${MAX_ATTACHMENT_COUNT} files are allowed.`;
      setError(message);
      toast.error(message);
    }

    const nextAttachments = acceptedFiles.map((file, index) => ({
      id: `${file.name}-${file.lastModified}-${Date.now()}-${index}`,
      file,
      previewUrl: URL.createObjectURL(file),
      type: file.type.startsWith("image/") ? "image" : "document",
    })) satisfies ChatInputAttachment[];

    setError(null);
    setAttachments((current) => [...current, ...nextAttachments]);
  }, []);

  const handleAttachmentAdd = useCallback(
    (event: ChangeEvent<HTMLInputElement>) => {
      const selectedFiles = Array.from(event.target.files ?? []);
      event.target.value = "";
      handleFilesAdd(selectedFiles);
    },
    [handleFilesAdd],
  );

  const handleAttachmentRemove = useCallback((id: string) => {
    setAttachments((current) => {
      const target = current.find((attachment) => attachment.id === id);
      if (target) {
        URL.revokeObjectURL(target.previewUrl);
      }

      return current.filter((attachment) => attachment.id !== id);
    });
  }, []);

  const handleModelChange = useCallback((model: ChatFormModel) => {
    setSelectedModel(model);
  }, []);

  const handleToolChange = useCallback((tool: ChatFormTool) => {
    setSelectedTool(tool);
  }, []);

  const clearAttachmentUrls = useCallback((items: ChatInputAttachment[]) => {
    items.forEach((attachment) => {
      URL.revokeObjectURL(attachment.previewUrl);
    });
  }, []);

  const uploadAttachments = useCallback(
    async (items: ChatInputAttachment[]): Promise<ChatGenerateAttachment[]> => {
      if (items.length === 0) {
        return [];
      }

      const uploadedAttachments: ChatGenerateAttachment[] = [];

      for (const attachment of items) {
        const response = await uploadChatFile(attachment.file, sessionId);
        uploadedAttachments.push(response.data.attachment);
      }

      return uploadedAttachments;
    },
    [sessionId],
  );

  const handleSubmit = useCallback(
    async (event?: SubmitEvent): Promise<boolean> => {
      event?.preventDefault();

      const trimmedPrompt = prompt.trim();
      if (trimmedPrompt.length === 0) {
        return false;
      }

      const parsed = chatInputSchema.safeParse(trimmedPrompt);
      if (!parsed.success) {
        setError(parsed.error.issues[0]?.message ?? "Invalid prompt");
        return false;
      }

      setError(null);

      const currentPrompt = prompt;
      const currentAttachments = attachments;

      setPrompt("");
      setAttachments([]);

      try {
        const uploadedAttachments = await uploadAttachments(currentAttachments);

        const response = await generateMessage({
          sessionId,
          text: trimmedPrompt,
          model: selectedModel.value,
          tool: selectedTool?.label ?? "",
          attachments: uploadedAttachments,
        });
        const aiMessageId = response?.data?.aiMessage?._id;
        onSuccess?.(typeof aiMessageId === "string" ? aiMessageId : null);
        clearAttachmentUrls(currentAttachments);
        onSettled?.();
        return true;
      } catch (caughtError) {
        const fallbackMessage = "Failed to send message. Please try again.";
        const backendMessage = isAxiosError(caughtError)
          ? (() => {
              const responseData = caughtError.response?.data as
                | { message?: string; errors?: Array<{ message?: string }> }
                | undefined;

              return responseData?.errors?.[0]?.message ?? responseData?.message ?? fallbackMessage;
            })()
          : fallbackMessage;

        setError(backendMessage);
        toast.error(backendMessage);
        setPrompt(currentPrompt);
        setAttachments(currentAttachments);
        onSettled?.();
        return false;
      }
    },
    [
      attachments,
      clearAttachmentUrls,
      generateMessage,
      onSettled,
      onSuccess,
      prompt,
      selectedModel.value,
      selectedTool?.label,
      sessionId,
      uploadAttachments,
    ],
  );

  const handlers = useMemo(
    () => ({
      setPrompt: handleTextChange,
      addAttachment: handleAttachmentAdd,
      addFiles: handleFilesAdd,
      removeAttachment: handleAttachmentRemove,
      setModel: handleModelChange,
      setTool: handleToolChange,
      submit: handleSubmit,
    }),
    [
      handleAttachmentAdd,
      handleAttachmentRemove,
      handleFilesAdd,
      handleModelChange,
      handleSubmit,
      handleTextChange,
      handleToolChange,
    ],
  );

  return {
    prompt,
    attachments,
    selectedModel,
    selectedTool,
    isGenerating,
    error,
    handlers,
  };
}
