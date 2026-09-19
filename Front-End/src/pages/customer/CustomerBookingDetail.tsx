import { useState } from 'react'
import { useParams, Link, useNavigate } from 'react-router-dom'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { toast } from 'sonner'
import {
  ArrowLeft, MapPin, CreditCard, Star, X, CheckCircle2,
  Clock, Shield, AlertCircle, FileText, Phone, Mail
} from 'lucide-react'
import { bookingApi } from '@/api/booking'
import { providerDiscoveryApi } from '@/api/provider'
import { BookingStatusBadge } from '@/components/shared/StatusBadge'
import { ConfirmationDialog } from '@/components/shared/ConfirmationDialog'
import { LoadingState, ErrorState } from '@/components/shared/UxStates'
import { formatDateTime, formatPrice } from '@/utils/formatters'

export default function CustomerBookingDetail() {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const qc = useQueryClient()
  const bookingId = Number(id)
  const [cancelDialogOpen, setCancelDialogOpen] = useState(false)

  const { data: booking, isLoading, error } = useQuery({
    queryKey: ['booking', bookingId],
    queryFn: () => bookingApi.getById(bookingId),
    select: (res) => res.data,
    enabled: !isNaN(bookingId),
  })

  // Provider profile query
  const { data: provider } = useQuery({
    queryKey: ['provider', 'booking-view', booking?.providerId],
    queryFn: () => providerDiscoveryApi.getPublic(booking!.providerId),
    select: (res) => res.data,
    enabled: !!booking?.providerId,
  })

  const cancelMutation = useMutation({
    mutationFn: () => bookingApi.cancel(bookingId),
    onSuccess: () => {
      toast.success('Appointment cancelled successfully.')
      qc.invalidateQueries({ queryKey: ['booking', bookingId] })
      qc.invalidateQueries({ queryKey: ['customer', 'bookings'] })
      setCancelDialogOpen(false)
    },
    onError: () => toast.error('Failed to cancel appointment. It may have already started.'),
  })

  if (isLoading) {
    return (
      <div className="max-w-3xl py-8">
        <LoadingState message="Retrieving booking information..." />
      </div>
    )
  }

  if (error || !booking) {
    return (
      <div className="max-w-3xl py-8">
        <ErrorState
          message="Booking not found or has expired."
          action={{ label: 'Back to Bookings', onClick: () => navigate('/customer/bookings') }}
        />
      </div>
    )
  }

  const canCancel =
    booking.status === 'PENDING' ||
    (booking.status === 'ACCEPTED' && new Date(booking.requestedStartAt) > new Date())
  const canPay = booking.status === 'ACCEPTED'
  const canReview = booking.status === 'COMPLETED'

  // Timeline progress indicator
  const steps = [
    { title: 'Requested', desc: 'Sent to pro', done: true },
    { title: 'Accepted', desc: 'Confirmed by pro', done: booking.status === 'ACCEPTED' || booking.status === 'COMPLETED' },
    { title: 'In Progress', desc: 'Service execution', done: booking.status === 'COMPLETED' },
    { title: 'Completed', desc: 'Job concluded', done: booking.status === 'COMPLETED' },
  ]

  const isCancelled = booking.status === 'CANCELLED' || booking.status === 'REJECTED'

  return (
    <div className="max-w-3xl space-y-6">
      {/* Back button */}
      <Link
        to="/customer/bookings"
        className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-500 hover:text-blue-600 transition-colors"
      >
        <ArrowLeft className="w-4 h-4" /> Back to My Bookings
      </Link>

      {/* Header bar */}
      <div className="bg-white rounded-3xl p-6 border border-slate-200/80 shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-3">
            <h1 className="text-2xl font-extrabold text-slate-900 tracking-tight">
              Booking #{booking.id}
            </h1>
            <BookingStatusBadge status={booking.status} />
          </div>
          <p className="text-xs text-slate-500 mt-1">
            Created on {formatDateTime(booking.createdAt)}
          </p>
        </div>

        {/* Quick action strip */}
        <div className="flex items-center gap-2.5">
          {canPay && (
            <Link
              to={`/customer/payment/${booking.id}`}
              className="px-5 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold shadow-md shadow-blue-600/20 flex items-center gap-1.5 transition-all"
            >
              <CreditCard className="w-4 h-4" /> Pay Now
            </Link>
          )}
          {canReview && (
            <Link
              to={`/customer/reviews?bookingId=${booking.id}`}
              className="px-4 py-2.5 rounded-xl bg-amber-500 hover:bg-amber-600 text-white text-xs font-bold shadow-sm flex items-center gap-1.5 transition-all"
            >
              <Star className="w-4 h-4 fill-white" /> Write Review
            </Link>
          )}
          {canCancel && (
            <button
              onClick={() => setCancelDialogOpen(true)}
              className="px-4 py-2.5 rounded-xl border border-rose-200 text-rose-600 hover:bg-rose-50 text-xs font-semibold transition-colors flex items-center gap-1.5"
            >
              <X className="w-4 h-4" /> Cancel Booking
            </button>
          )}
        </div>
      </div>

      {/* Status Timeline */}
      <div className="bg-white rounded-3xl p-6 border border-slate-200/80 shadow-sm space-y-4">
        <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400">
          Booking Status Progression
        </h3>

        {isCancelled ? (
          <div className="p-4 rounded-2xl bg-rose-50 border border-rose-200 flex items-center gap-3 text-rose-800 text-sm">
            <AlertCircle className="w-5 h-5 text-rose-600 flex-shrink-0" />
            <div>
              <p className="font-bold">This booking is {booking.status.toLowerCase()}</p>
              <p className="text-xs text-rose-600 mt-0.5">
                No further actions required. Contact support if you believe this was in error.
              </p>
            </div>
          </div>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-2">
            {steps.map((step, idx) => (
              <div
                key={idx}
                className={`p-3 rounded-2xl border transition-all ${
                  step.done
                    ? 'bg-blue-50/70 border-blue-200 text-blue-900'
                    : 'bg-slate-50 border-slate-100 text-slate-400'
                }`}
              >
                <div className="flex items-center gap-2 mb-1">
                  <div
                    className={`w-5 h-5 rounded-full flex items-center justify-center text-[11px] font-bold ${
                      step.done ? 'bg-blue-600 text-white' : 'bg-slate-200 text-slate-500'
                    }`}
                  >
                    {step.done ? <CheckCircle2 className="w-3.5 h-3.5" /> : idx + 1}
                  </div>
                  <span className="text-xs font-bold truncate">{step.title}</span>
                </div>
                <p className="text-[11px] text-slate-500 leading-tight">{step.desc}</p>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Booking Details & Invoice Card */}
      <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200/80 shadow-sm space-y-6">
        <div className="flex items-center justify-between border-b border-slate-100 pb-4">
          <div className="flex items-center gap-2">
            <FileText className="w-5 h-5 text-blue-600" />
            <h3 className="text-base font-bold text-slate-900">Service & Schedule Details</h3>
          </div>
          <span className="text-xs text-slate-400 font-mono">REQ-{booking.id}</span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 text-sm">
          <div className="space-y-1">
            <span className="text-xs font-medium text-slate-400">Scheduled Date & Time</span>
            <p className="font-bold text-slate-900 text-base flex items-center gap-1.5">
              <Clock className="w-4 h-4 text-blue-600" />
              {formatDateTime(booking.requestedStartAt)}
            </p>
          </div>

          <div className="space-y-1">
            <span className="text-xs font-medium text-slate-400">Total Price Snapshot</span>
            <p className="font-black text-slate-900 text-xl">
              {formatPrice(booking.priceSnapshot)}
            </p>
          </div>

          {booking.serviceAddress && (
            <div className="col-span-full space-y-1 pt-2 border-t border-slate-100">
              <span className="text-xs font-medium text-slate-400">Service Location</span>
              <p className="text-sm font-medium text-slate-800 flex items-start gap-1.5">
                <MapPin className="w-4 h-4 text-slate-400 mt-0.5 flex-shrink-0" />
                <span>{booking.serviceAddress}</span>
              </p>
            </div>
          )}

          {booking.description && (
            <div className="col-span-full space-y-1 pt-2 border-t border-slate-100">
              <span className="text-xs font-medium text-slate-400">Client Instructions / Notes</span>
              <p className="text-sm text-slate-700 bg-slate-50 p-3 rounded-xl border border-slate-100 leading-relaxed">
                {booking.description}
              </p>
            </div>
          )}
        </div>
      </div>

      {/* Provider Details Card */}
      {provider && (
        <div className="bg-white rounded-3xl p-6 border border-slate-200/80 shadow-sm flex items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-blue-600 to-indigo-600 text-white font-bold text-lg flex items-center justify-center flex-shrink-0">
              {provider.businessName.charAt(0)}
            </div>
            <div>
              <h4 className="text-sm font-bold text-slate-900">{provider.businessName}</h4>
              <p className="text-xs text-slate-500 mt-0.5 flex items-center gap-2">
                {provider.city && <span>{provider.city}</span>}
                {provider.phone && <span>· {provider.phone}</span>}
              </p>
            </div>
          </div>

          <Link
            to={`/customer/providers/${provider.id}`}
            className="px-4 py-2 rounded-xl border border-slate-200 hover:bg-slate-50 text-slate-700 text-xs font-semibold"
          >
            View Profile
          </Link>
        </div>
      )}

      {/* Confirmation Dialog for Cancellation */}
      <ConfirmationDialog
        isOpen={cancelDialogOpen}
        onClose={() => setCancelDialogOpen(false)}
        onConfirm={() => cancelMutation.mutate()}
        isLoading={cancelMutation.isPending}
        title="Cancel this Appointment?"
        message="Are you sure you want to cancel this booking? This will release the provider's scheduled time slot."
        confirmLabel="Yes, Cancel Booking"
        cancelLabel="Keep Booking"
        variant="danger"
      />
    </div>
  )
}
