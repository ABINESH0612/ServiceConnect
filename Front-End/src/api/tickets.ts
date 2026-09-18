import { adminServiceClient } from '@/lib/axios'
import { useAuthStore } from '@/store/authStore'
import type {
  SupportTicket,
  SupportMessage,
  CreateTicketRequest,
  UpdateTicketRequest,
  AssignTicketRequest,
  SendMessageRequest,
  PageResponse,
  PaginationParams,
  TicketStatus,
} from '@/types'

// ============================================================
// Tickets API
//
// Admin service: port 8083
// Path: /api/v1/tickets/**
//
// Gateway has NO route for /api/v1/tickets/**.
// Use adminServiceClient (direct to port 8083) for ALL ticket operations.
// ============================================================

const BASE = '/api/v1/tickets'

// ---- Customer ticket operations -----------------------------
export const customerTicketApi = {
  /** POST /api/v1/tickets — Create ticket (CUSTOMER) */
  create: (data: CreateTicketRequest) => {
    let userId = useAuthStore.getState().user?.id
    if (!userId) {
      try {
        const stored = localStorage.getItem('sc-auth')
        if (stored) {
          const parsed = JSON.parse(stored)
          userId = parsed?.state?.user?.id
        }
      } catch {}
    }
    const payload = {
      ...data,
      customerId: data.customerId ?? userId,
    }
    return adminServiceClient.post<SupportTicket>(BASE, payload)
  },

  /** GET /api/v1/tickets — Own tickets (CUSTOMER, paginated) */
  getMyTickets: (params?: PaginationParams) =>
    adminServiceClient.get<PageResponse<SupportTicket>>(BASE, { params }),

  /** GET /api/v1/tickets/:ticketId — Own specific ticket */
  getById: (ticketId: number) =>
    adminServiceClient.get<SupportTicket>(`${BASE}/${ticketId}`),

  /** POST /api/v1/tickets/:ticketId/messages — Send message on own ticket */
  sendMessage: (ticketId: number, data: SendMessageRequest) => {
    const payload = {
      message: data.message ?? data.content,
    }
    return adminServiceClient.post<SupportMessage>(`${BASE}/${ticketId}/messages`, payload)
  },

  /** GET /api/v1/tickets/:ticketId/messages — Get messages (CUSTOMER) */
  getMessages: (ticketId: number, params?: PaginationParams) =>
    adminServiceClient.get<PageResponse<SupportMessage>>(`${BASE}/${ticketId}/messages`, { params }),
}

// ---- Support Agent ticket operations ------------------------
export const agentTicketApi = {
  /** GET /api/v1/tickets/assigned — Assigned tickets (SUPPORT_AGENT) */
  getAssigned: (params?: PaginationParams) =>
    adminServiceClient.get<PageResponse<SupportTicket>>(`${BASE}/assigned`, { params }),

  /** GET /api/v1/tickets/:ticketId/assigned — Specific assigned ticket */
  getAssignedById: (ticketId: number) =>
    adminServiceClient.get<SupportTicket>(`${BASE}/${ticketId}/assigned`),

  /** PATCH /api/v1/tickets/:ticketId/assigned — Update ticket (SUPPORT_AGENT) */
  updateAssigned: (ticketId: number, data: UpdateTicketRequest) =>
    adminServiceClient.patch<SupportTicket>(`${BASE}/${ticketId}/assigned`, data),

  /** POST /api/v1/tickets/:ticketId/agent/messages — Send agent reply */
  sendMessage: (ticketId: number, data: SendMessageRequest) => {
    const payload = {
      message: data.message ?? data.content,
    }
    return adminServiceClient.post<SupportMessage>(`${BASE}/${ticketId}/agent/messages`, payload)
  },

  /** GET /api/v1/tickets/:ticketId/agent/messages — Get ticket messages */
  getMessages: (ticketId: number, params?: PaginationParams) =>
    adminServiceClient.get<PageResponse<SupportMessage>>(`${BASE}/${ticketId}/agent/messages`, { params }),
}

// ---- Admin ticket operations --------------------------------
export const adminTicketApi = {
  /** GET /api/v1/tickets/admin — All tickets (ADMIN) */
  getAll: (params?: PaginationParams) =>
    adminServiceClient.get<PageResponse<SupportTicket>>(`${BASE}/admin`, { params }),

  /** GET /api/v1/tickets/admin/status/:status */
  getByStatus: (status: TicketStatus, params?: PaginationParams) =>
    adminServiceClient.get<PageResponse<SupportTicket>>(`${BASE}/admin/status/${status}`, { params }),

  /** GET /api/v1/tickets/admin/:ticketId */
  getById: (ticketId: number) =>
    adminServiceClient.get<SupportTicket>(`${BASE}/admin/${ticketId}`),

  /** PATCH /api/v1/tickets/admin/:ticketId */
  update: (ticketId: number, data: UpdateTicketRequest) =>
    adminServiceClient.patch<SupportTicket>(`${BASE}/admin/${ticketId}`, data),

  /** PATCH /api/v1/tickets/admin/:ticketId/assignment — Assign to agent */
  assign: (ticketId: number, data: AssignTicketRequest) =>
    adminServiceClient.patch(`${BASE}/admin/${ticketId}/assignment`, data),

  /** POST /api/v1/tickets/:ticketId/admin/messages */
  sendMessage: (ticketId: number, data: SendMessageRequest) => {
    const payload = {
      message: data.message ?? data.content,
    }
    return adminServiceClient.post<SupportMessage>(`${BASE}/${ticketId}/admin/messages`, payload)
  },

  /** GET /api/v1/tickets/:ticketId/admin/messages */
  getMessages: (ticketId: number, params?: PaginationParams) =>
    adminServiceClient.get<PageResponse<SupportMessage>>(`${BASE}/${ticketId}/admin/messages`, { params }),
}
