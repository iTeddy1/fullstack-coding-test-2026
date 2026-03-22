import express, { type Request } from "express";
import multer from "multer";
import path from "path";

import { clearChat, generateChat, getChatHistory, uploadFile } from "../controllers/chat.controller";
import { MAX_UPLOAD_SIZE_BYTES, UPLOAD_DIR } from "../config/files";

const router = express.Router();

// Multer configuration for file uploads
const storage = multer.diskStorage({
  destination: (_req: Request, _file: Express.Multer.File, cb: (error: Error | null, destination: string) => void) => {
    cb(null, path.join(__dirname, `../../${UPLOAD_DIR}`));
  },
  filename: (_req: Request, file: Express.Multer.File, cb: (error: Error | null, filename: string) => void) => {
    const uniqueSuffix = Date.now() + "-" + Math.round(Math.random() * 1e9);
    cb(null, uniqueSuffix + "-" + file.originalname);
  },
});

const upload = multer({
  storage,
  limits: {
    fileSize: MAX_UPLOAD_SIZE_BYTES,
  },
  fileFilter: (_req, file, cb) => {
    if (!file.mimetype) {
      cb(new Error("Invalid file type"));
      return;
    }

    cb(null, true);
  },
});

// POST /api/chat/generate
router.post("/generate", generateChat);

// POST /api/chat/upload
router.post("/upload", upload.single("file"), uploadFile);

// GET /api/chat/:sessionId
router.get("/:sessionId", getChatHistory);

// POST /api/chat/clear/:sessionId
router.post("/clear/:sessionId", clearChat);

export default router;
