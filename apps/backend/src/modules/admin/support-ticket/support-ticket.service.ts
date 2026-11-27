import { SupportTicketModel } from "./support-ticket.model";
import { logAdminActivity } from "../activity-log/activity-log.service";

export async function getSupportTicketsService() {
  // Clean up any old dummy test tickets if present
  await SupportTicketModel.deleteMany({
    supportTicketId: { $in: ["TKT-1082", "TKT-1049", "TKT-1011", "TKT-1005", "TKT-1002"] },
  }).catch(() => {});

  const tickets = await SupportTicketModel.find().sort({ createdAt: -1 });

  return tickets.map((t) => ({
    id: t.supportTicketId || (t._id ? t._id.toString() : ""),
    _id: t._id,
    category: t.category,
    subject: t.subject,
    description: t.description,
    priority: t.priority,
    status: t.status,
    createdAt: t.createdAt ? t.createdAt.toISOString() : new Date().toISOString(),
    user: {
      id: t.userId || "usr-anon",
      name: t.userName || "Candidate",
      email: t.userEmail || "user@example.com",
    },
    userName: t.userName || "Candidate",
    userEmail: t.userEmail || "user@example.com",
    adminResponse:
      t.responses && t.responses.length > 0
        ? t.responses[t.responses.length - 1]?.message
        : "",
    responses: t.responses || [],
  }));
}

export async function getUserSupportTicketsService(userId?: any, userEmail?: any) {
  const filter: any = {};
  if (userId || userEmail) {
    filter.$or = [];
    if (userId) filter.$or.push({ userId });
    if (userEmail) filter.$or.push({ userEmail });
  }

  const tickets = await SupportTicketModel.find(filter).sort({ createdAt: -1 });
  return tickets.map((t) => ({
    id: t.supportTicketId || (t._id ? t._id.toString() : ""),
    _id: t._id,
    category: t.category,
    subject: t.subject,
    description: t.description,
    priority: t.priority,
    status: t.status,
    createdAt: t.createdAt ? t.createdAt.toISOString() : new Date().toISOString(),
    userName: t.userName || "Candidate",
    userEmail: t.userEmail || "",
    adminResponse:
      t.responses && t.responses.length > 0
        ? t.responses[t.responses.length - 1]?.message
        : "",
    responses: t.responses || [],
  }));
}

export async function createSupportTicketService(data: {
  category?: string;
  subject: string;
  description: string;
  priority?: "Low" | "Medium" | "High" | "Critical";
  user?: any;
}) {
  const ticketId = `TKT-${Math.floor(1000 + Math.random() * 9000)}`;

  const newTicket = await SupportTicketModel.create({
    supportTicketId: ticketId,
    userId: data.user?.id || data.user?._id || null,
    userName: data.user?.name || data.user?.fullName || "Candidate",
    userEmail: data.user?.email || "",
    category: data.category || "Technical Issue",
    subject: data.subject.trim(),
    description: data.description.trim(),
    priority: data.priority || "Medium",
    status: "Open",
  });

  await logAdminActivity(
    `Created support ticket ${ticketId}: "${data.subject}"`,
    `Ticket: ${ticketId}`,
    "Support"
  );

  return {
    id: newTicket.supportTicketId,
    category: newTicket.category,
    subject: newTicket.subject,
    description: newTicket.description,
    priority: newTicket.priority,
    status: newTicket.status,
    createdAt: newTicket.createdAt.toISOString(),
    userName: newTicket.userName,
    userEmail: newTicket.userEmail,
    adminResponse: "",
    user: {
      id: newTicket.userId || "usr-anon",
      name: newTicket.userName,
      email: newTicket.userEmail,
    },
  };
}

export async function updateTicketStatusService(
  id: string,
  data: {
    status?: "Open" | "In Progress" | "Resolved" | "Closed";
    priority?: "Low" | "Medium" | "High" | "Critical";
    responseMessage?: string;
    responder?: string;
  }
) {
  const ticket = await SupportTicketModel.findOne({
    $or: [{ _id: id.match(/^[0-9a-fA-F]{24}$/) ? id : null }, { supportTicketId: id }],
  });

  if (!ticket) {
    return null;
  }

  if (data.status) ticket.status = data.status;
  if (data.priority) ticket.priority = data.priority;
  if (data.responseMessage) {
    ticket.responses = ticket.responses || [];
    ticket.responses.push({
      responder: data.responder || "Super Admin",
      message: data.responseMessage,
      createdAt: new Date(),
    });
  }

  await ticket.save();

  await logAdminActivity(
    `Updated status of ticket ${ticket.supportTicketId} to "${ticket.status}"`,
    `Ticket: ${ticket.supportTicketId}`,
    "Support"
  );

  return ticket;
}

export async function deleteSupportTicketService(id: string) {
  const deleted = await SupportTicketModel.findOneAndDelete({
    $or: [{ _id: id.match(/^[0-9a-fA-F]{24}$/) ? id : null }, { supportTicketId: id }],
  });

  return deleted;
}
