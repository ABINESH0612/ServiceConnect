import { useParams, Link, useNavigate } from 'react-router-dom'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { toast } from 'sonner'
import {
  ArrowLeft, MapPin, Check, X, CheckCircle2,
  Clock, AlertCircle, FileText, User
} from 'lucide-react'
import { bookingApi } from '@/api/booking'
import { BookingStatusBadge } from '@/components/shared/StatusBadge'
import { LoadingState, ErrorState } from '@/components/shared/UxStates'
import { formatDateTime, formatPrice } from '@/utils/formatters'

export default function ProviderBookingDetail() {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const qc = useQueryClient()
  const bookingId = Number(id)

  const { data: booking, isLoading, error } = useQuery({
    queryKey: ['booking', bookingId],
    queryFn: () => bookingApi.getById(bookingId),
    select: (res) => res.data,
    enabled: !isNaN(bookingId),
  })

  const updateStatusMutation = useMutation({
    mutationFn: (status: 'ACCEPTED' | 'REJECTED' | 'COMPLETED') =>
      bookingApi.updateStatus(bookingId, { status }),
    onSuccess: (_, status) => {
      toast.success(`Booking status updated to ${status.toLowerCase()}.`)
      qc.invalidateQueries({ queryKey: ['booking', bookingId] })
      qc.invalidateQueries({ queryKey: ['provider', 'bookings'] })
    },
    onError: () => toast.error('Failed to update booking status.'),
  })

  if (isLoading) {
    return <div className="max-w-3xl py-8"><LoadingState message="Loading work order details..." /></div>
  }

  if (error || !booking) {
    return (
      <div className="max-w-3xl py-8">
        <ErrorState
          message="Booking record not found."
          action={{ label: 'Back to Bookings', onClick: () => navigate('/provider/bookings') }}
        />
      </div>
    )
  }

  return (
    <div className="max-w-3xl space-y-6">
      <Link
        to="/provider/bookings"
        className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-500 hover:text-blue-600 transition-colors"
      >
        <ArrowLeft className="w-4 h-4" /> Back to All Bookings
      </Link>

      {/* Header bar */}
      <div className="bg-white rounded-3xl p-6 border border-slate-200/80 shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-3">
            <h1 className="text-2xl font-extrabold text-slate-900 tracking-tight">
              Work Order #{booking.id}
            </h1>
            <BookingStatusBadge status={booking.status} />
          </div>
          <p className="text-xs text-slate-500 mt-1">
            Received on {formatDateTime(booking.createdAt)}
          </p>
        </div>

        {/* Action buttons */}
        <div className="flex items-center gap-2.5">
          {booking.status === 'PENDING' && (
            <>
              <button
                onClick={() => updateStatusMutation.mutate('ACCEPTED')}
                disabled={updateStatusMutation.isPending}
                className="px-4 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold shadow-sm flex items-center gap-1.5 transition-all"
              >
                <Check className="w-4 h-4" /> Accept Job
              </button>
              <button
                onClick={() => updateStatusMutation.mutate('REJECTED')}
                disabled={updateStatusMutation.isPending}
                className="px-4 py-2.5 rounded-xl border border-rose-200 text-rose-600 hover:bg-rose-50 text-xs font-semibold transition-all flex items-center gap-1.5"
              >
                <X className="w-4 h-4" /> Decline
              </button>
            </>
          )}

          {booking.status === 'ACCEPTED' && (
            <button
              onClick={() => updateStatusMutation.mutate('COMPLETED')}
              disabled={updateStatusMutation.isPending}
              className="px-5 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold shadow-md shadow-blue-600/20 flex items-center gap-1.5 transition-all"
            >
              <CheckCircle2 className="w-4 h-4" /> Mark as Completed
            </button>
          )}
        </div>
      </div>

      {/* Details Card */}
      <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200/80 shadow-sm space-y-6">
        <div className="flex items-center justify-between border-b border-slate-100 pb-4">
          <div className="flex items-center gap-2">
            <FileText className="w-5 h-5 text-blue-600" />
            <h3 className="text-base font-bold text-slate-900">Job Specification</h3>
          </div>
          <span className="text-xs text-slate-400">Customer ID: #{booking.customerId}</span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 text-sm">
          <div className="space-y-1">
            <span className="text-xs font-medium text-slate-400">Scheduled Visit Time</span>
            <p className="font-bold text-slate-900 text-base flex items-center gap-1.5">
              <Clock className="w-4 h-4 text-blue-600" />
              {formatDateTime(booking.requestedStartAt)}
            </p>
          </div>

          <div className="space-y-1">
            <span className="text-xs font-medium text-slate-400">Agreed Price</span>
            <p className="font-black text-slate-900 text-xl">
              {formatPrice(booking.priceSnapshot)}
            </p>
          </div>

          {booking.serviceAddress && (
            <div className="col-span-full space-y-1 pt-2 border-t border-slate-100">
              <span className="text-xs font-medium text-slate-400">Client Service Location</span>
              <p className="text-sm font-medium text-slate-800 flex items-start gap-1.5">
                <MapPin className="w-4 h-4 text-slate-400 mt-0.5 flex-shrink-0" />
                <span>{booking.serviceAddress}</span>
              </p>
            </div>
          )}

          {booking.description && (
            <div className="col-span-full space-y-1 pt-2 border-t border-slate-100">
              <span className="text-xs font-medium text-slate-400">Client Job Description</span>
              <p className="text-sm text-slate-700 bg-slate-50 p-3 rounded-xl border border-slate-100 leading-relaxed">
                {booking.description}
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
