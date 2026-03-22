import { useCallback, useRef, useState } from "react";

type UseFileDropOptions = {
  disabled?: boolean;
  onFilesDrop: (files: File[]) => void;
};

const hasFiles = (event: React.DragEvent<HTMLElement>) => {
  return Array.from(event.dataTransfer?.types ?? []).includes("Files");
};

export function useFileDrop({ disabled = false, onFilesDrop }: UseFileDropOptions) {
  const [isDraggingFiles, setIsDraggingFiles] = useState(false);
  const dragDepthRef = useRef(0);

  const handleDragEnter = useCallback(
    (event: React.DragEvent<HTMLElement>) => {
      if (disabled || !hasFiles(event)) {
        return;
      }

      event.preventDefault();
      dragDepthRef.current += 1;
      setIsDraggingFiles(true);
    },
    [disabled],
  );

  const handleDragOver = useCallback(
    (event: React.DragEvent<HTMLElement>) => {
      if (disabled || !hasFiles(event)) {
        return;
      }

      event.preventDefault();
      event.dataTransfer.dropEffect = "copy";
      if (!isDraggingFiles) {
        setIsDraggingFiles(true);
      }
    },
    [disabled, isDraggingFiles],
  );

  const handleDragLeave = useCallback(
    (event: React.DragEvent<HTMLElement>) => {
      if (disabled || !hasFiles(event)) {
        return;
      }

      event.preventDefault();
      dragDepthRef.current = Math.max(0, dragDepthRef.current - 1);
      if (dragDepthRef.current === 0) {
        setIsDraggingFiles(false);
      }
    },
    [disabled],
  );

  const handleDrop = useCallback(
    (event: React.DragEvent<HTMLElement>) => {
      if (disabled) {
        return;
      }

      event.preventDefault();
      dragDepthRef.current = 0;
      setIsDraggingFiles(false);

      const files = Array.from(event.dataTransfer.files ?? []);
      if (files.length === 0) {
        return;
      }

      onFilesDrop(files);
    },
    [disabled, onFilesDrop],
  );

  return {
    isDraggingFiles,
    dragProps: {
      onDragEnter: handleDragEnter,
      onDragOver: handleDragOver,
      onDragLeave: handleDragLeave,
      onDrop: handleDrop,
    },
  };
}
