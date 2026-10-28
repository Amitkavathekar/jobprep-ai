import api from "@/lib/axios";
import { SupportTicket } from "@/types";

export function createNewTicket(
  user: { id: string; name: string; email: string },
  data: {
    category: string;
    subject: string;
    description: string;
    priority: string;
  }
): SupportTicket {
  const ticketId = `TKT-${Math.floor(1000 + Math.random() * 9000)}`;
  const ticket: SupportTicket = {
    id: ticketId,
    category: data.category,
    subject: data.subject,
    description: data.description,
    priority: data.priority,
    status: "Open",
    createdAt: new Date().toISOString(),
    user,
  };

  // Persist locally
  try {
    const existing = JSON.parse(localStorage.getItem("jobprep_support_tickets") || "[]");
    existing.unshift(ticket);
    localStorage.setItem("jobprep_support_tickets", JSON.stringify(existing));
  } catch {}

  // Sync to backend asynchronously
  api
    .post("/mock-interview/support-ticket", {
      ticketId,
      category: data.category,
      subject: data.subject,
      description: data.description,
      priority: data.priority,
    })
    .catch((err) => {
      console.warn("Backend ticket sync notification:", err?.message);
    });

  return ticket;
}
