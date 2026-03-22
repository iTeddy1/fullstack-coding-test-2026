import type { NextFunction, Request, Response } from "express";
import { ZodError } from "zod";

import { AppError } from "../utils/AppError";

export const globalErrorHandler = (err: any, req: Request, res: Response, next: NextFunction) => {
  void req;
  void next;

  if (err instanceof ZodError) {
    const errors = err.issues.map(issue => ({
      field: issue.path.join(".") || "root",
      message: issue.message,
    }));

    return res.status(400).json({
      status: "fail",
      message: "Validation failed",
      errors,
    });
  }

  if (err instanceof AppError) {
    return res.status(err.statusCode).json({
      status: err.status,
      message: err.message,
    });
  }

  console.error("Unhandled API error:", err);

  return res.status(500).json({
    status: "error",
    message: "Internal Server Error",
  });
};
