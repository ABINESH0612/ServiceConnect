import { gatewayClient } from '@/lib/axios'
import { v4 as uuidv4 } from 'uuid'
import type {
  ServiceRequest,
  CreateBookingRequest,
  UpdateBookingStatusRequest,
  PageResponse,
  PaginationParams,
  BookingStatus,
} from '@/types'

// All booking endpoints route through gateway: /api/v1/bookings/**
const BASE = '/api/v1/bookings'

export const bookingApi = {
  /**
   * POST /api/v1/bookings/requests — Create booking (CUSTOMER)
   *
   * IMPORTANT: Each NEW booking attempt must use a FRESH UUID idempotency key.
   * Do NOT reuse a key for a different booking.
   * The key is generated here, not in the component.
   */
  create: (data: CreateBookingRequest, idempotencyKey?: string) =>
    gatewayClient.post<ServiceRequest>(
      `${BASE}/requests`,
      data,
      {
        headers: {
          'X-Idempotency-Key': idempotencyKey ?? uuidv4(),
        },
      },
    ),

  /** GET /api/v1/bookings/requests/:requestId */
  getById: (requestId: number) =>
    gatewayClient.get<ServiceRequest>(`${BASE}/requests/${requestId}`),

  /** GET /api/v1/bookings/customers/requests — Customer's own bookings (CUSTOMER) */
  getMyBookings: (params?: PaginationParams) =>
    gatewayClient.get<PageResponse<ServiceRequest>>(`${BASE}/customers/requests`, { params }),

  /** GET /api/v1/bookings/providers/requests — Incoming requests (PROVIDER) */
  getProviderBookings: (params?: PaginationParams) =>
    gatewayClient.get<PageResponse<ServiceRequest>>(`${BASE}/providers/requests`, { params }),

  /** GET /api/v1/bookings/providers/requests/status?status= — Filter by status (PROVIDER) */
  getProviderBookingsByStatus: (status: BookingStatus, params?: PaginationParams) =>
    gatewayClient.get<PageResponse<ServiceRequest>>(`${BASE}/providers/requests/status`, {
      params: { status, ...params },
    }),

  /** PATCH /api/v1/bookings/requests/:requestId/cancel (CUSTOMER) */
  cancel: (requestId: number) =>
    gatewayClient.patch<ServiceRequest>(`${BASE}/requests/${requestId}/cancel`),

  /** PATCH /api/v1/bookings/requests/:requestId/status (PROVIDER) */
  updateStatus: (requestId: number, data: UpdateBookingStatusRequest) =>
    gatewayClient.patch<ServiceRequest>(`${BASE}/requests/${requestId}/status`, data),
}

/** Generate a fresh idempotency key for a new booking attempt */
export function generateIdempotencyKey(): string {
  return uuidv4()
}
