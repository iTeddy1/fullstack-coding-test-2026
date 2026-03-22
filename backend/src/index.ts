import dotenv from "dotenv";

import connectDB from "./config/db";
import { startOrphanUploadCleanupJob } from "./services/upload.service";
import app from "./app";

dotenv.config();

const PORT = Number(process.env.PORT) || 5000;

// Connect to database and start server
connectDB()
  .then(() => {
    startOrphanUploadCleanupJob();

    app.listen(PORT, () => {
      console.log(`Server is running on port ${PORT}`);
    });
  })
  .catch((error: unknown) => {
    const message = error instanceof Error ? error.message : "Unknown startup error";
    console.error("Failed to start server:", message);
    process.exit(1);
  });
