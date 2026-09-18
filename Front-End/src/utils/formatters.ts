import { format, formatDistanceToNow, parseISO, isValid } from 'date-fns'
import type { BookingStatus, PaymentStatus, TicketStatus, TicketPriority, ProviderStatus } from '@/types'

// ---- Date/Time ----------------------------------------------

export function formatDate(dateStr: string | undefined | null, fmt = 'dd MMM yyyy'): string {
  if (!dateStr) return '—'
  const d = parseISO(dateStr)
  return isValid(d) ? format(d, fmt) : '—'
}

export function formatDateTime(dateStr: string | undefined | null): string {
  return formatDate(dateStr, 'dd MMM yyyy, h:mm a')
}

export function formatTime(timeStr: string | undefined | null): string {
  if (!timeStr) return '—'
  // HH:mm format from backend
  const [h, m] = timeStr.split(':')
  const hour = parseInt(h, 10)
  const minute = m ?? '00'
  const ampm = hour >= 12 ? 'PM' : 'AM'
  const displayHour = hour % 12 || 12
  return `${displayHour}:${minute} ${ampm}`
}

export function formatRelative(dateStr: string | undefined | null): string {
  if (!dateStr) return '—'
  const d = parseISO(dateStr)
  return isValid(d) ? formatDistanceToNow(d, { addSuffix: true }) : '—'
}

// ---- Currency -----------------------------------------------

export function formatPrice(amount: number, currency = 'INR'): string {
  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency,
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(amount)
}

export function formatPricePerHour(amount: number): string {
  return `${formatPrice(amount)}/hr`
}

// ---- Status labels ------------------------------------------

export const BOOKING_STATUS_LABELS: Record<BookingStatus, string> = {
  PENDING: 'Pending',
  ACCEPTED: 'Accepted',
  REJECTED: 'Rejected',
  COMPLETED: 'Completed',
  CANCELLED: 'Cancelled',
}

export const BOOKING_STATUS_COLORS: Record<BookingStatus, string> = {
  PENDING: 'text-status-pending bg-status-pending-bg',
  ACCEPTED: 'text-status-accepted bg-status-accepted-bg',
  REJECTED: 'text-status-rejected bg-status-rejected-bg',
  COMPLETED: 'text-status-completed bg-status-completed-bg',
  CANCELLED: 'text-status-cancelled bg-status-cancelled-bg',
}

export const PAYMENT_STATUS_LABELS: Record<PaymentStatus, string> = {
  PENDING: 'Payment Pending',
  SUCCESS: 'Paid',
  FAILED: 'Payment Failed',
}

export const TICKET_STATUS_LABELS: Record<TicketStatus, string> = {
  OPEN: 'Open',
  IN_PROGRESS: 'In Progress',
  PENDING_CUSTOMER: 'Awaiting Your Reply',
  RESOLVED: 'Resolved',
  CLOSED: 'Closed',
}

export const TICKET_PRIORITY_LABELS: Record<TicketPriority, string> = {
  LOW: 'Low',
  MEDIUM: 'Medium',
  HIGH: 'High',
  URGENT: 'Urgent',
}

export const PROVIDER_STATUS_LABELS: Record<ProviderStatus, string> = {
  PENDING: 'Pending Review',
  APPROVED: 'Approved',
  REJECTED: 'Rejected',
  SUSPENDED: 'Suspended',
}

// ---- Misc ---------------------------------------------------

export function truncate(text: string, maxLength: number): string {
  if (text.length <= maxLength) return text
  return text.slice(0, maxLength).trimEnd() + '…'
}

export function initials(firstName?: string, lastName?: string): string {
  const f = firstName?.[0]?.toUpperCase() ?? ''
  const l = lastName?.[0]?.toUpperCase() ?? ''
  return f + l || '?'
}

export function ratingToStars(rating: number): string {
  return '★'.repeat(Math.round(rating)) + '☆'.repeat(5 - Math.round(rating))
}
