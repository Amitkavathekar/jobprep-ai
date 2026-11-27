import api from "@/lib/axios";
import { SupportTicket } from "@/types";
import { logAdminActivity } from "./activityLogService";

const STORAGE_KEY = "jobprep_support_tickets";

// IDs of dummy mock tickets to eliminate completely
const DUMMY_IDS = new Set(["TKT-1082", "TKT-1049", "TKT-1011", "TKT-1005", "TKT-1002"]);

let isSyncing = false;

function normalizeTicket(t: any): SupportTicket {
  const responses = t.responses || [];
  const latestResponse =
    t.adminResponse ||
    (responses.length > 0 ? responses[responses.length - 1]?.message : "");

  return {
    id: t.id || t.supportTicketId || `TKT-${Math.floor(1000 + Math.random() * 9000)}`,
    category: t.category || "Technical Issue",
    subject: t.subject || "Support Query",
    description: t.description || "",
    priority: t.priority || "Medium",
    status: t.status || "Open",
    createdAt: t.createdAt || new Date().toISOString(),
    userName: t.userName || t.user?.name || "Candidate",
    userEmail: t.userEmail || t.user?.email || "candidate@example.com",
    adminResponse: latestResponse || "",
    user: t.user || {
      id: t.userId || "usr-anon",
      name: t.userName || "Candidate",
      email: t.userEmail || "candidate@example.com",
    },
    responses,
  };
}

export function getStoredTickets(): SupportTicket[] {
  if (typeof window === "undefined") {
    return [];
  }

  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) {
      triggerDatabaseSync();
      return [];
    }

    const parsed = JSON.parse(raw);
    if (Array.isArray(parsed)) {
      // Filter out any leftover dummy tickets
      const clean = parsed
        .filter((t: any) => !DUMMY_IDS.has(t.id || t.supportTicketId))
        .map(normalizeTicket);
      
      triggerDatabaseSync();
      return clean;
    }

    triggerDatabaseSync();
    return [];
  } catch (err) {
    console.error("Error loading stored tickets:", err);
    return [];
  }
}

export async function triggerDatabaseSync(): Promise<SupportTicket[]> {
  if (isSyncing) return [];
  isSyncing = true;

  try {
    const apiTickets = await fetchSupportTicketsApi();
    if (typeof window !== "undefined") {
      const cleanApiTickets = Array.isArray(apiTickets)
        ? apiTickets.filter((t: any) => !DUMMY_IDS.has(t.id || t.supportTicketId)).map(normalizeTicket)
        : [];
      
      localStorage.setItem(STORAGE_KEY, JSON.stringify(cleanApiTickets));
      window.dispatchEvent(new Event("support_tickets_updated"));
      return cleanApiTickets;
    }
    return apiTickets;
  } catch (err) {
    console.warn("Background ticket sync error:", err);
    return [];
  } finally {
    setTimeout(() => {
      isSyncing = false;
    }, 1500);
  }
}

export function updateTicketStatus(
  ticketId: string,
  newStatus: string,
  adminResponse?: string
): void {
  let targetSubject = "Support Query";

  if (typeof window !== "undefined") {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      const list: SupportTicket[] = raw
        ? JSON.parse(raw).map(normalizeTicket)
        : [];

      const updated = list.map((t) => {
        if (t.id === ticketId || t.supportTicketId === ticketId) {
          targetSubject = t.subject;
          return {
            ...t,
            status: newStatus as any,
            adminResponse: adminResponse !== undefined ? adminResponse : t.adminResponse,
          };
        }
        return t;
      });

      localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
      window.dispatchEvent(new Event("support_tickets_updated"));
    } catch (err) {
      console.error("Error updating ticket status in localStorage:", err);
    }
  }

  // Log admin action to Activity Log
  try {
    logAdminActivity({
      action: `${newStatus === "Resolved" ? "Resolved" : "Updated status to " + newStatus} ticket ${ticketId}: "${targetSubject}"`,
      target: `Ticket: ${ticketId}`,
      type: "User Action",
    });
  } catch {}

  // Sync to MongoDB database via API
  updateTicketStatusApi(ticketId, newStatus, adminResponse).catch((err: any) => {
    console.warn("Could not sync ticket status to MongoDB:", err);
  });
}

