import { useState } from 'react'
import { Link } from 'react-router-dom'
import { useQuery } from '@tanstack/react-query'
import { adminProviderApi } from '@/api/provider'
import { ProviderStatusBadge } from '@/components/shared/StatusBadge'
import { Pagination } from '@/components/shared/Pagination'
import { LoadingState, ErrorState, EmptyState } from '@/components/shared/UxStates'
import type { ProviderStatus } from '@/types'

const TABS: { label: string; value: ProviderStatus | '' }[] = [
  { label: 'All', value: '' }, { label: 'Pending', value: 'PENDING' }, { label: 'Approved', value: 'APPROVED' }, { label: 'Rejected', value: 'REJECTED' }, { label: 'Suspended', value: 'SUSPENDED' },
]

export default function AdminProviders() {
  const [status, setStatus] = useState<ProviderStatus | ''>('')
  const [page, setPage] = useState(0)

  const { data, isLoading, error, refetch } = useQuery({
    queryKey: ['admin', 'providers', status, page],
    queryFn: () => adminProviderApi.getAll({ page, size: 10, status: status || undefined }),
    select: (r) => r.data,
  })

  const providers = data?.content ?? []

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold text-[#0F172A]">Manage Providers</h1>
      <div className="flex gap-2 overflow-x-auto no-scrollbar">
        {TABS.map((t) => (
          <button key={t.value} onClick={() => { setStatus(t.value); setPage(0) }} className={`px-4 py-2 rounded-pill text-sm font-medium whitespace-nowrap ${status === t.value ? 'bg-[#2563EB] text-white' : 'bg-white border border-[#E2E8F0] text-[#64748B]'}`}>{t.label}</button>
        ))}
      </div>
      {isLoading ? <LoadingState /> : error ? <ErrorState action={{ label: 'Retry', onClick: () => refetch() }} /> : !providers.length ? (
        <EmptyState title="No providers" message={status ? `No ${status.toLowerCase()} providers.` : 'No providers registered yet.'} />
      ) : (
        <>
          <div className="space-y-3">
            {providers.map((p) => (
              <Link key={p.id} to={`/admin/providers/${p.id}`} className="sc-card-hover p-4 flex items-center justify-between">
                <div><p className="text-sm font-medium">{p.businessName}</p><p className="text-xs text-[#64748B]">{p.email} · {p.city ?? ''}</p></div>
                <ProviderStatusBadge status={p.status} />
              </Link>
            ))}
          </div>
          <Pagination page={page} totalPages={data?.totalPages ?? 1} onPageChange={setPage} />
        </>
      )}
    </div>
  )
}
