import mongoose from "mongoose";

const MONGO_URI = process.env.MONGO_URI || "mongodb://localhost:27017/fullstack-coding-test-2026";

const connectDB = async (): Promise<void> => {
  try {
    const conn = await mongoose.connect(MONGO_URI);
    console.log(`MongoDB connected: ${conn.connection.host}`);
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "Unknown database error";
    console.error(`MongoDB connection error: ${message}`);
    process.exit(1);
  }
};

export default connectDB;