export async function updateTicketStatusApi(
  ticketId: string,
  newStatus: string,
  adminResponse?: string
): Promise<boolean> {
  try {
    const res = await api.put(`/admin/support-tickets/${ticketId}`, {
      status: newStatus,
      responseMessage: adminResponse,
      responder: "Super Admin",
    });
    return Boolean(res.data?.success);
  } catch (err) {
    console.error("Error updating ticket status in database:", err);
    return false;
  }
}

export async function fetchSupportTicketsApi(): Promise<SupportTicket[]> {
  try {
    const res = await api.get("/admin/support-tickets");
    if (res.data?.success && Array.isArray(res.data.data)) {
      return res.data.data
        .filter((t: any) => !DUMMY_IDS.has(t.id || t.supportTicketId))
        .map(normalizeTicket);
    }
  } catch (err) {
    console.error("Error fetching support tickets from database:", err);
  }
  return [];
}

export async function fetchMySupportTicketsApi(userEmail?: string, userId?: string): Promise<SupportTicket[]> {
  try {
    const query = userEmail ? `?userEmail=${encodeURIComponent(userEmail)}` : userId ? `?userId=${encodeURIComponent(userId)}` : "";
    const res = await api.get(`/support-tickets/my${query}`);
    if (res.data?.success && Array.isArray(res.data.data)) {
      return res.data.data.map(normalizeTicket);
    }
  } catch {
    // fallback to local filter
  }

  if (typeof window !== "undefined") {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) {
      try {
        const list: SupportTicket[] = JSON.parse(raw);
        return list.filter((t) => 
          (userEmail && t.userEmail?.toLowerCase() === userEmail.toLowerCase()) ||
          (userId && t.user?.id === userId)
        );
      } catch {}
    }
  }

  return [];
}

export async function createNewTicketApi(
  user: { id?: string; name?: string; email?: string },
  data: {
    category: string;
    subject: string;
    description: string;
    priority?: string;
  }
): Promise<SupportTicket> {
  const payload = {
    user: {
      id: user.id || "usr-anon",
      name: user.name || "Candidate",
      email: user.email || "",
    },
    category: data.category,
    subject: data.subject,
    description: data.description,
    priority: data.priority || "Medium",
  };

  try {
    const res = await api.post("/admin/support-tickets", payload);
    if (res.data?.success && res.data.data) {
      const created = normalizeTicket(res.data.data);
      // Persist in localStorage and broadcast event
      if (typeof window !== "undefined") {
        try {
          const raw = localStorage.getItem(STORAGE_KEY);
          const list: SupportTicket[] = raw ? JSON.parse(raw).filter((x: any) => !DUMMY_IDS.has(x.id)) : [];
          list.unshift(created);
          localStorage.setItem(STORAGE_KEY, JSON.stringify(list));
          window.dispatchEvent(new Event("support_tickets_updated"));
        } catch {}
      }
      return created;
    }
  } catch (err) {
    console.warn("Backend ticket creation error:", err);
  }

  // Fallback offline support ticket
  const ticketId = `TKT-${Math.floor(1000 + Math.random() * 9000)}`;
  const fallbackTicket: SupportTicket = {
    id: ticketId,
    category: data.category,
    subject: data.subject,
    description: data.description,
    priority: (data.priority as any) || "Medium",
    status: "Open",
    createdAt: new Date().toISOString(),
    userName: user.name || "Candidate",
    userEmail: user.email || "",
    adminResponse: "",
    user: {
      id: user.id || "usr-anon",
      name: user.name || "Candidate",
      email: user.email || "",
    },
  };

  if (typeof window !== "undefined") {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      const list: SupportTicket[] = raw ? JSON.parse(raw).filter((x: any) => !DUMMY_IDS.has(x.id)) : [];
      list.unshift(fallbackTicket);
      localStorage.setItem(STORAGE_KEY, JSON.stringify(list));
      window.dispatchEvent(new Event("support_tickets_updated"));
    } catch {}
  }

  return fallbackTicket;
}

// Backward-compatible wrapper
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
    userName: user.name,
    userEmail: user.email,
    adminResponse: "",
    user,
  };

  if (typeof window !== "undefined") {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      const list: SupportTicket[] = raw ? JSON.parse(raw).filter((x: any) => !DUMMY_IDS.has(x.id)) : [];
      list.unshift(ticket);
      localStorage.setItem(STORAGE_KEY, JSON.stringify(list));
      window.dispatchEvent(new Event("support_tickets_updated"));
    } catch {}
  }

  // Persist directly in MongoDB database
  createNewTicketApi(user, data).catch((err) => {
    console.error("Failed to save ticket to database:", err);
  });

  return ticket;
}
