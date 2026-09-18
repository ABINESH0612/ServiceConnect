import { useState } from 'react'
import { useQuery } from '@tanstack/react-query'
import { adminApi } from '@/api/admin'
import { Pagination } from '@/components/shared/Pagination'
import { LoadingState, ErrorState, EmptyState } from '@/components/shared/UxStates'
import { formatDateTime } from '@/utils/formatters'

export default function AdminAuditLogs() {
  const [page, setPage] = useState(0)

  const { data, isLoading, error, refetch } = useQuery({
    queryKey: ['admin', 'audit-logs', page],
    queryFn: () => adminApi.getAuditLogs({ page, size: 20 }),
    select: (r) => r.data,
  })

  const logs = data?.content ?? []

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold text-[#0F172A]">Audit Logs</h1>
      {isLoading ? <LoadingState /> : error ? <ErrorState action={{ label: 'Retry', onClick: () => refetch() }} /> : !logs.length ? (
        <EmptyState title="No audit logs" />
      ) : (
        <>
          <div className="sc-card overflow-hidden">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-[#E2E8F0] bg-[#F8FAFC]">
                  <th className="text-left px-4 py-3 font-medium text-[#64748B]">Action</th>
                  <th className="text-left px-4 py-3 font-medium text-[#64748B]">Actor</th>
                  <th className="text-left px-4 py-3 font-medium text-[#64748B]">Resource</th>
                  <th className="text-left px-4 py-3 font-medium text-[#64748B]">Date</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#E2E8F0]">
                {logs.map((log) => (
                  <tr key={log.id} className="hover:bg-[#F8FAFC]">
                    <td className="px-4 py-3 font-medium text-[#0F172A]">{log.action}</td>
                    <td className="px-4 py-3 text-[#64748B]">#{log.actorId} ({log.actorRole})</td>
                    <td className="px-4 py-3 text-[#64748B]">{log.resourceType}{log.resourceId ? ` #${log.resourceId}` : ''}</td>
                    <td className="px-4 py-3 text-[#94A3B8]">{formatDateTime(log.createdAt)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <Pagination page={page} totalPages={data?.totalPages ?? 1} onPageChange={setPage} />
        </>
      )}
    </div>
  )
}
