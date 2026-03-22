import { z } from "zod";

import { cursorPaginationSchema } from "./pagination.dto";
import { MAX_ATTACHMENT_COUNT, UPLOAD_DIR } from "../config/files";

const uploadedAttachmentSchema = z.object({
  url: z
    .string()
    .min(1)
    .refine(
      value => value.startsWith(`/${UPLOAD_DIR}/`) || value.startsWith("http://") || value.startsWith("https://"),
      {
        message: "Uploaded attachment URL must be a public upload URL",
      },
    ),
  name: z.string().min(1),
  type: z.string().min(1),
  fileId: z.string().min(1),
  source: z.literal("uploaded").default("uploaded"),
});

export const chatAttachmentSchema = uploadedAttachmentSchema;

export const generateChatSchema = z.object({
  sessionId: z.string().min(1),
  text: z.string().trim().min(1, "Text is required").max(2000),
  model: z.string().optional().default(""),
  tool: z.string().optional().default(""),
  attachments: z
    .array(chatAttachmentSchema)
    .max(MAX_ATTACHMENT_COUNT, `Maximum ${MAX_ATTACHMENT_COUNT} attachments are allowed`)
    .optional()
    .default([]),
});

export const uploadFileSchema = z.object({
  sessionId: z.string().min(1, "sessionId is required"),
});

export const getChatHistorySchema = z
  .object({
    sessionId: z.string().min(1),
  })
  .merge(cursorPaginationSchema);

export type ChatAttachmentDto = z.infer<typeof chatAttachmentSchema>;
export type GenerateChatDto = z.infer<typeof generateChatSchema>;
export type GetChatHistoryDto = z.infer<typeof getChatHistorySchema>;
export type UploadFileDto = z.infer<typeof uploadFileSchema>;
