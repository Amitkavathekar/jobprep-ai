import type { Request, Response, NextFunction } from "express";
import {
  getSupportTicketsService,
  getUserSupportTicketsService,
  createSupportTicketService,
  updateTicketStatusService,
  deleteSupportTicketService,
} from "./support-ticket.service";
import { HTTP_STATUS } from "../../../constants/http-status";

// GET /api/admin/support-tickets
export const getSupportTickets = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const formatted = await getSupportTicketsService();

    res.status(HTTP_STATUS.OK).json({
      success: true,
      message: "Support tickets fetched from MongoDB",
      data: formatted,
    });
  } catch (error) {
    next(error);
  }
};

// GET /api/support-tickets/my
export const getUserSupportTickets = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const userId = (req as any).user?.id || (req as any).user?._id || req.query.userId;
    const userEmail = (req as any).user?.email || req.query.userEmail;

    const formatted = await getUserSupportTicketsService(userId, userEmail);

    res.status(HTTP_STATUS.OK).json({
      success: true,
      data: formatted,
    });
  } catch (error) {
    next(error);
  }
};

// POST /api/admin/support-tickets
export const createSupportTicket = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const { category, subject, description, priority, user } = req.body;

    if (!subject || !description) {
      res.status(HTTP_STATUS.BAD_REQUEST).json({
        success: false,
        message: "Subject and Description are required",
      });
      return;
    }

    const ticketUser = user || {
      id: (req as any).user?._id || (req as any).user?.id,
      name: (req as any).user?.fullName,
      email: (req as any).user?.email,
    };

    const result = await createSupportTicketService({
      category,
      subject,
      description,
      priority,
      user: ticketUser,
    });

    res.status(HTTP_STATUS.CREATED).json({
      success: true,
      message: "Support ticket created in database",
      data: result,
    });
  } catch (error) {
    next(error);
  }
};

// PUT /api/admin/support-tickets/:id
export const updateTicketStatus = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const id = String(req.params.id || "");
    const ticket = await updateTicketStatusService(id, req.body);

    if (!ticket) {
      res.status(HTTP_STATUS.NOT_FOUND).json({
        success: false,
        message: "Support ticket not found",
      });
      return;
    }

    res.status(HTTP_STATUS.OK).json({
      success: true,
      message: "Ticket updated in MongoDB",
      data: ticket,
    });
  } catch (error) {
    next(error);
  }
};

// DELETE /api/admin/support-tickets/:id
export const deleteSupportTicket = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const id = String(req.params.id || "");
    const deleted = await deleteSupportTicketService(id);

    if (!deleted) {
      res.status(HTTP_STATUS.NOT_FOUND).json({
        success: false,
        message: "Support ticket not found",
      });
      return;
    }

    res.status(HTTP_STATUS.OK).json({
      success: true,
      message: "Ticket deleted from database",
    });
  } catch (error) {
    next(error);
  }
};
