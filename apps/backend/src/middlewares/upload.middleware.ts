
import multer from "multer";
import type { Request } from "express";

const allowedMimeTypes = [
  "application/pdf",
  "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
  "text/plain",
  "application/octet-stream",
];

export const resumeUpload = multer({
  storage: multer.memoryStorage(),

  limits: {
    fileSize: 10 * 1024 * 1024,
    files: 1,
  },

  fileFilter: (
    _req: Request,
    file: Express.Multer.File,
    callback: multer.FileFilterCallback,
  ) => {
    const isAllowedMime = allowedMimeTypes.includes(file.mimetype);
    const hasAllowedExt = /\.(pdf|docx|txt)$/i.test(file.originalname);

    if (!isAllowedMime && !hasAllowedExt) {
      return callback(
        new Error("Only PDF, DOCX, and TXT resume files are supported."),
      );
    }

    callback(null, true);
  },
});
