import { useQuery } from '@tanstack/react-query'
import { Link } from 'react-router-dom'
import { CalendarCheck, Briefcase, Clock, Star, ArrowRight } from 'lucide-react'
import { bookingApi } from '@/api/booking'
import { providerApi } from '@/api/provider'
import { BookingStatusBadge, ProviderStatusBadge } from '@/components/shared/StatusBadge'
import { LoadingState } from '@/components/shared/UxStates'
import { formatDate, formatPrice } from '@/utils/formatters'

export default function ProviderDashboard() {
  const { data: provider, isLoading: loadingProfile } = useQuery({
    queryKey: ['provider', 'me'],
    queryFn: () => providerApi.getMe(),
    select: (r) => r.data,
  })

  const { data: bookings, isLoading: loadingBookings } = useQuery({
    queryKey: ['provider', 'bookings', 'recent'],
    queryFn: () => bookingApi.getProviderBookings({ page: 0, size: 5 }),
    select: (r) => r.data,
  })

  const recentBookings = bookings?.content ?? []
  const pendingCount = recentBookings.filter((b) => b.status === 'PENDING').length

  if (loadingProfile) return <LoadingState message="Loading dashboard…" />

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between flex-wrap gap-2">
        <div>
          <h1 className="text-2xl font-bold text-[#0F172A]">Provider Dashboard</h1>
          <p className="text-sm text-[#64748B]">{provider?.businessName ?? 'Your business'}</p>
        </div>
        {provider && <ProviderStatusBadge status={provider.status} />}
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="sc-card p-4 flex items-center gap-3">
          <div className="w-10 h-10 rounded-[8px] bg-[#FEF3C7] flex items-center justify-center"><CalendarCheck className="w-5 h-5 text-[#F59E0B]" /></div>
          <div><p className="text-2xl font-bold">{pendingCount}</p><p className="text-xs text-[#64748B]">Pending</p></div>
        </div>
        <div className="sc-card p-4 flex items-center gap-3">
          <div className="w-10 h-10 rounded-[8px] bg-[#EFF6FF] flex items-center justify-center"><Briefcase className="w-5 h-5 text-[#2563EB]" /></div>
          <div><p className="text-2xl font-bold">{bookings?.totalElements ?? 0}</p><p className="text-xs text-[#64748B]">Total Bookings</p></div>
        </div>
        <Link to="/provider/catalog" className="sc-card-hover p-4 flex items-center gap-3">
          <div className="w-10 h-10 rounded-[8px] bg-[#DCFCE7] flex items-center justify-center"><Star className="w-5 h-5 text-[#16A34A]" /></div>
          <div><p className="text-sm font-semibold">Services</p><p className="text-xs text-[#64748B]">Manage catalog</p></div>
          <ArrowRight className="w-4 h-4 text-[#94A3B8] ml-auto" />
        </Link>
        <Link to="/provider/availability" className="sc-card-hover p-4 flex items-center gap-3">
          <div className="w-10 h-10 rounded-[8px] bg-[#EDE9FE] flex items-center justify-center"><Clock className="w-5 h-5 text-[#8B5CF6]" /></div>
          <div><p className="text-sm font-semibold">Availability</p><p className="text-xs text-[#64748B]">Set schedule</p></div>
          <ArrowRight className="w-4 h-4 text-[#94A3B8] ml-auto" />
        </Link>
      </div>

      {/* Recent bookings */}
      <div className="sc-card">
        <div className="flex items-center justify-between p-4 border-b border-[#E2E8F0]">
          <h2 className="text-base font-semibold text-[#0F172A]">Recent Booking Requests</h2>
          <Link to="/provider/bookings" className="text-sm text-[#2563EB] hover:underline font-medium">View all</Link>
        </div>
        {loadingBookings ? <LoadingState message="Loading…" /> : recentBookings.length === 0 ? (
          <div className="p-8 text-center text-sm text-[#64748B]">No booking requests yet.</div>
        ) : (
          <div className="divide-y divide-[#E2E8F0]">
            {recentBookings.map((b) => (
              <Link key={b.id} to={`/provider/bookings/${b.id}`} className="flex items-center justify-between p-4 hover:bg-[#F8FAFC] transition-colors">
                <div>
                  <p className="text-sm font-medium text-[#0F172A]">Booking #{b.id}</p>
                  <p className="text-xs text-[#64748B]">{formatDate(b.requestedStartAt)} · {formatPrice(b.priceSnapshot)}</p>
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
