import { access, mkdir, readdir, rm } from "node:fs/promises";
import path from "node:path";

import mongoose from "mongoose";
import { MongoMemoryServer } from "mongodb-memory-server";
import request from "supertest";
import { afterAll, afterEach, beforeAll, describe, expect, it } from "vitest";

import app from "../app";
import ChatModel from "../models/chat.model";
import UploadModel from "../models/upload.model";

const UPLOADS_DIR = path.resolve(__dirname, "../../uploads");

describe("Chat API integration", () => {
  let mongoServer: MongoMemoryServer;

  beforeAll(async () => {
    mongoServer = await MongoMemoryServer.create();
    await mongoose.connect(mongoServer.getUri());
    await mkdir(UPLOADS_DIR, { recursive: true });
  });

  afterEach(async () => {
    await ChatModel.deleteMany({});
    await UploadModel.deleteMany({});

    const files = await readdir(UPLOADS_DIR);
    await Promise.all(files.map(file => rm(path.join(UPLOADS_DIR, file), { force: true })));
  });

  afterAll(async () => {
    await mongoose.disconnect();
    await mongoServer.stop();
  });

  it("creates chat messages and returns paginated history", async () => {
    const sessionId = "test-session-a";

    const generateResponse = await request(app)
      .post("/api/chat/generate")
      .send({
        sessionId,
        text: "Hello from test",
        attachments: [],
      })
      .expect(200);

    expect(generateResponse.body.success).toBe(true);
    expect(generateResponse.body.data.aiMessage.role).toBe("ai");

    const historyResponse = await request(app).get(`/api/chat/${sessionId}`).expect(200);

    expect(historyResponse.body.success).toBe(true);
    expect(historyResponse.body.data).toHaveLength(2);
    expect(historyResponse.body.data[0].role).toBe("user");
    expect(historyResponse.body.data[1].role).toBe("ai");
  });

  it("clears chat history and deletes uploaded files for the session", async () => {
    const sessionId = "test-session-with-file";

    const uploadResponse = await request(app)
      .post("/api/chat/upload")
      .field("sessionId", sessionId)
      .attach("file", Buffer.from("hello file"), "sample.txt")
      .expect(200);

    const attachment = uploadResponse.body.data.attachment;
    const filePath = path.resolve(__dirname, "../../..", attachment.url.replace(/^\//, ""));

    await request(app)
      .post("/api/chat/generate")
      .send({
        sessionId,
        text: "use uploaded file",
        attachments: [attachment],
      })
      .expect(200);

    const clearResponse = await request(app).post(`/api/chat/${sessionId}`).expect(200);

    expect(clearResponse.body.success).toBe(true);
    expect(clearResponse.body.data.chats.deletedCount).toBeGreaterThan(0);
    expect(clearResponse.body.data.uploads.deletedCount).toBeGreaterThan(0);

    expect(await UploadModel.countDocuments({ sessionId })).toBe(0);

    await expect(access(filePath)).rejects.toBeDefined();
  });
});
