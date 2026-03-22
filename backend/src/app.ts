import cors from "cors";
import express, { type Request, type Response } from "express";
import path from "path";

import { BODY_SIZE_LIMIT, UPLOAD_DIR } from "./config/files";
import { globalErrorHandler } from "./middlewares/error.middleware";
import chatRoutes from "./routes/chat.routes";
import { AppError } from "./utils/AppError";

const app = express();

app.use(cors());
app.use(express.json({ limit: BODY_SIZE_LIMIT }));
app.use(express.urlencoded({ extended: true, limit: BODY_SIZE_LIMIT }));
app.use("/uploads", express.static(path.join(__dirname, `../${UPLOAD_DIR}`)));

app.use("/api/chat", chatRoutes);

app.get("/", (_req: Request, res: Response) => {
  res.json({ message: "Template.net fullstack coding test 2026 API is running" });
});

app.use((req, _res, next) => next(new AppError(`Can't find ${req.originalUrl}`, 404)));
app.use(globalErrorHandler);

export default app;
