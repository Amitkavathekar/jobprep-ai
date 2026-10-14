
import type { Request, Response, NextFunction } from "express";
import { analyzeResume } from "./ats.service";

export async function analyzeResumeController(
  req: Request,
  res: Response,
  next: NextFunction,
): Promise<void> {
  try {
    const file = req.file;

    if (!file) {
      res.status(400).json({
        success: false,
        message: "Please upload a PDF or DOCX resume.",
      });
      return;
    }

    const analysis = await analyzeResume(
      file,
      req.body.targetJobRole,
    );

    res.status(200).json({
      success: true,
      message: "Resume analyzed successfully.",
      data: analysis,
    });
  } catch (error) {
    next(error);
  }
}
