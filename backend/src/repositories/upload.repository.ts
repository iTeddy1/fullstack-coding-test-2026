import type { UploadDocument } from "../models/upload.model";
import UploadModel from "../models/upload.model";

export type CreateUploadInput = {
  sessionId: string;
  originalName: string;
  filename: string;
  mimetype: string;
  size: number;
  storagePath: string;
  url: string;
  expiresAt: Date;
};

export const createUploadRecord = async (input: CreateUploadInput): Promise<UploadDocument> => {
  return UploadModel.create(input);
};

export const markUploadRecordsAsAttached = async (sessionId: string, fileIds: string[]): Promise<void> => {
  await UploadModel.updateMany(
    {
      sessionId,
      _id: {
        $in: fileIds,
      },
    },
    {
      $set: {
        isAttached: true,
      },
      $unset: {
        expiresAt: 1,
      },
    },
  ).exec();
};

export const findExpiredOrphanUploadRecords = async (beforeDate: Date, limit = 100): Promise<UploadDocument[]> => {
  return UploadModel.find({
    isAttached: false,
    expiresAt: {
      $lte: beforeDate,
    },
  })
    .sort({ expiresAt: 1 })
    .limit(limit)
    .exec();
};

export const deleteUploadRecordsByIds = async (fileIds: string[]): Promise<void> => {
  await UploadModel.deleteMany({
    _id: {
      $in: fileIds,
    },
  });
};

export const findUploadRecordsBySessionId = async (sessionId: string): Promise<UploadDocument[]> => {
  return UploadModel.find({ sessionId }).exec();
};

export const deleteUploadRecordsBySessionId = async (sessionId: string): Promise<number> => {
  const result = await UploadModel.deleteMany({ sessionId }).exec();
  return result.deletedCount ?? 0;
};
