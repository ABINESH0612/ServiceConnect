import { useQuery } from '@tanstack/react-query'
import { Link } from 'react-router-dom'
import { CalendarCheck, Clock, Star, Headphones, ArrowRight, MapPin, Search } from 'lucide-react'
import { bookingApi } from '@/api/booking'
import { useAuthStore } from '@/store/authStore'
import { BookingStatusBadge } from '@/components/shared/StatusBadge'
import { LoadingState, ErrorState } from '@/components/shared/UxStates'
import { formatDate, formatPrice } from '@/utils/formatters'

export default function CustomerDashboard() {
  const user = useAuthStore((s) => s.user)

  const { data: bookingsData, isLoading, error } = useQuery({
    queryKey: ['customer', 'bookings', 'recent'],
    queryFn: () => bookingApi.getMyBookings({ page: 0, size: 5 }),
    select: (res) => res.data,
  })

  const bookings = bookingsData?.content ?? []
  const totalBookings = bookingsData?.totalElements ?? 0
  const pendingCount = bookings.filter((b) => b.status === 'PENDING').length
  const acceptedCount = bookings.filter((b) => b.status === 'ACCEPTED').length

  return (
    <div className="space-y-6">
      {/* Welcome */}
      <div>
        <h1 className="text-2xl font-bold text-[#0F172A]">
          Welcome back{user?.email ? `, ${user.email}` : ''}!
        </h1>
        <p className="text-sm text-[#64748B] mt-1">Here's what's happening with your bookings.</p>
      </div>

      {/* Quick stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="sc-card p-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-[8px] bg-[#EFF6FF] flex items-center justify-center">
              <CalendarCheck className="w-5 h-5 text-[#2563EB]" />
            </div>
            <div>
              <p className="text-2xl font-bold text-[#0F172A]">{totalBookings}</p>
              <p className="text-xs text-[#64748B]">Total Bookings</p>
            </div>
          </div>
        </div>
        <div className="sc-card p-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-[8px] bg-[#FEF3C7] flex items-center justify-center">
              <Clock className="w-5 h-5 text-[#F59E0B]" />
            </div>
            <div>
              <p className="text-2xl font-bold text-[#0F172A]">{pendingCount}</p>
              <p className="text-xs text-[#64748B]">Pending</p>
            </div>
          </div>
        </div>
        <div className="sc-card p-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-[8px] bg-[#DCFCE7] flex items-center justify-center">
              <Star className="w-5 h-5 text-[#16A34A]" />
            </div>
            <div>
              <p className="text-2xl font-bold text-[#0F172A]">{acceptedCount}</p>
              <p className="text-xs text-[#64748B]">Confirmed</p>
            </div>
          </div>
        </div>
        <div className="sc-card p-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-[8px] bg-[#EDE9FE] flex items-center justify-center">
              <Headphones className="w-5 h-5 text-[#8B5CF6]" />
            </div>
            <div>
              <Link to="/customer/support" className="text-sm font-medium text-[#2563EB] hover:underline">Get Help</Link>
              <p className="text-xs text-[#64748B]">Support</p>
            </div>
          </div>
        </div>
      </div>

      {/* Quick actions */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <Link to="/customer/providers" className="sc-card-hover p-5 flex items-center gap-4">
          <div className="w-12 h-12 rounded-full bg-[#EFF6FF] flex items-center justify-center flex-shrink-0">
            <MapPin className="w-6 h-6 text-[#2563EB]" />
          </div>
          <div className="flex-1">
            <h3 className="text-sm font-semibold text-[#0F172A]">Find Providers</h3>
            <p className="text-xs text-[#64748B]">Browse nearby service providers on the map</p>
          </div>
          <ArrowRight className="w-5 h-5 text-[#94A3B8]" />
        </Link>
        <Link to="/customer/services" className="sc-card-hover p-5 flex items-center gap-4">
          <div className="w-12 h-12 rounded-full bg-[#DCFCE7] flex items-center justify-center flex-shrink-0">
            <Search className="w-6 h-6 text-[#16A34A]" />
          </div>
          <div className="flex-1">
            <h3 className="text-sm font-semibold text-[#0F172A]">Browse Services</h3>
            <p className="text-xs text-[#64748B]">Search available services by category</p>
          </div>
          <ArrowRight className="w-5 h-5 text-[#94A3B8]" />
        </Link>
      </div>

      {/* Recent bookings */}
      <div className="sc-card">
        <div className="flex items-center justify-between p-4 border-b border-[#E2E8F0]">
          <h2 className="text-base font-semibold text-[#0F172A]">Recent Bookings</h2>
          <Link to="/customer/bookings" className="text-sm text-[#2563EB] hover:underline font-medium">View all</Link>
        </div>
        {isLoading ? (
          <LoadingState message="Loading bookings…" />
        ) : error ? (
          <ErrorState message="Failed to load bookings." action={{ label: 'Retry', onClick: () => window.location.reload() }} />
        ) : bookings.length === 0 ? (
          <div className="p-8 text-center">
            <p className="text-sm text-[#64748B]">No bookings yet.</p>
            <Link to="/customer/providers" className="sc-btn-primary mt-3 inline-flex text-sm">Find a Provider</Link>
          </div>
        ) : (
          <div className="divide-y divide-[#E2E8F0]">
            {bookings.map((b) => (
              <Link key={b.id} to={`/customer/bookings/${b.id}`} className="flex items-center justify-between p-4 hover:bg-[#F8FAFC] transition-colors">
                <div>
                  <p className="text-sm font-medium text-[#0F172A]">Booking #{b.id}</p>
                  <p className="text-xs text-[#64748B] mt-0.5">{formatDate(b.requestedStartAt)} · {formatPrice(b.priceSnapshot)}</p>
                </div>
                <BookingStatusBadge status={b.status} />
              </Link>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
