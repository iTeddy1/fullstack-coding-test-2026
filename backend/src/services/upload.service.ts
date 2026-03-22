import { unlink } from "node:fs/promises";
import path from "path";

import type { ChatAttachment } from "../models/chat.model";
import {
  createUploadRecord,
  deleteUploadRecordsByIds,
  deleteUploadRecordsBySessionId,
  findExpiredOrphanUploadRecords,
  findUploadRecordsBySessionId,
  markUploadRecordsAsAttached,
} from "../repositories/upload.repository";
import { AppError } from "../utils/AppError";
import { ORPHAN_CLEANUP_INTERVAL_MS, ORPHAN_UPLOAD_TTL_MS, UPLOAD_DIR } from "../config/files";

export type UploadFileResult = {
  fileId: string;
  attachment: ChatAttachment;
};

export type CleanupUploadsResult = {
  scannedCount: number;
  deletedCount: number;
  fileDeleteFailures: number;
};

export type ClearSessionUploadsResult = {
  deletedCount: number;
  fileDeleteFailures: number;
};

export const persistUploadedFile = async (
  sessionId: string,
  file: Express.Multer.File | undefined,
): Promise<UploadFileResult> => {
  if (!file) {
    throw new AppError("No file uploaded.", 400);
  }

  const publicUrl = `/${UPLOAD_DIR}/${file.filename}`;
  const storagePath = path.normalize(file.path);

  const uploadRecord = await createUploadRecord({
    sessionId,
    originalName: file.originalname,
    filename: file.filename,
    mimetype: file.mimetype,
    size: file.size,
    storagePath,
    url: publicUrl,
    expiresAt: new Date(Date.now() + ORPHAN_UPLOAD_TTL_MS),
  });

  return {
    fileId: uploadRecord._id.toString(),
    attachment: {
      fileId: uploadRecord._id.toString(),
      name: file.originalname,
      type: file.mimetype,
      url: publicUrl,
      source: "uploaded",
    },
  };
};

export const markUploadedFilesAsAttached = async (sessionId: string, fileIds: string[]): Promise<void> => {
  const dedupedFileIds = Array.from(new Set(fileIds.filter(Boolean)));

  if (dedupedFileIds.length === 0) {
    return;
  }

  await markUploadRecordsAsAttached(sessionId, dedupedFileIds);
};

export const cleanupExpiredOrphanUploads = async (limit = 100): Promise<CleanupUploadsResult> => {
  const expiredOrphans = await findExpiredOrphanUploadRecords(new Date(), limit);
  console.log(`Found ${expiredOrphans.length} expired orphan uploads for cleanup.`);
  if (expiredOrphans.length === 0) {
    return {
      scannedCount: 0,
      deletedCount: 0,
      fileDeleteFailures: 0,
    };
  }

  const fileDeleteResults = await Promise.allSettled(
    expiredOrphans.map(async record => {
      try {
        await unlink(record.storagePath);
      } catch (error: unknown) {
        const isNotFound = (error as NodeJS.ErrnoException | undefined)?.code === "ENOENT";
        if (!isNotFound) {
          throw error;
        }
      }
    }),
  );

  const orphanIds = expiredOrphans.map(record => record._id.toString());
  await deleteUploadRecordsByIds(orphanIds);

  const fileDeleteFailures = fileDeleteResults.filter(result => result.status === "rejected").length;

  return {
    scannedCount: expiredOrphans.length,
    deletedCount: orphanIds.length,
    fileDeleteFailures,
  };
};

export const startOrphanUploadCleanupJob = (): (() => void) => {
  let isRunning = false;

  const intervalId = setInterval(() => {
    if (isRunning) {
      return;
    }

    isRunning = true;

    void cleanupExpiredOrphanUploads()
      .catch(() => {
        // Cleanup failures are non-fatal for request handling and retried on next interval.
      })
      .finally(() => {
        isRunning = false;
      });
  }, ORPHAN_CLEANUP_INTERVAL_MS);

  return () => {
    clearInterval(intervalId);
  };
};

export const deleteUploadsBySessionId = async (sessionId: string): Promise<ClearSessionUploadsResult> => {
  const uploadRecords = await findUploadRecordsBySessionId(sessionId);

  if (uploadRecords.length === 0) {
    return {
      deletedCount: 0,
      fileDeleteFailures: 0,
    };
  }

  const fileDeleteResults = await Promise.allSettled(
    uploadRecords.map(async record => {
      try {
        await unlink(record.storagePath);
      } catch (error: unknown) {
        const isNotFound = (error as NodeJS.ErrnoException | undefined)?.code === "ENOENT";
        if (!isNotFound) {
          throw error;
        }
      }
    }),
  );

  const deletedCount = await deleteUploadRecordsBySessionId(sessionId);
  const fileDeleteFailures = fileDeleteResults.filter(result => result.status === "rejected").length;

  return {
    deletedCount,
    fileDeleteFailures,
  };
};
