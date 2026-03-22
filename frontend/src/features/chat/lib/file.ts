import type { Message } from "../types/chat.schema";

const SUPPORTED_FILE_EXTENSIONS = new Set(["pdf", "csv", "doc", "docx", "xls", "xlsx"]);

function getFileExtension(fileName: string): string {
  const extension = fileName.split(".").pop();
  return extension ? extension.toLowerCase() : "";
}

function isSupportedFileAttachment(attachment: NonNullable<Message["attachments"]>[number]): boolean {
  return SUPPORTED_FILE_EXTENSIONS.has(getFileExtension(attachment.name));
}

export { isSupportedFileAttachment };
