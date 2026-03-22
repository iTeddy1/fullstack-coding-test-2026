import api from "@/services/api";

const endpoint = "/chat";

export type ChatGenerateAttachment = {
  url: string;
  name: string;
  type: string;
  fileId?: string;
  source?: "inline" | "uploaded";
};

export type UploadChatFileResponse = {
  success: boolean;
  data: {
    fileId: string;
    attachment: ChatGenerateAttachment;
  };
};

export type GenerateChatMessagePayload = {
  sessionId: string;
  text: string;
  model?: string;
  tool?: string;
  attachments?: ChatGenerateAttachment[];
};

export const getChatHistory = async (sessionId: string, cursor?: string) => {
  const response = await api.get(`${endpoint}/${sessionId}`, {
    params: cursor ? { cursor } : undefined,
  });
  return response.data;
};

export const generateChatMessage = async (payload: GenerateChatMessagePayload) => {
  const response = await api.post(`${endpoint}/generate`, payload);
  return response.data;
};

export const clearChatMessage = async (sessionId: string) => {
  const response = await api.post(`${endpoint}/clear/${sessionId}`);
  return response.data;
};

export const uploadChatFile = async (file: File, sessionId: string): Promise<UploadChatFileResponse> => {
  const formData = new FormData();
  formData.append("file", file);
  formData.append("sessionId", sessionId);

  const response = await api.post(`${endpoint}/upload`, formData, {
    headers: {
      "Content-Type": "multipart/form-data",
    },
  });

  return response.data;
};
