import { model, Schema, type HydratedDocument } from "mongoose";

export type ChatRole = "user" | "ai";

export interface ChatAttachment {
  url: string;
  name: string;
  type: string;
  fileId?: string | undefined;
  source?: "inline" | "uploaded" | undefined;
}

export interface Chat {
  sessionId: string;
  role: ChatRole;
  text: string;
  attachments: ChatAttachment[];
  model?: string;
  tool?: string;
  timestamp: Date;
}

export type ChatDocument = HydratedDocument<Chat>;

const chatSchema = new Schema<Chat>({
  sessionId: {
    type: String,
    required: true,
  },
  role: {
    type: String,
    enum: ["user", "ai"],
    required: true,
  },
  text: {
    type: String,
    required: true,
  },
  attachments: {
    type: [
      {
        url: { type: String, required: true },
        name: { type: String, required: true },
        type: { type: String, required: true },
        fileId: { type: String, required: false, trim: true },
        source: { type: String, enum: ["inline", "uploaded"], required: false },
      },
    ],
    default: [],
  },
  model: {
    type: String,
    required: false,
    trim: true,
  },
  tool: {
    type: String,
    required: false,
    trim: true,
  },
  timestamp: {
    type: Date,
    default: Date.now,
  },
});

const ChatModel = model<Chat>("Chat", chatSchema);

export default ChatModel;
