import { Router } from "express";
import {
  getSupportTickets,
  createSupportTicket,
  updateTicketStatus,
  deleteSupportTicket,
} from "./support-ticket.controller";

const router = Router();

router.get("/", getSupportTickets);
router.post("/", createSupportTicket);
router.put("/:id", updateTicketStatus);
router.delete("/:id", deleteSupportTicket);

export default router;
