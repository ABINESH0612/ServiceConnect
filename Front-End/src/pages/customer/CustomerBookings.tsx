import { useState } from 'react'
import { Link } from 'react-router-dom'
import { useQuery } from '@tanstack/react-query'
import { CalendarCheck } from 'lucide-react'
import { bookingApi } from '@/api/booking'
import { BookingStatusBadge } from '@/components/shared/StatusBadge'
import { Pagination } from '@/components/shared/Pagination'
import { LoadingState, ErrorState, EmptyState } from '@/components/shared/UxStates'
import { formatDate, formatPrice } from '@/utils/formatters'
import type { BookingStatus } from '@/types'

const STATUS_TABS: { label: string; value: BookingStatus | '' }[] = [
  { label: 'All', value: '' },
  { label: 'Pending', value: 'PENDING' },
  { label: 'Accepted', value: 'ACCEPTED' },
  { label: 'Completed', value: 'COMPLETED' },
  { label: 'Cancelled', value: 'CANCELLED' },
]

export default function CustomerBookings() {
  const [statusFilter, setStatusFilter] = useState<BookingStatus | ''>('')
  const [page, setPage] = useState(0)

  const { data, isLoading, error, refetch } = useQuery({
    queryKey: ['customer', 'bookings', statusFilter, page],
    queryFn: () => bookingApi.getMyBookings({ page, size: 10 }),
    select: (res) => res.data,
  })

  const bookings = statusFilter
    ? (data?.content ?? []).filter((b) => b.status === statusFilter)
    : (data?.content ?? [])

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-[#0F172A]">My Bookings</h1>
      </div>

      {/* Status tabs */}
      <div className="flex gap-2 overflow-x-auto no-scrollbar">
        {STATUS_TABS.map((tab) => (
          <button
            key={tab.value}
            onClick={() => { setStatusFilter(tab.value); setPage(0) }}
            className={`px-4 py-2 rounded-pill text-sm font-medium whitespace-nowrap transition-colors ${
              statusFilter === tab.value
                ? 'bg-[#2563EB] text-white'
                : 'bg-white border border-[#E2E8F0] text-[#64748B] hover:bg-[#F1F5F9]'
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Bookings list */}
      {isLoading ? (
        <LoadingState message="Loading bookings…" />
      ) : error ? (
        <ErrorState message="Failed to load bookings." action={{ label: 'Retry', onClick: () => refetch() }} />
      ) : bookings.length === 0 ? (
        <EmptyState
          title="No bookings yet"
          message={statusFilter ? `No ${statusFilter.toLowerCase()} bookings.` : 'Start by finding a provider and booking a service.'}
          action={!statusFilter ? { label: 'Find Providers', onClick: () => window.location.assign('/customer/providers') } : undefined}
        />
      ) : (
        <div className="space-y-3">
          {bookings.map((booking) => (
            <Link
              key={booking.id}
              to={`/customer/bookings/${booking.id}`}
              className="sc-card-hover p-4 flex items-center justify-between"
            >
              <div className="flex items-center gap-4">
                <div className="w-10 h-10 rounded-[8px] bg-[#EFF6FF] flex items-center justify-center flex-shrink-0">
                  <CalendarCheck className="w-5 h-5 text-[#2563EB]" />
                </div>
                <div>
                  <p className="text-sm font-medium text-[#0F172A]">Booking #{booking.id}</p>
                  <p className="text-xs text-[#64748B]">
                    {formatDate(booking.requestedStartAt)} · {formatPrice(booking.priceSnapshot)}
                  </p>
                  {booking.serviceAddress && (
                    <p className="text-xs text-[#94A3B8] mt-0.5">{booking.serviceAddress}</p>
                  )}
                </div>
              </div>
              <BookingStatusBadge status={booking.status} />
            </Link>
          ))}
          <Pagination page={page} totalPages={data?.totalPages ?? 1} onPageChange={setPage} />
        </div>
      )}
    </div>
  )
}
