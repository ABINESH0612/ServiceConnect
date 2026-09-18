import { gatewayClient } from '@/lib/axios'
import type {
  Review,
  CreateReviewRequest,
  UpdateReviewRequest,
  PageResponse,
  PaginationParams,
} from '@/types'

// ============================================================
// Review API
//
// Gateway routes: /api/v1/reviews/**
// Controller path: /api/reviews/**
//
// IMPORTANT: Gateway path rewriting (/api/v1/reviews → /api/reviews)
// must be verified. Using gateway URL pattern.
// ============================================================

const BASE = '/api/v1/reviews'

export const reviewApi = {
  /** POST /api/v1/reviews — Create review (CUSTOMER, completed booking required) */
  create: (data: CreateReviewRequest) =>
    gatewayClient.post<Review>(BASE, data),

  /** GET /api/v1/reviews — All active reviews (paginated) */
  getAll: (params?: PaginationParams) =>
    gatewayClient.get<PageResponse<Review>>(BASE, { params }),

  /** GET /api/v1/reviews/:id */
  getById: (id: number) =>
    gatewayClient.get<Review>(`${BASE}/${id}`),

  /** GET /api/v1/reviews/booking/:bookingId */
  getByBooking: (bookingId: number) =>
    gatewayClient.get<Review>(`${BASE}/booking/${bookingId}`),

  /** GET /api/v1/reviews/provider/:providerId */
  getByProvider: (providerId: number, params?: PaginationParams) =>
    gatewayClient.get<PageResponse<Review>>(`${BASE}/provider/${providerId}`, { params }),

  /** GET /api/v1/reviews/customer/:customerId */
  getByCustomer: (customerId: number, params?: PaginationParams) =>
    gatewayClient.get<PageResponse<Review>>(`${BASE}/customer/${customerId}`, { params }),

  /** PUT /api/v1/reviews/:id — Update own review (CUSTOMER) */
  update: (id: number, data: UpdateReviewRequest) =>
    gatewayClient.put<Review>(`${BASE}/${id}`, data),

  /** DELETE /api/v1/reviews/:id — Soft delete own review (CUSTOMER) */
  delete: (id: number) =>
    gatewayClient.delete(`${BASE}/${id}`),
}
