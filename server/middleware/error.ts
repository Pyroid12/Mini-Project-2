import { Request, Response, NextFunction } from "express";

export function errorHandler(
  err: unknown,
  _req: Request,
  res: Response,
  _next: NextFunction
) {
  console.error("[server] unhandled error:", err);

  if (err instanceof Error) {
    const message = err.message;
    if (message.includes("File too large") || message.includes("LIMIT_FILE_SIZE")) {
      return res.status(400).json({
        error: "File exceeds the 5MB size limit. Please upload a smaller file.",
      });
    }
    if (message.includes("Invalid file type")) {
      return res.status(400).json({ error: message });
    }
    if (message.includes("rate limit") || message.includes("429")) {
      return res.status(429).json({
        error: "AI service rate limit reached. Please try again in a moment.",
      });
    }
    if (message.includes("timeout")) {
      return res.status(504).json({
        error: "AI service timed out. Please try again.",
      });
    }
  }

  return res.status(500).json({
    error: "An unexpected error occurred. Please try again.",
  });
}
