import type { Request, Response, NextFunction } from "express";
import {
  getExistingInterviewPrep,
  generateInterviewPrep,
} from "./interview-prep.service";

export async function getInterviewPrepController(
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    const userId = (req as any).user?.id;
    if (!userId) {
      res.status(401).json({
        success: false,
        message: "Authentication required to view interview preparation.",
      });
      return;
    }

    const data = await getExistingInterviewPrep(userId);

    if (!data) {
      res.status(404).json({
        success: false,
        notGenerated: true,
        message:
          "Interview preparation questions have not been generated yet. Please complete Step 2: Validate Data & Proceed to AI Analysis first.",
      });
      return;
    }

    res.status(200).json({
      success: true,
      message: "Interview preparation question bank retrieved successfully.",
      data,
    });
  } catch (error) {
    next(error);
  }
}

export async function regenerateInterviewPrepController(
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    const userId = (req as any).user?.id;
    if (!userId) {
      res.status(401).json({
        success: false,
        message: "Authentication required to regenerate interview preparation.",
      });
      return;
    }

    const data = await generateInterviewPrep(userId);

    if (!data) {
      res.status(400).json({
        success: false,
        message: "Failed to generate interview preparation questions. Ensure a valid JD is uploaded.",
      });
      return;
    }

    res.status(200).json({
      success: true,
      message: "Interview preparation questions regenerated and saved successfully.",
      data,
    });
  } catch (error) {
    next(error);
  }
}

