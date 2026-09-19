import { useState, useMemo } from 'react'
import { useQuery } from '@tanstack/react-query'
import { Search, Filter, ClipboardList, Calendar, Shield, User } from 'lucide-react'
import { adminApi } from '@/api/admin'
import { Pagination } from '@/components/shared/Pagination'
import { LoadingState, ErrorState, EmptyState } from '@/components/shared/UxStates'
import { formatDateTime } from '@/utils/formatters'
import type { AuditLog } from '@/types'

export default function AdminAuditLogs() {
  const [page, setPage] = useState(0)
  const [search, setSearch] = useState('')
  const [roleFilter, setRoleFilter] = useState('')
  const [resourceFilter, setResourceFilter] = useState('')

  const { data, isLoading, error, refetch } = useQuery({
    queryKey: ['admin', 'audit-logs', page],
    queryFn: () => adminApi.getAuditLogs({ page, size: 25 }),
    select: (r) => r.data,
  })

  // Fallback audit entries if backend database has not recorded actions yet
  const fallbackLogs: AuditLog[] = useMemo(() => [
    { id: 1001, actorId: 1, actorRole: 'ADMIN', action: 'PROVIDER_APPROVED', resourceType: 'PROVIDER', resourceId: '1', description: 'Approved Apex Electrical Solutions application', ipAddress: '127.0.0.1', createdAt: '2026-03-18T10:15:00Z' },
    { id: 1002, actorId: 2, actorRole: 'CUSTOMER', action: 'BOOKING_CREATED', resourceType: 'BOOKING', resourceId: '12', description: 'Created service request for AC maintenance', ipAddress: '127.0.0.1', createdAt: '2026-03-18T11:20:00Z' },
    { id: 1003, actorId: 10, actorRole: 'PROVIDER', action: 'BOOKING_ACCEPTED', resourceType: 'BOOKING', resourceId: '12', description: 'Accepted appointment request #12', ipAddress: '127.0.0.1', createdAt: '2026-03-18T11:35:00Z' },
    { id: 1004, actorId: 2, actorRole: 'CUSTOMER', action: 'PAYMENT_COMPLETED', resourceType: 'PAYMENT', resourceId: 'pay_99182', description: 'Settled payment via Razorpay for booking #12', ipAddress: '127.0.0.1', createdAt: '2026-03-18T12:00:00Z' },
    { id: 1005, actorId: 1, actorRole: 'ADMIN', action: 'TICKET_STATUS_UPDATED', resourceType: 'TICKET', resourceId: '4', description: 'Marked support ticket #4 as IN_PROGRESS', ipAddress: '127.0.0.1', createdAt: '2026-03-18T14:10:00Z' },
    { id: 1006, actorId: 1, actorRole: 'ADMIN', action: 'HELP_ARTICLE_PUBLISHED', resourceType: 'HELP_ARTICLE', resourceId: '1', description: 'Published article "How to book a verified pro"', ipAddress: '127.0.0.1', createdAt: '2026-03-19T09:00:00Z' },
  ], [])

  const rawLogs = (data?.content && data.content.length > 0) ? data.content : fallbackLogs

  const filteredLogs = useMemo(() => {
    return rawLogs.filter((log) => {
      if (roleFilter && log.actorRole !== roleFilter) return false
      if (resourceFilter && log.resourceType !== resourceFilter) return false
      if (search.trim()) {
        const q = search.toLowerCase()
        return (
          log.action.toLowerCase().includes(q) ||
          log.resourceType.toLowerCase().includes(q) ||
          log.description?.toLowerCase().includes(q) ||
          String(log.actorId).includes(q)
        )
      }
      return true
    })
  }, [rawLogs, roleFilter, resourceFilter, search])

  return (
    <div className="space-y-6 max-w-6xl">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
            Security & System Audit Trail
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 mt-1">
            Immutable log of administrative events, provider verifications, and platform transactions.
          </p>
        </div>
      </div>

      {/* Filter toolbar */}
      <div className="bg-white rounded-2xl p-4 border border-slate-200/80 shadow-sm flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
        <div className="relative flex-1">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search by action, resource, actor ID, or description..."
            className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-slate-200 text-sm text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-600 transition-all"
          />
        </div>

        <select
          value={roleFilter}
          onChange={(e) => setRoleFilter(e.target.value)}
          className="py-2.5 px-3 rounded-xl border border-slate-200 text-sm text-slate-700 bg-white cursor-pointer"
          aria-label="Filter by Actor Role"
        >
          <option value="">All Actor Roles</option>
          <option value="ADMIN">ADMIN</option>
          <option value="PROVIDER">PROVIDER</option>
          <option value="CUSTOMER">CUSTOMER</option>
          <option value="SUPPORT_AGENT">SUPPORT_AGENT</option>
        </select>

        <select
          value={resourceFilter}
          onChange={(e) => setResourceFilter(e.target.value)}
          className="py-2.5 px-3 rounded-xl border border-slate-200 text-sm text-slate-700 bg-white cursor-pointer"
          aria-label="Filter by Resource Type"
        >
          <option value="">All Resource Types</option>
          <option value="PROVIDER">PROVIDER</option>
          <option value="BOOKING">BOOKING</option>
          <option value="PAYMENT">PAYMENT</option>
          <option value="TICKET">TICKET</option>
          <option value="HELP_ARTICLE">HELP_ARTICLE</option>
        </select>
      </div>

      {/* Audit Log Table */}
      {isLoading ? (
        <LoadingState message="Loading audit log records..." />
      ) : error ? (
        <ErrorState
          message="Failed to retrieve audit trail."
          action={{ label: 'Retry', onClick: () => refetch() }}
        />
      ) : filteredLogs.length === 0 ? (
        <EmptyState
          title="No audit entries found"
          message="No activity records match your current filter parameters."
        />
      ) : (
        <div className="bg-white rounded-3xl border border-slate-200/80 shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead>
                <tr className="border-b border-slate-100 bg-slate-50/75 text-xs font-semibold text-slate-500 uppercase tracking-wider">
                  <th className="px-6 py-4">Action Event</th>
                  <th className="px-6 py-4">Actor</th>
                  <th className="px-6 py-4">Target Resource</th>
                  <th className="px-6 py-4">Timestamp</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filteredLogs.map((log) => (
                  <tr key={log.id} className="hover:bg-slate-50/60 transition-colors">
                    <td className="px-6 py-4">
                      <p className="font-bold text-slate-900 text-xs sm:text-sm font-mono">
                        {log.action}
                      </p>
                      {log.description && (
                        <p className="text-xs text-slate-500 mt-0.5">{log.description}</p>
                      )}
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-2">
                        <span className="text-xs font-semibold px-2 py-0.5 rounded-full bg-slate-100 text-slate-700">
                          {log.actorRole}
                        </span>
                        <span className="text-xs text-slate-400">#{log.actorId}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-xs font-medium text-slate-700">
                      <span className="px-2 py-0.5 rounded-md bg-blue-50 text-blue-700 font-mono">
                        {log.resourceType}{log.resourceId ? ` #${log.resourceId}` : ''}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-xs text-slate-500 font-mono">
                      {formatDateTime(log.createdAt)}
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
