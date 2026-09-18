import { useParams, Link } from 'react-router-dom'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { toast } from 'sonner'
import { ArrowLeft, CheckCircle2, XCircle } from 'lucide-react'
import { bookingApi } from '@/api/booking'
import { BookingStatusBadge } from '@/components/shared/StatusBadge'
import { LoadingState, ErrorState } from '@/components/shared/UxStates'
import { formatDateTime, formatPrice } from '@/utils/formatters'

export default function ProviderBookingDetail() {
  const { id } = useParams<{ id: string }>()
  const qc = useQueryClient()
  const bookingId = Number(id)

  const { data: booking, isLoading, error } = useQuery({
    queryKey: ['booking', bookingId],
    queryFn: () => bookingApi.getById(bookingId),
    select: (r) => r.data,
    enabled: !isNaN(bookingId),
  })

  const statusMutation = useMutation({
    mutationFn: (status: 'ACCEPTED' | 'REJECTED' | 'COMPLETED') => bookingApi.updateStatus(bookingId, { status }),
    onSuccess: (_, status) => {
      toast.success(`Booking ${status.toLowerCase()}`)
      qc.invalidateQueries({ queryKey: ['booking', bookingId] })
      qc.invalidateQueries({ queryKey: ['provider', 'bookings'] })
    },
    onError: () => toast.error('Failed to update booking'),
  })

  if (isLoading) return <LoadingState />
  if (error || !booking) return <ErrorState message="Booking not found." />

  return (
    <div className="max-w-2xl space-y-6">
      <Link to="/provider/bookings" className="inline-flex items-center gap-1 text-sm text-[#64748B] hover:text-[#2563EB]"><ArrowLeft className="w-4 h-4" /> Back</Link>
      <div className="flex items-center justify-between"><h1 className="text-2xl font-bold">Booking #{booking.id}</h1><BookingStatusBadge status={booking.status} /></div>
      <div className="sc-card p-6 space-y-4">
        <div className="grid grid-cols-2 gap-4 text-sm">
          <div><p className="text-[#64748B]">Scheduled</p><p className="font-medium">{formatDateTime(booking.requestedStartAt)}</p></div>
          <div><p className="text-[#64748B]">Price</p><p className="font-medium">{formatPrice(booking.priceSnapshot)}</p></div>
          <div><p className="text-[#64748B]">Customer ID</p><p className="font-medium">{booking.customerId}</p></div>
          <div><p className="text-[#64748B]">Created</p><p className="font-medium">{formatDateTime(booking.createdAt)}</p></div>
        </div>
        {booking.serviceAddress && <div className="pt-2 border-t border-[#E2E8F0]"><p className="text-xs text-[#64748B]">Address</p><p className="text-sm">{booking.serviceAddress}</p></div>}
        {booking.description && <div className="pt-2 border-t border-[#E2E8F0]"><p className="text-xs text-[#64748B]">Description</p><p className="text-sm">{booking.description}</p></div>}
      </div>
      <div className="flex gap-3">
        {booking.status === 'PENDING' && (
          <>
            <button onClick={() => statusMutation.mutate('ACCEPTED')} disabled={statusMutation.isPending} className="sc-btn-primary text-sm gap-1"><CheckCircle2 className="w-4 h-4" /> Accept</button>
            <button onClick={() => { if (confirm('Reject this booking?')) statusMutation.mutate('REJECTED') }} disabled={statusMutation.isPending} className="sc-btn-danger text-sm gap-1"><XCircle className="w-4 h-4" /> Reject</button>
          </>
        )}
        {booking.status === 'ACCEPTED' && (
          <button onClick={() => statusMutation.mutate('COMPLETED')} disabled={statusMutation.isPending} className="sc-btn-primary text-sm gap-1"><CheckCircle2 className="w-4 h-4" /> Mark Completed</button>
        )}
      </div>
    </div>
  )
}
