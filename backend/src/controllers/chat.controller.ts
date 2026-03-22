import type { Request, Response } from "express";
import { ZodError } from "zod";

import { uploadFileSchema, generateChatSchema, getChatHistorySchema, type GenerateChatDto } from "../dtos/chat.dto";
import {
  clearChatHistory,
  generateResponse,
  getChatHistory as getChatHistoryFromService,
} from "../services/chat.service";
import { persistUploadedFile } from "../services/upload.service";
import { AppError } from "../utils/AppError";
import { catchAsync } from "../utils/catchAsync";

type SessionParams = {
  sessionId: string;
};

/**
 * POST /api/chat/generate
 * Accepts a user message, builds a sliding window payload, and returns a simulated AI response.
 */
export const generateChat = catchAsync(
  async (req: Request<Record<string, never>, Record<string, never>, GenerateChatDto>, res: Response): Promise<any> => {
    try {
      const parsedBody = generateChatSchema.parse(req.body);
      const { sessionId, text, model, tool, attachments } = parsedBody;

      const normalizedAttachments = attachments.map(attachment => ({
        url: attachment.url,
        name: attachment.name,
        type: attachment.type,
        ...(attachment.fileId ? { fileId: attachment.fileId } : {}),
        ...(attachment.source ? { source: attachment.source } : {}),
      }));

      const result = await generateResponse(sessionId, text, {
        model,
        tool,
        attachments: normalizedAttachments,
      });

      return res.status(200).json({
        success: true,
        data: {
          aiMessage: result.aiMessage,
        },
      });
    } catch (error: unknown) {
      if (error instanceof AppError || error instanceof ZodError) {
        throw error;
      }

      const message = error instanceof Error ? error.message : "Failed to generate chat response.";
      throw new AppError(message, 500);
    }
  },
);

/**
 * GET /api/chat/:sessionId
 */
export const getChatHistory = catchAsync(async (req: Request<SessionParams>, res: Response): Promise<any> => {
  const parsedInput = getChatHistorySchema.parse({
    sessionId: req.params.sessionId,
    cursor: req.query.cursor,
    limit: req.query.limit,
  });

  const { sessionId, cursor, limit } = parsedInput;

  const result = await getChatHistoryFromService(sessionId, cursor, limit);

  return res.status(200).json({
    success: true,
    data: result.data,
    nextCursor: result.nextCursor,
    hasNextPage: result.hasNextPage,
  });
});

/**
 * POST /api/chat/upload
 */
export const uploadFile = catchAsync(async (req: Request, res: Response): Promise<any> => {
  const parsedBody = uploadFileSchema.parse(req.body);
  const result = await persistUploadedFile(parsedBody.sessionId, req.file);

  return res.status(200).json({
    success: true,
    data: result,
  });
});

export const clearChat = catchAsync(async (req: Request, res: Response) => {
  const { sessionId = "" } = req.params;

  if (!sessionId) {
    throw new AppError("sessionId is required.", 400);
  }

  const response = await clearChatHistory(sessionId as string);

  return res.status(200).json({
    success: true,
    data: response,
  });
});
