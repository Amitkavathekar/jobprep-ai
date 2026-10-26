import type { Request, Response, NextFunction } from "express";
import {
  getUserResumes,
  getResumeById,
  createResume,
  updateResume,
  deleteResume,
  togglePinResume,
  duplicateResume,
  uploadAndCreateResume,
} from "./resume.service";

export async function listResumesController(
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    const userId = (req as any).user?.id;
    if (!userId) {
      res.status(401).json({
        success: false,
        message: "Authentication required to view resumes",
      });
      return;
    }

    const search = typeof req.query.search === "string" ? req.query.search : undefined;
    const resumes = await getUserResumes(userId, { search });

    res.status(200).json({
      success: true,
      count: resumes.length,
      data: resumes,
    });
  } catch (error) {
    next(error);
  }
}

export async function getResumeByIdController(
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    const userId = (req as any).user?.id;
    if (!userId) {
      res.status(401).json({
        success: false,
        message: "Authentication required to view resume",
      });
      return;
    }

    const id = String(req.params.id);
    const resume = await getResumeById(userId, id);

    if (!resume) {
      res.status(404).json({
        success: false,
        message: "Resume not found or access denied",
      });
      return;
    }

    res.status(200).json({
      success: true,
      data: resume,
    });
  } catch (error) {
    next(error);
  }
}

export async function createResumeController(
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    const userId = (req as any).user?.id;
    if (!userId) {
      res.status(401).json({
        success: false,
        message: "Authentication required to create resume",
      });
      return;
    }

    const resume = await createResume(userId, req.body);

    res.status(201).json({
      success: true,
      message: "Resume created successfully",
      data: resume,
    });
  } catch (error) {
    next(error);
  }
}

export async function updateResumeController(
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    const userId = (req as any).user?.id;
    if (!userId) {
      res.status(401).json({
        success: false,
        message: "Authentication required to update resume",
      });
      return;
    }

    const id = String(req.params.id);
    const updated = await updateResume(userId, id, req.body);

    if (!updated) {
      res.status(404).json({
        success: false,
        message: "Resume not found or access denied",
      });
      return;
    }

    res.status(200).json({
      success: true,
      message: "Resume updated successfully",
      data: updated,
    });
  } catch (error) {
    next(error);
  }
}

export async function deleteResumeController(
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    const userId = (req as any).user?.id;
    if (!userId) {
      res.status(401).json({
        success: false,
        message: "Authentication required to delete resume",
      });
      return;
    }

    const id = String(req.params.id);
    const deleted = await deleteResume(userId, id);

    if (!deleted) {
      res.status(404).json({
        success: false,
        message: "Resume not found or access denied",
      });
      return;
    }

    res.status(200).json({
      success: true,
      message: "Resume deleted successfully",
    });
  } catch (error) {
    next(error);
  }
}

export async function togglePinResumeController(
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    const userId = (req as any).user?.id;
    if (!userId) {
      res.status(401).json({
        success: false,
        message: "Authentication required",
      });
      return;
    }

    const id = String(req.params.id);
    const updated = await togglePinResume(userId, id);

    if (!updated) {
      res.status(404).json({
        success: false,
        message: "Resume not found or access denied",
      });
      return;
    }

    res.status(200).json({
      success: true,
      message: "Resume pin status updated",
      data: updated,
    });
  } catch (error) {
    next(error);
  }
}

export async function duplicateResumeController(
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    const userId = (req as any).user?.id;
    if (!userId) {
      res.status(401).json({
        success: false,
        message: "Authentication required",
      });
      return;
    }

    const id = String(req.params.id);
    const newResume = await duplicateResume(userId, id);

    if (!newResume) {
      res.status(404).json({
        success: false,
        message: "Resume not found or access denied",
      });
      return;
    }

    res.status(201).json({
      success: true,
      message: "Resume duplicated successfully",
      data: newResume,
    });
  } catch (error) {
    next(error);
  }
}

export async function uploadResumeController(
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    const userId = (req as any).user?.id;
    if (!userId) {
      res.status(401).json({
        success: false,
        message: "Authentication required to upload resume",
      });
      return;
    }

    const file = req.file;
    if (!file) {
      res.status(400).json({
        success: false,
        message: "Please upload a valid PDF, DOCX, or TXT file",
      });
      return;
    }

    const resume = await uploadAndCreateResume(userId, file, {
      title: req.body.title,
      jobTitle: req.body.jobTitle,
    });

    res.status(201).json({
      success: true,
      message: "Resume uploaded and saved successfully",
      data: resume,
    });
  } catch (error) {
    next(error);
  }
}
