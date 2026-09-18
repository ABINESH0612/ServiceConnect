import type { BookingStatus, TicketStatus, ProviderStatus, PaymentStatus } from '@/types'
import {
  Clock, CheckCircle2, XCircle, Ban, CircleDot,
  AlertCircle, MessageSquare, Lock,
} from 'lucide-react'

// ============================================================
// Status Badge — spec §46: never rely only on color
// Always shows icon + text
// ============================================================


const BOOKING_CONFIG: Record<BookingStatus, { icon: typeof Clock; className: string; label: string }> = {
  PENDING:   { icon: Clock,        className: 'status-pending',   label: 'Pending' },
  ACCEPTED:  { icon: CheckCircle2, className: 'status-accepted',  label: 'Accepted' },
  REJECTED:  { icon: XCircle,      className: 'status-rejected',  label: 'Rejected' },
  COMPLETED: { icon: CircleDot,    className: 'status-completed', label: 'Completed' },
  CANCELLED: { icon: Ban,          className: 'status-cancelled', label: 'Cancelled' },
}

const TICKET_CONFIG: Record<TicketStatus, { icon: typeof Clock; className: string; label: string }> = {
  OPEN:              { icon: AlertCircle,   className: 'status-open',      label: 'Open' },
  IN_PROGRESS:       { icon: Clock,         className: 'status-pending',   label: 'In Progress' },
  PENDING_CUSTOMER:  { icon: MessageSquare, className: 'status-pending',   label: 'Awaiting Reply' },
  RESOLVED:          { icon: CheckCircle2,  className: 'status-completed', label: 'Resolved' },
  CLOSED:            { icon: Lock,          className: 'status-cancelled', label: 'Closed' },
}

const PROVIDER_CONFIG: Record<ProviderStatus, { icon: typeof Clock; className: string; label: string }> = {
  PENDING:   { icon: Clock,        className: 'status-pending',   label: 'Pending Review' },
  APPROVED:  { icon: CheckCircle2, className: 'status-approved',  label: 'Approved' },
  REJECTED:  { icon: XCircle,      className: 'status-rejected',  label: 'Rejected' },
  SUSPENDED: { icon: Ban,          className: 'status-suspended', label: 'Suspended' },
}

const PAYMENT_CONFIG: Record<PaymentStatus, { icon: typeof Clock; className: string; label: string }> = {
  PENDING: { icon: Clock,        className: 'status-pending',   label: 'Payment Pending' },
  SUCCESS: { icon: CheckCircle2, className: 'status-accepted',  label: 'Paid' },
  FAILED:  { icon: XCircle,      className: 'status-rejected',  label: 'Payment Failed' },
}

export function BookingStatusBadge({ status }: { status: BookingStatus }) {
  const cfg = BOOKING_CONFIG[status]
  if (!cfg) return <span className="status-badge">{status}</span>
  const Icon = cfg.icon
  return <span className={cfg.className}><Icon className="w-3.5 h-3.5" />{cfg.label}</span>
}

export function TicketStatusBadge({ status }: { status: TicketStatus }) {
  const cfg = TICKET_CONFIG[status]
  if (!cfg) return <span className="status-badge">{status}</span>
  const Icon = cfg.icon
  return <span className={cfg.className}><Icon className="w-3.5 h-3.5" />{cfg.label}</span>
}

export function ProviderStatusBadge({ status }: { status: ProviderStatus }) {
  const cfg = PROVIDER_CONFIG[status]
  if (!cfg) return <span className="status-badge">{status}</span>
  const Icon = cfg.icon
  return <span className={cfg.className}><Icon className="w-3.5 h-3.5" />{cfg.label}</span>
}

export function PaymentStatusBadge({ status }: { status: PaymentStatus }) {
  const cfg = PAYMENT_CONFIG[status]
  if (!cfg) return <span className="status-badge">{status}</span>
  const Icon = cfg.icon
  return <span className={cfg.className}><Icon className="w-3.5 h-3.5" />{cfg.label}</span>
}

export function PriorityBadge({ priority }: { priority: string }) {
  const colors: Record<string, string> = {
    LOW: 'bg-[#F1F5F9] text-[#64748B]',
    MEDIUM: 'bg-[#DBEAFE] text-[#1E40AF]',
    HIGH: 'bg-[#FEF3C7] text-[#92400E]',
    URGENT: 'bg-[#FEE2E2] text-[#7F1D1D]',
  }
  return (
    <span className={`status-badge ${colors[priority] ?? ''}`}>
      {priority === 'URGENT' && <AlertCircle className="w-3 h-3" />}
      {priority}
    </span>
  )
}
