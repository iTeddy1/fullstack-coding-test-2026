import { memo, useCallback, useEffect, useRef, type KeyboardEvent } from "react";

import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { cn } from "@/lib/utils";
import { useClipboardImagePaste } from "../../hooks/input/useClipboardImagePaste";
import { useFileDrop } from "../../hooks/input/useFileDrop";
import type { ChatFormModel, ChatFormTool } from "../../hooks/useChatForm";
import { ChatInputFilePreview, type ChatInputAttachment } from "./ChatInputFilePreview";
import { ModelSelector } from "./ModelSelector";
import { ToolsMenu } from "./ToolsMenu";
import { UploadMenu } from "./UploadMenu";

type ChatInputProps = {
  prompt: string;
  attachments: ChatInputAttachment[];
  selectedModel: ChatFormModel;
  selectedTool: ChatFormTool;
  isGenerating: boolean;
  error: string | null;
  handlers: {
    setPrompt: (nextPrompt: string) => void;
    addAttachment: (event: React.ChangeEvent<HTMLInputElement>) => void;
    addFiles: (files: File[]) => void;
    removeAttachment: (id: string) => void;
    setModel: (model: ChatFormModel) => void;
    setTool: (tool: ChatFormTool) => void;
    submit: () => Promise<boolean>;
  };
};

