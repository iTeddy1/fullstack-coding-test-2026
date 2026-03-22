import { model, Schema, type HydratedDocument } from "mongoose";

export interface Upload {
  sessionId: string;
  originalName: string;
  filename: string;
  mimetype: string;
  size: number;
  storagePath: string;
  url: string;
  isAttached: boolean;
  expiresAt: Date;
  createdAt: Date;
}

export type UploadDocument = HydratedDocument<Upload>;

const uploadSchema = new Schema<Upload>(
  {
    sessionId: {
      type: String,
      required: true,
      trim: true,
    },
    originalName: {
      type: String,
      required: true,
    },
    filename: {
      type: String,
      required: true,
    },
    mimetype: {
      type: String,
      required: true,
    },
    size: {
      type: Number,
      required: true,
    },
    storagePath: {
      type: String,
      required: true,
    },
    url: {
      type: String,
      required: true,
    },
    isAttached: {
      type: Boolean,
      required: true,
      default: false,
    },
    expiresAt: {
      type: Date,
      required: true,
      index: true,
    },
    createdAt: {
      type: Date,
      default: Date.now,
    },
  },
  {
    versionKey: false,
  },
);

const UploadModel = model<Upload>("Upload", uploadSchema);

export default UploadModel;
