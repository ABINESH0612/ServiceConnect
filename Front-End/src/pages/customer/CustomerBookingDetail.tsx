import { useParams, Link, useNavigate } from 'react-router-dom'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { toast } from 'sonner'
import { ArrowLeft, MapPin, CreditCard, Star, X } from 'lucide-react'
import { bookingApi } from '@/api/booking'
import { BookingStatusBadge } from '@/components/shared/StatusBadge'
import { LoadingState, ErrorState } from '@/components/shared/UxStates'
import { formatDateTime, formatPrice } from '@/utils/formatters'

export default function CustomerBookingDetail() {
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

  const cancelMutation = useMutation({
    mutationFn: () => bookingApi.cancel(bookingId),
    onSuccess: () => {
      toast.success('Booking cancelled')
      qc.invalidateQueries({ queryKey: ['booking', bookingId] })
      qc.invalidateQueries({ queryKey: ['customer', 'bookings'] })
    },
    onError: () => toast.error('Failed to cancel booking'),
  })

  if (isLoading) return <LoadingState message="Loading booking…" />
  if (error || !booking) return <ErrorState message="Booking not found." action={{ label: 'Back to Bookings', onClick: () => navigate('/customer/bookings') }} />

  const canCancel = booking.status === 'PENDING' || (booking.status === 'ACCEPTED' && new Date(booking.requestedStartAt) > new Date())
  const canPay = booking.status === 'ACCEPTED'
  const canReview = booking.status === 'COMPLETED'

  return (
    <div className="max-w-2xl space-y-6">
      <Link to="/customer/bookings" className="inline-flex items-center gap-1 text-sm text-[#64748B] hover:text-[#2563EB]">
        <ArrowLeft className="w-4 h-4" /> Back to Bookings
      </Link>

      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-[#0F172A]">Booking #{booking.id}</h1>
        <BookingStatusBadge status={booking.status} />
      </div>

      {/* Details card */}
      <div className="sc-card p-6 space-y-4">
        <div className="grid grid-cols-2 gap-4 text-sm">
          <div>
            <p className="text-[#64748B]">Scheduled</p>
            <p className="font-medium text-[#0F172A]">{formatDateTime(booking.requestedStartAt)}</p>
          </div>
          <div>
            <p className="text-[#64748B]">Price</p>
            <p className="font-medium text-[#0F172A]">{formatPrice(booking.priceSnapshot)}</p>
          </div>
          <div>
            <p className="text-[#64748B]">Provider ID</p>
            <p className="font-medium text-[#0F172A]">{booking.providerId}</p>
          </div>
          <div>
            <p className="text-[#64748B]">Created</p>
            <p className="font-medium text-[#0F172A]">{formatDateTime(booking.createdAt)}</p>
          </div>
        </div>

        {booking.serviceAddress && (
          <div className="flex items-start gap-2 pt-2 border-t border-[#E2E8F0]">
            <MapPin className="w-4 h-4 text-[#64748B] mt-0.5 flex-shrink-0" />
            <p className="text-sm text-[#0F172A]">{booking.serviceAddress}</p>
          </div>
        )}

        {booking.description && (
          <div className="pt-2 border-t border-[#E2E8F0]">
            <p className="text-[#64748B] text-xs mb-1">Description</p>
            <p className="text-sm text-[#0F172A]">{booking.description}</p>
          </div>
        )}
      </div>

      {/* Actions */}
      <div className="flex flex-wrap gap-3">
        {canPay && (
          <Link to={`/customer/payment/${booking.id}`} className="sc-btn-primary text-sm inline-flex items-center gap-2">
            <CreditCard className="w-4 h-4" /> Pay Now
          </Link>
        )}
        {canReview && (
          <Link to={`/customer/reviews?bookingId=${booking.id}`} className="sc-btn-outline text-sm inline-flex items-center gap-2">
            <Star className="w-4 h-4" /> Write Review
          </Link>
        )}
        {canCancel && (
          <button
            onClick={() => { if (confirm('Are you sure you want to cancel this booking?')) cancelMutation.mutate() }}
            disabled={cancelMutation.isPending}
            className="sc-btn-danger text-sm inline-flex items-center gap-2"
          >
            <X className="w-4 h-4" /> {cancelMutation.isPending ? 'Cancelling…' : 'Cancel Booking'}
          </button>
        )}
      </div>
    </div>
  )
}
