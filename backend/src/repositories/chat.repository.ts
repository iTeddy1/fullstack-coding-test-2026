import { SLIDING_WINDOW_SIZE } from "../config/chat";
import type { Chat, ChatAttachment, ChatDocument, ChatRole } from "../models/chat.model";
import ChatModel from "../models/chat.model";
import { paginateWithCursor } from "../utils/pagination.util";

type ChatMessageMetadata = {
  model?: string;
  tool?: string;
};

export const createChatMessage = async (
  sessionId: string,
  role: ChatRole,
  text: string,
  attachments: ChatAttachment[] = [],
  metadata: ChatMessageMetadata = {},
): Promise<ChatDocument> => {
  const payload = {
    sessionId,
    role,
    text,
    attachments,
    ...(metadata.model ? { model: metadata.model } : {}),
    ...(metadata.tool ? { tool: metadata.tool } : {}),
  };

  return ChatModel.create({
    ...payload,
  });
};

export const findChatHistoryBySessionId = async (sessionId: string, cursor?: string, limit = 20) => {
  return await paginateWithCursor(ChatModel, {
    query: { sessionId },
    limit,
    ...(cursor ? { cursor } : {}),
  });
};

export const clearChatHistoryBySessionId = async (sessionId: string) => {
  return ChatModel.deleteMany({ sessionId });
};

export const findRecentMessagesBySessionId = async (
  sessionId: string,
  limit = SLIDING_WINDOW_SIZE,
): Promise<Array<Pick<Chat, "role" | "text" | "attachments">>> => {
  const recentMessages = await ChatModel.find({ sessionId })
    .sort({ timestamp: -1, _id: -1 })
    .limit(limit)
    .select({ role: 1, text: 1, attachments: 1, _id: 0 })
    .lean()
    .exec();

  return recentMessages as Array<Pick<Chat, "role" | "text" | "attachments">>;
};

export const findReferencedAttachmentFileIds = async (sessionId: string, fileIds: string[]): Promise<string[]> => {
  const referencedIds = await ChatModel.distinct("attachments.fileId", {
    sessionId,
    "attachments.fileId": {
      $in: fileIds,
    },
  });

  return referencedIds.filter((id): id is string => typeof id === "string" && id.length > 0);
};
