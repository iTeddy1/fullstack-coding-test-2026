import { BACKEND_BASE_URL } from "@/common/config";

export const resolveAttachmentUrl = (attachmentUrl: string): string => {
  if (/^(https?:\/\/|data:|blob:)/i.test(attachmentUrl)) {
    return attachmentUrl;
  }

  return `${BACKEND_BASE_URL}${attachmentUrl.startsWith("/") ? "" : "/"}${attachmentUrl}`;
};
