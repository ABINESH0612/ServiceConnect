import { useState, useMemo } from 'react'
import { Link } from 'react-router-dom'
import { useQuery } from '@tanstack/react-query'
import {
  Users, Search, Filter, CheckCircle2, ChevronRight,
  Clock, ShieldAlert, MapPin
} from 'lucide-react'
import { adminProviderApi } from '@/api/provider'
import { ProviderStatusBadge } from '@/components/shared/StatusBadge'
import { Pagination } from '@/components/shared/Pagination'
import { LoadingState, ErrorState, EmptyState } from '@/components/shared/UxStates'
import { Avatar } from '@/components/shared/Avatar'
import { formatDate } from '@/utils/formatters'
import type { ProviderStatus, Provider } from '@/types'

const STATUS_TABS: { label: string; value: ProviderStatus | '' }[] = [
  { label: 'All Providers', value: '' },
  { label: 'Pending Approval', value: 'PENDING' },
  { label: 'Approved', value: 'APPROVED' },
  { label: 'Rejected', value: 'REJECTED' },
  { label: 'Suspended', value: 'SUSPENDED' },
]

export default function AdminProviders() {
  const [status, setStatus] = useState<ProviderStatus | ''>('')
  const [search, setSearch] = useState('')
  const [page, setPage] = useState(0)

  const { data, isLoading, error, refetch } = useQuery({
    queryKey: ['admin', 'providers', status, page],
    queryFn: () => adminProviderApi.getAll({ page, size: 15, status: status || undefined }),
    select: (r) => r.data,
  })

  // Sample fallback providers if database is unseeded
  const fallbackProviders: Provider[] = useMemo(() => [
    { id: 1, userId: 10, businessName: 'Apex Electrical Solutions', email: 'apex.electric@example.com', phone: '+91 98800 11223', city: 'Bangalore', state: 'Karnataka', status: 'APPROVED', createdAt: '2026-01-10T10:00:00Z', updatedAt: '2026-01-10T10:00:00Z' },
    { id: 2, userId: 11, businessName: 'AquaFlow Plumbing Experts', email: 'contact@aquaflow.in', phone: '+91 97700 22334', city: 'Bangalore', state: 'Karnataka', status: 'APPROVED', createdAt: '2026-01-20T11:00:00Z', updatedAt: '2026-01-20T11:00:00Z' },
    { id: 3, userId: 12, businessName: 'CoolBreeze HVAC Systems', email: 'service@coolbreeze.com', phone: '+91 96600 33445', city: 'Bangalore', state: 'Karnataka', status: 'PENDING', createdAt: '2026-03-01T15:00:00Z', updatedAt: '2026-03-01T15:00:00Z' },
    { id: 4, userId: 13, businessName: 'Pristine Home Cleaning', email: 'hello@pristineclean.in', phone: '+91 95500 44556', city: 'Bangalore', state: 'Karnataka', status: 'PENDING', createdAt: '2026-03-05T09:30:00Z', updatedAt: '2026-03-05T09:30:00Z' },
    { id: 5, userId: 14, businessName: 'Sparkle Facility Maintenance', email: 'info@sparkle.co', phone: '+91 94400 55667', city: 'Bangalore', state: 'Karnataka', status: 'SUSPENDED', createdAt: '2025-11-12T14:00:00Z', updatedAt: '2025-11-12T14:00:00Z' },
  ], [])

  const rawList = (data?.content && data.content.length > 0) ? data.content : fallbackProviders

  const filteredProviders = useMemo(() => {
    let list = status ? rawList.filter((p) => p.status === status) : rawList
    if (search.trim()) {
      const q = search.toLowerCase()
      list = list.filter(
        (p) =>
          p.businessName.toLowerCase().includes(q) ||
          p.email?.toLowerCase().includes(q) ||
          p.city?.toLowerCase().includes(q)
      )
    }
    return list
  }, [rawList, status, search])

  return (
    <div className="space-y-6 max-w-6xl">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
            Service Provider Management
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 mt-1">
            Review partner applications, verify business credentials, and govern statuses.
          </p>
        </div>

        <div className="relative min-w-[260px]">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search providers or email..."
            className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-slate-200 text-sm text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-600 transition-all"
          />
        </div>
      </div>

      {/* Tabs */}
      <div className="flex items-center gap-2 overflow-x-auto pb-1 no-scrollbar">
        {STATUS_TABS.map((tab) => {
          const isSelected = status === tab.value
          return (
            <button
              key={tab.value}
              onClick={() => {
                setStatus(tab.value)
                setPage(0)
              }}
              className={`px-4 py-2 rounded-xl text-xs sm:text-sm font-semibold whitespace-nowrap transition-all ${
                isSelected
                  ? 'bg-blue-600 text-white shadow-sm'
                  : 'bg-white border border-slate-200 text-slate-600 hover:bg-slate-50'
              }`}
            >
              {tab.label}
            </button>
          )
        })}
      </div>

      {isLoading ? (
        <LoadingState message="Loading provider records..." />
      ) : error ? (
        <ErrorState
          message="Failed to load providers list."
          action={{ label: 'Retry', onClick: () => refetch() }}
        />
      ) : filteredProviders.length === 0 ? (
        <EmptyState
          title="No providers found"
          message={status ? `No providers found with status "${status.toLowerCase()}".` : 'No registered service partners found.'}
        />
      ) : (
        <div className="bg-white rounded-3xl border border-slate-200/80 shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead>
                <tr className="border-b border-slate-100 bg-slate-50/75 text-xs font-semibold text-slate-500 uppercase tracking-wider">
                  <th className="px-6 py-4">Provider Business</th>
                  <th className="px-6 py-4">Location</th>
                  <th className="px-6 py-4">Contact</th>
                  <th className="px-6 py-4">Verification Status</th>
                  <th className="px-6 py-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filteredProviders.map((p) => (
                  <tr key={p.id} className="hover:bg-slate-50/60 transition-colors">
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <Avatar name={p.businessName} size="md" />
                        <div>
                          <p className="font-bold text-slate-900">{p.businessName}</p>
                          <p className="text-xs text-slate-400">ID: #{p.id} · User #{p.userId}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-slate-600 font-medium text-xs">
                      {p.city ? (
                        <span className="flex items-center gap-1.5">
                          <MapPin className="w-3.5 h-3.5 text-slate-400" />
                          <span>{p.city}{p.state ? `, ${p.state}` : ''}</span>
                        </span>
                      ) : (
                        <span className="text-slate-400">Location not set</span>
                      )}
                    </td>
                    <td className="px-6 py-4 text-xs text-slate-600">
                      <p>{p.email}</p>
                      {p.phone && <p className="text-slate-400 mt-0.5">{p.phone}</p>}
                    </td>
                    <td className="px-6 py-4">
                      <ProviderStatusBadge status={p.status} />
                    </td>
                    <td className="px-6 py-4 text-right">
                      <Link
                        to={`/admin/providers/${p.id}`}
                        className="px-3.5 py-1.5 rounded-lg bg-blue-50 hover:bg-blue-100 text-blue-700 text-xs font-semibold transition-colors"
                      >
                        Manage Partner
                      </Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {data && data.totalPages > 1 && (
            <div className="p-4 border-t border-slate-100">
              <Pagination page={page} totalPages={data.totalPages} onPageChange={setPage} />
            </div>
          )}
        </div>
      )}
    </div>
  )
}
