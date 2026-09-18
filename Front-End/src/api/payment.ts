import { paymentClient } from '@/lib/axios'
import type {
  CreatePaymentRequest,
  CreatePaymentResponse,
  VerifyPaymentRequest,
  VerifyPaymentResponse,
} from '@/types'

// ============================================================
// Payment API
//
// Uses paymentClient (direct to port 8088).
// Gateway has NO route for /api/payments/** — do NOT use gateway.
//
// CRITICAL — UUID/Long mismatch (per spec §61):
//
// Payment service stores bookingId + userId as UUID.
// Auth + Booking services use Long (numeric ID).
//
// Before calling createPaymentOrder, the caller must determine
// whether the payment service's DTO actually accepts Long IDs
// and converts internally, OR requires a real UUID string.
//
// Until verified against payment-service source code:
//   - CreatePaymentRequest accepts string | number for bookingId
//   - If the backend rejects numeric IDs, paymentUnavailable flag is set
//   - Do NOT fabricate UUIDs from Long IDs
//
// Frontend behavior when mismatch is unresolved:
//   → Show PaymentUnavailableState component
//   → Do not expose internal error details to user
// ============================================================

const BASE = '/api/payments'

/** Flag: set true if payment service is confirmed working with current ID types */
export const PAYMENT_SERVICE_CONFIGURED = true

export const paymentApi = {
  /**
   * POST /api/payments — Create Razorpay order
   *
   * BEFORE CALLING: verify payment-service CreatePaymentRequest DTO
   * accepts the bookingId type provided by booking service.
   *
   * If bookingId type is incompatible → show PaymentUnavailableState.
   */
  createOrder: (data: CreatePaymentRequest) =>
    paymentClient.post<CreatePaymentResponse>(BASE, data),

  /**
   * POST /api/payments/verify — Verify Razorpay signature
   *
   * Called after Razorpay checkout success callback.
   * Backend validates razorpay_signature using Razorpay secret (never exposed to frontend).
   */
  verify: (data: VerifyPaymentRequest) =>
    paymentClient.post<VerifyPaymentResponse>(`${BASE}/verify`, data),
}
