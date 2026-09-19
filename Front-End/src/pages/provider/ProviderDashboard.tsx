import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { Link } from 'react-router-dom'
import { toast } from 'sonner'
import {
  CalendarCheck, Briefcase, Clock, Star, ArrowRight,
  TrendingUp, Check, X, AlertCircle, ChevronRight, MapPin
} from 'lucide-react'
import { bookingApi } from '@/api/booking'
import { providerApi } from '@/api/provider'
import { BookingStatusBadge, ProviderStatusBadge } from '@/components/shared/StatusBadge'
import { LoadingState } from '@/components/shared/UxStates'
import { formatDate, formatPrice } from '@/utils/formatters'

export default function ProviderDashboard() {
  const qc = useQueryClient()

  const { data: provider, isLoading: loadingProfile } = useQuery({
    queryKey: ['provider', 'me'],
    queryFn: () => providerApi.getMe(),
    select: (r) => r.data,
  })

  const { data: bookings, isLoading: loadingBookings } = useQuery({
    queryKey: ['provider', 'bookings', 'recent'],
    queryFn: () => bookingApi.getProviderBookings({ page: 0, size: 10 }),
    select: (r) => r.data,
  })

  // Quick accept/reject mutation directly from dashboard
  const updateStatusMutation = useMutation({
    mutationFn: ({ id, status }: { id: number; status: 'ACCEPTED' | 'REJECTED' | 'COMPLETED' }) =>
      bookingApi.updateStatus(id, { status }),
    onSuccess: (_, vars) => {
      toast.success(`Booking #${vars.id} has been ${vars.status.toLowerCase()}.`)
      qc.invalidateQueries({ queryKey: ['provider', 'bookings'] })
    },
    onError: () => toast.error('Failed to update booking status.'),
  })

  const allBookings = bookings?.content ?? []
  const pendingRequests = allBookings.filter((b) => b.status === 'PENDING')
  const acceptedBookings = allBookings.filter((b) => b.status === 'ACCEPTED')
  const completedBookings = allBookings.filter((b) => b.status === 'COMPLETED')

  // Calculate estimated revenue
  const totalRevenue = completedBookings.reduce((sum, b) => sum + (b.priceSnapshot || 0), 0)

  if (loadingProfile) {
    return (
      <div className="max-w-6xl py-12">
        <LoadingState message="Loading business dashboard..." />
      </div>
    )
  }

  return (
    <div className="space-y-8 max-w-6xl">
      {/* Header Banner */}
      <div className="bg-gradient-to-r from-slate-900 via-indigo-950 to-blue-950 rounded-3xl p-6 sm:p-8 text-white shadow-lg relative overflow-hidden">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="space-y-1">
            <span className="text-xs font-semibold uppercase tracking-wider text-blue-300">
              Provider Operations Console
            </span>
            <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight">
              {provider?.businessName || 'Your Business'}
            </h1>
            <p className="text-xs sm:text-sm text-slate-300">
              {provider?.city ? `${provider.city}, ${provider.state || ''}` : 'Local Service Marketplace Partner'}
            </p>
          </div>
          {provider && <ProviderStatusBadge status={provider.status} />}
        </div>
      </div>

      {/* KPI Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white rounded-2xl p-5 border border-slate-200/80 shadow-sm flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center flex-shrink-0">
            <Clock className="w-6 h-6" />
          </div>
          <div>
            <p className="text-2xl font-black text-slate-900">{pendingRequests.length}</p>
            <p className="text-xs font-medium text-slate-500">Pending Requests</p>
          </div>
        </div>

        <div className="bg-white rounded-2xl p-5 border border-slate-200/80 shadow-sm flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center flex-shrink-0">
            <CalendarCheck className="w-6 h-6" />
          </div>
          <div>
            <p className="text-2xl font-black text-slate-900">{acceptedBookings.length}</p>
            <p className="text-xs font-medium text-slate-500">Scheduled Jobs</p>
          </div>
        </div>

        <div className="bg-white rounded-2xl p-5 border border-slate-200/80 shadow-sm flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center flex-shrink-0">
            <TrendingUp className="w-6 h-6" />
          </div>
          <div>
            <p className="text-2xl font-black text-slate-900">{formatPrice(totalRevenue)}</p>
            <p className="text-xs font-medium text-slate-500">Completed Earnings</p>
          </div>
        </div>

        <div className="bg-white rounded-2xl p-5 border border-slate-200/80 shadow-sm flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-purple-50 text-purple-600 flex items-center justify-center flex-shrink-0">
            <Star className="w-6 h-6" />
          </div>
          <div>
            <p className="text-2xl font-black text-slate-900">4.9 / 5</p>
            <p className="text-xs font-medium text-slate-500">Client Rating</p>
          </div>
        </div>
      </div>

      {/* Quick shortcuts */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <Link
          to="/provider/catalog"
          className="bg-white rounded-2xl p-5 border border-slate-200/80 hover:border-blue-400 hover:shadow-md transition-all flex items-center justify-between group"
        >
          <div className="flex items-center gap-3.5">
            <div className="w-10 h-10 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center">
              <Briefcase className="w-5 h-5" />
            </div>
            <div>
              <h4 className="text-sm font-bold text-slate-900 group-hover:text-blue-600 transition-colors">
                Manage Services
              </h4>
              <p className="text-xs text-slate-400">Update rates & descriptions</p>
            </div>
          </div>
          <ChevronRight className="w-4 h-4 text-slate-400 group-hover:translate-x-1 transition-transform" />
        </Link>

        <Link
          to="/provider/availability"
          className="bg-white rounded-2xl p-5 border border-slate-200/80 hover:border-blue-400 hover:shadow-md transition-all flex items-center justify-between group"
        >
          <div className="flex items-center gap-3.5">
            <div className="w-10 h-10 rounded-xl bg-indigo-50 text-indigo-600 flex items-center justify-center">
              <Clock className="w-5 h-5" />
            </div>
            <div>
              <h4 className="text-sm font-bold text-slate-900 group-hover:text-indigo-600 transition-colors">
                Working Schedule
              </h4>
              <p className="text-xs text-slate-400">Set active working hours</p>
            </div>
          </div>
          <ChevronRight className="w-4 h-4 text-slate-400 group-hover:translate-x-1 transition-transform" />
        </Link>

        <Link
          to="/provider/photos"
          className="bg-white rounded-2xl p-5 border border-slate-200/80 hover:border-blue-400 hover:shadow-md transition-all flex items-center justify-between group"
        >
          <div className="flex items-center gap-3.5">
            <div className="w-10 h-10 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center">
              <Star className="w-5 h-5" />
            </div>
            <div>
              <h4 className="text-sm font-bold text-slate-900 group-hover:text-emerald-600 transition-colors">
                Work Portfolio
              </h4>
              <p className="text-xs text-slate-400">Showcase past job photos</p>
            </div>
          </div>
          <ChevronRight className="w-4 h-4 text-slate-400 group-hover:translate-x-1 transition-transform" />
        </Link>
      </div>

      {/* Actionable Pending Requests Queue */}
      {pendingRequests.length > 0 && (
        <div className="bg-amber-50/70 border border-amber-200/80 rounded-3xl p-6 space-y-4">
          <div className="flex items-center gap-2 text-amber-900">
            <AlertCircle className="w-5 h-5 text-amber-600" />
            <h2 className="text-base font-bold">New Booking Requests ({pendingRequests.length})</h2>
          </div>

          <div className="space-y-3">
            {pendingRequests.map((req) => (
              <div
                key={req.id}
                className="bg-white rounded-2xl p-4 sm:p-5 border border-amber-200 shadow-sm flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4"
              >
                <div>
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-sm text-slate-900">Booking #{req.id}</span>
                    <span className="text-xs font-semibold px-2 py-0.5 rounded-full bg-amber-100 text-amber-800">
                      Pending Confirmation
                    </span>
                  </div>
                  <p className="text-xs text-slate-500 mt-1">
                    Scheduled for {formatDate(req.requestedStartAt)} · {formatPrice(req.priceSnapshot)}
                  </p>
                  {req.serviceAddress && (
                    <p className="text-xs text-slate-600 mt-0.5 flex items-center gap-1">
                      <MapPin className="w-3.5 h-3.5 text-slate-400" />
                      <span>{req.serviceAddress}</span>
                    </p>
                  )}
                </div>

                <div className="flex items-center gap-2 self-end sm:self-center">
                  <button
                    onClick={() => updateStatusMutation.mutate({ id: req.id, status: 'ACCEPTED' })}
                    disabled={updateStatusMutation.isPending}
                    className="px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold shadow-sm flex items-center gap-1.5 transition-all"
                  >
                    <Check className="w-3.5 h-3.5" /> Accept
                  </button>
                  <button
                    onClick={() => updateStatusMutation.mutate({ id: req.id, status: 'REJECTED' })}
                    disabled={updateStatusMutation.isPending}
                    className="px-3.5 py-2 rounded-xl border border-rose-200 hover:bg-rose-50 text-rose-600 text-xs font-semibold transition-all"
                  >
                    <X className="w-3.5 h-3.5" /> Decline
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Recent Bookings Overview */}
      <div className="bg-white rounded-3xl border border-slate-200/80 shadow-sm overflow-hidden">
        <div className="p-6 border-b border-slate-100 flex items-center justify-between">
          <div>
            <h2 className="text-lg font-bold text-slate-900">Recent Customer Bookings</h2>
            <p className="text-xs text-slate-400">All recent incoming jobs and completed visits</p>
          </div>
          <Link
            to="/provider/bookings"
            className="text-xs font-bold text-blue-600 hover:text-blue-700 flex items-center gap-1"
          >
            <span>All Bookings</span>
            <ChevronRight className="w-4 h-4" />
          </Link>
        </div>

        {loadingBookings ? (
          <div className="p-8"><LoadingState message="Loading bookings..." /></div>
        ) : allBookings.length === 0 ? (
          <div className="p-12 text-center text-sm text-slate-500">
            No booking requests received yet. Ensure your catalog and availability are up to date.
          </div>
        ) : (
          <div className="divide-y divide-slate-100">
            {allBookings.map((b) => (
              <Link
                key={b.id}
                to={`/provider/bookings/${b.id}`}
                className="p-5 flex items-center justify-between hover:bg-slate-50/80 transition-colors group"
              >
                <div className="space-y-1">
                  <div className="flex items-center gap-2.5">
                    <h4 className="text-sm font-bold text-slate-900 group-hover:text-blue-600 transition-colors">
                      Booking #{b.id}
                    </h4>
                    <BookingStatusBadge status={b.status} />
                  </div>
                  <p className="text-xs text-slate-500">
                    {formatDate(b.requestedStartAt)} · {formatPrice(b.priceSnapshot)}
                  </p>
                </div>

                <div className="flex items-center gap-2">
                  <span className="text-xs text-slate-400 hidden sm:inline">Details</span>
                  <ChevronRight className="w-4 h-4 text-slate-300 group-hover:text-slate-600 group-hover:translate-x-0.5 transition-all" />
                </div>
              </Link>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
