import { z } from "zod";

export type ChatRole = "user" | "ai";

export const chatInputSchema = z.string().min(1, "Prompt cannot be empty").max(2000, "Prompt is too long");
export const messageBaseSchema = z.object({
  role: z.enum(["user", "ai"]),
  text: z.string(),
  timestamp: z.string().or(z.date()),
});

export const messageResponseSchema = messageBaseSchema.extend({
  _id: z.string(),
  attachments: z
    .array(
      z.object({
        url: z.string(),
        name: z.string(),
        type: z.string(),
        fileId: z.string().optional(),
        source: z.enum(["inline", "uploaded"]).optional(),
      }),
    )
    .optional(),
});

export type CreateMessageInput = z.infer<typeof messageBaseSchema>;
export type Message = z.infer<typeof messageResponseSchema>;
