import { useCallback } from "react";

type UseClipboardImagePasteOptions = {
  disabled?: boolean;
  onImagesPaste: (files: File[]) => void;
};

export function useClipboardImagePaste({ disabled = false, onImagesPaste }: UseClipboardImagePasteOptions) {
  const handlePaste = useCallback(
    (event: React.ClipboardEvent<HTMLElement>) => {
      if (disabled) {
        return;
      }

      const clipboardItems = Array.from(event.clipboardData?.items ?? []);
      if (clipboardItems.length === 0) {
        return;
      }

      const imageFiles = clipboardItems
        .filter((item) => item.kind === "file" && item.type.startsWith("image/"))
        .map((item) => item.getAsFile())
        .filter((file): file is File => file !== null);

      if (imageFiles.length === 0) {
        return;
      }

      event.preventDefault();
      onImagesPaste(imageFiles);
    },
    [disabled, onImagesPaste],
  );

  return {
    handlePaste,
  };
}