const ChatInput = memo(function ChatInput({
  prompt,
  attachments,
  selectedModel,
  selectedTool,
  isGenerating,
  error,
  handlers,
}: ChatInputProps) {
  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    textareaRef.current?.focus();
  }, []);

  const handleInputResize = () => {
    if (!textareaRef.current) {
      return;
    }

    textareaRef.current.style.height = "auto";
    textareaRef.current.style.height = `${textareaRef.current.scrollHeight}px`;
  };

  const handleKeyDown = async (event: KeyboardEvent<HTMLTextAreaElement>) => {
    const isTouchDevice = window.matchMedia("(pointer: coarse)").matches;

    if (isTouchDevice) {
      return;
    }
    if (event.key === "Enter" && !event.shiftKey) {
      event.preventDefault();
      const wasSent = await handlers.submit();
      if (wasSent) {
        if (textareaRef.current) {
          textareaRef.current.style.height = "44px";
        }

        setTimeout(() => {
          textareaRef.current?.focus();
        }, 0);
      }
    }
  };

  const triggerFileSelect = useCallback((accept?: string) => {
    if (!fileInputRef.current) {
      return;
    }

    fileInputRef.current.accept = accept ?? "";
    fileInputRef.current.click();
  }, []);

  const isDisabled = isGenerating || (prompt.trim().length === 0 && attachments.length === 0);
  const { isDraggingFiles, dragProps } = useFileDrop({
    disabled: isGenerating,
    onFilesDrop: handlers.addFiles,
  });
  const { handlePaste } = useClipboardImagePaste({
    disabled: isGenerating,
    onImagesPaste: handlers.addFiles,
  });

  const handleSubmitClick = async () => {
    const wasSent = await handlers.submit();
    if (wasSent) {
      if (textareaRef.current) {
        textareaRef.current.style.height = "44px";
      }

      setTimeout(() => {
        textareaRef.current?.focus();
      }, 0);
    }
  };

  return (
    <div className="bg-background/90 rounded-3xl backdrop-blur" {...dragProps}>
      <div className="w-full rounded-3xl">
        <div
          className={cn(
            "border-border bg-background focus-within:ring-ring relative flex flex-col rounded-3xl border p-3 shadow-sm transition-colors focus-within:ring-1",
            isDraggingFiles && "border-primary/60 bg-primary/5 ring-primary/30 ring-2",
          )}
        >
          {isDraggingFiles && (
            <div className="bg-background/85 border-primary/50 absolute inset-2 z-10 flex items-center justify-center rounded-2xl border border-dashed">
              <p className="text-primary text-sm font-medium">Drop files to attach</p>
            </div>
          )}

          <input
            ref={fileInputRef}
            type="file"
            multiple
            className="hidden"
            onChange={handlers.addAttachment}
            disabled={isGenerating}
          />

          {attachments.length > 0 && (
            <ChatInputFilePreview attachments={attachments} onRemove={handlers.removeAttachment} />
          )}

          <Textarea
            ref={textareaRef}
            value={prompt}
            onChange={(event) => {
              handlers.setPrompt(event.target.value);
              handleInputResize();
            }}
            onKeyDown={handleKeyDown}
            onPaste={handlePaste}
            placeholder="Type your message…"
            name="prompt"
            aria-label="Message input"
            disabled={isGenerating}
            rows={2}
            className="max-h-48 min-h-11 resize-none overflow-y-auto border-none bg-transparent p-2 shadow-none focus-visible:ring-0"
          />

          <div className="mt-2 flex items-end justify-between gap-2 md:items-center">
            <div className="flex flex-wrap items-center gap-2">
              <UploadMenu isSubmitting={isGenerating} onTriggerSelect={triggerFileSelect} />
              <ToolsMenu disabled={isGenerating} selectedTool={selectedTool} onChange={handlers.setTool} />
              <ModelSelector disabled={isGenerating} selectedModel={selectedModel} onChange={handlers.setModel} />
            </div>

            <Button
              type="button"
              onClick={handleSubmitClick}
              title={
                prompt.trim().length === 0 && attachments.length === 0
                  ? "Type a message or attach files"
                  : "Generate response"
              }
              disabled={isDisabled}
              className={cn("shrink-0", isGenerating && "cursor-not-allowed")}
            >
              <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 16 16" fill="none">
                <g clipPath="url(#clip0_5326_70977)">
                  <path
                    d="M4.68126 10.673C4.48835 9.60881 3.70386 8.27234 2.21203 7.19575C1.47897 6.66363 0.733055 6.31714 0 6.16865V5.64891C1.45325 5.31479 2.88078 4.37432 3.79388 3.09972C4.25686 2.45624 4.55266 1.82513 4.68126 1.16927H5.22141C5.44004 2.41912 6.44317 3.80508 7.80639 4.73318C8.47514 5.19105 9.16962 5.50041 9.87695 5.64891V6.16865C8.44942 6.45326 6.7904 7.67836 5.96732 8.9282C5.55578 9.55931 5.31143 10.1409 5.22141 10.673H4.68126Z"
                    fill="white"
                  ></path>
                  <path
                    d="M12.2695 15.1109C12.131 14.2513 11.5678 13.1718 10.4966 12.3021C9.97029 11.8723 9.43473 11.5924 8.9084 11.4725V11.0527C9.95183 10.7828 10.9768 10.0231 11.6324 8.9936C11.9648 8.47383 12.1772 7.96405 12.2695 7.43429H12.6573C12.8143 8.44384 13.5346 9.56335 14.5133 10.313C14.9935 10.6829 15.4921 10.9327 16 11.0527V11.4725C14.975 11.7024 13.7839 12.692 13.1929 13.7015C12.8974 14.2113 12.722 14.6811 12.6573 15.1109H12.2695Z"
                    fill="white"
                  ></path>
                  <path
                    d="M12.6677 4.57551C12.6012 4.16266 12.3307 3.6442 11.8162 3.22655C11.5635 3.02013 11.3062 2.88571 11.0535 2.8281V2.62648C11.5546 2.49686 12.0468 2.13202 12.3617 1.63756C12.5214 1.38793 12.6234 1.1431 12.6677 0.888672H12.854C12.9294 1.37353 13.2753 1.91119 13.7453 2.27124C13.976 2.44886 14.2154 2.56887 14.4593 2.62648V2.8281C13.9671 2.93852 13.395 3.41377 13.1112 3.89863C12.9693 4.14346 12.885 4.36909 12.854 4.57551H12.6677Z"
                    fill="white"
                  ></path>
                </g>
                <defs>
                  <clipPath id="clip0_5326_70977">
                    <rect width="16" height="16" fill="white"></rect>
                  </clipPath>
                </defs>
              </svg>
              Generate Free
            </Button>
          </div>
        </div>
      </div>

      {error && <p className="text-destructive mx-auto mt-2 w-full max-w-4xl text-sm">{error}</p>}
    </div>
  );
});

export { ChatInput };
