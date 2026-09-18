import { useState } from 'react'
import { Link } from 'react-router-dom'
import { useQuery } from '@tanstack/react-query'
import { bookingApi } from '@/api/booking'
import { BookingStatusBadge } from '@/components/shared/StatusBadge'
import { Pagination } from '@/components/shared/Pagination'
import { LoadingState, ErrorState, EmptyState } from '@/components/shared/UxStates'
import { formatDate, formatPrice } from '@/utils/formatters'
import type { BookingStatus } from '@/types'

const TABS: { label: string; value: BookingStatus | '' }[] = [
  { label: 'All', value: '' }, { label: 'Pending', value: 'PENDING' }, { label: 'Accepted', value: 'ACCEPTED' }, { label: 'Completed', value: 'COMPLETED' },
]

export default function ProviderBookings() {
  const [status, setStatus] = useState<BookingStatus | ''>('')
  const [page, setPage] = useState(0)

  const { data, isLoading, error, refetch } = useQuery({
    queryKey: ['provider', 'bookings', status, page],
    queryFn: () => status
      ? bookingApi.getProviderBookingsByStatus(status, { page, size: 10 })
      : bookingApi.getProviderBookings({ page, size: 10 }),
    select: (r) => r.data,
  })

  const bookings = data?.content ?? []

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold text-[#0F172A]">Booking Requests</h1>
      <div className="flex gap-2 overflow-x-auto no-scrollbar">
        {TABS.map((t) => (
          <button key={t.value} onClick={() => { setStatus(t.value); setPage(0) }} className={`px-4 py-2 rounded-pill text-sm font-medium whitespace-nowrap ${status === t.value ? 'bg-[#2563EB] text-white' : 'bg-white border border-[#E2E8F0] text-[#64748B]'}`}>{t.label}</button>
        ))}
      </div>
      {isLoading ? <LoadingState /> : error ? <ErrorState action={{ label: 'Retry', onClick: () => refetch() }} /> : !bookings.length ? (
        <EmptyState title="No bookings" message={status ? `No ${status.toLowerCase()} bookings.` : 'No booking requests yet.'} />
      ) : (
        <>
          <div className="space-y-3">
            {bookings.map((b) => (
              <Link key={b.id} to={`/provider/bookings/${b.id}`} className="sc-card-hover p-4 flex items-center justify-between">
                <div><p className="text-sm font-medium">Booking #{b.id}</p><p className="text-xs text-[#64748B]">{formatDate(b.requestedStartAt)} · {formatPrice(b.priceSnapshot)}</p></div>
                <BookingStatusBadge status={b.status} />
              </Link>
            ))}
          </div>
          <Pagination page={page} totalPages={data?.totalPages ?? 1} onPageChange={setPage} />
        </>
      )}
    </div>
  )
}
