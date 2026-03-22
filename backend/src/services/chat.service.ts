import type { Chat } from "../models/chat.model";
import type { ChatDocument } from "../models/chat.model";
import type { ChatAttachment } from "../models/chat.model";
import {
  clearChatHistoryBySessionId,
  createChatMessage,
  findChatHistoryBySessionId,
  findRecentMessagesBySessionId,
} from "../repositories/chat.repository";
import { deleteUploadsBySessionId, markUploadedFilesAsAttached } from "./upload.service";
import type { CursorPaginationResult } from "../utils/pagination.util";

export interface GenerateResponseResult {
  userMessage: ChatDocument;
  aiMessage: ChatDocument;
  payload: SlidingWindowPayloadMessage[];
}

export interface GenerateResponseOptions {
  model?: string;
  tool?: string;
  attachments?: ChatAttachment[];
}

export interface SlidingWindowPayloadMessage {
  role: "user" | "ai";
  content: string;
}

const buildLlmMessageContent = (text: string, attachments: ChatAttachment[] = []): string => {
  if (attachments.length === 0) {
    return text;
  }

  const attachmentsContent = attachments
    .map((attachment, index) => {
      return [
        `Attachment ${index + 1}:`,
        `name=${attachment.name}`,
        `type=${attachment.type}`,
        `url=${attachment.url}`,
        `source=${attachment.source ?? "uploaded"}`,
      ].join(" ");
    })
    .join("\n");

  return `User prompt: ${text}\n\nRelated attachments:\n${attachmentsContent}`;
};

const generateAIResponseFromContext = async (
  payload: SlidingWindowPayloadMessage[],
  prompt: string,
): Promise<string> => {
  const { content = "" } = payload.at(-1) ?? {};

  return `This is a simulated AI response to the user's prompt: "${prompt}". The most recent user message in context was: "${content}".`;
};

/**
 * @param {string} sessionId - The chat session identifier
 * @param {string} prompt - The user's input message
 * @returns {Promise<object>} The saved AI chat message document
 */
export const generateResponse = async (
  sessionId: string,
  text: string,
  options: GenerateResponseOptions = {},
): Promise<GenerateResponseResult> => {
  const metadata = {
    ...(options.model?.trim() ? { model: options.model.trim() } : {}),
    ...(options.tool?.trim() ? { tool: options.tool.trim() } : {}),
  };

  const attachments = options.attachments ?? [];

  // 1) Persist the user's message 
  const userMessage = await createChatMessage(sessionId, "user", text, attachments, metadata);

  // 1.1) Mark uploaded files as attached
  const uploadedFileIds = attachments
    .filter(attachment => attachment.source === "uploaded" && typeof attachment.fileId === "string")
    .map(attachment => attachment.fileId as string);
  await markUploadedFilesAsAttached(sessionId, uploadedFileIds);

  // 2) Build sliding-window context in-memory
  const recentMessages = await findRecentMessagesBySessionId(sessionId, 7);
  const payload = recentMessages.reverse().map(message => ({
    role: message.role,
    content: buildLlmMessageContent(message.text, message.attachments),
  }));

  // 3) Simulate AI response
  const AIResponseText = await generateAIResponseFromContext(payload, text);

  // 4) Persist AI response
  const aiMessage = await createChatMessage(sessionId, "ai", AIResponseText, [], metadata);

  return {
    userMessage,
    aiMessage,
    payload,
  };
};

/**
 * @param {string} sessionId - The chat session identifier
 * @returns {Promise<Array>} Array of chat message documents sorted by timestamp
 */
export const getChatHistory = async (
  sessionId: string,
  cursor?: string,
  limit = 20,
): Promise<CursorPaginationResult<Chat>> => {
  const result = await findChatHistoryBySessionId(sessionId, cursor, limit);
  result.data.reverse();
  return result;
};

export const clearChatHistory = async (sessionId: string) => {
  const [chatDeleteResult, uploadDeleteResult] = await Promise.all([
    clearChatHistoryBySessionId(sessionId),
    deleteUploadsBySessionId(sessionId),
  ]);

  return {
    chats: {
      deletedCount: chatDeleteResult.deletedCount ?? 0,
    },
    uploads: uploadDeleteResult,
  };
};
