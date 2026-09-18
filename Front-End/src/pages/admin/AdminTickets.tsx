import { useState } from 'react'
import { Link } from 'react-router-dom'
import { useQuery } from '@tanstack/react-query'
import { adminTicketApi } from '@/api/tickets'
import { TicketStatusBadge, PriorityBadge } from '@/components/shared/StatusBadge'
import { Pagination } from '@/components/shared/Pagination'
import { LoadingState, ErrorState, EmptyState } from '@/components/shared/UxStates'
import { formatRelative } from '@/utils/formatters'
import type { TicketStatus } from '@/types'

const TABS: { label: string; value: TicketStatus | '' }[] = [
  { label: 'All', value: '' }, { label: 'Open', value: 'OPEN' }, { label: 'In Progress', value: 'IN_PROGRESS' }, { label: 'Pending', value: 'PENDING_CUSTOMER' }, { label: 'Resolved', value: 'RESOLVED' }, { label: 'Closed', value: 'CLOSED' },
]

export default function AdminTickets() {
  const [status, setStatus] = useState<TicketStatus | ''>('')
  const [page, setPage] = useState(0)

  const { data, isLoading, error, refetch } = useQuery({
    queryKey: ['admin', 'tickets', status, page],
    queryFn: () => status ? adminTicketApi.getByStatus(status, { page, size: 10 }) : adminTicketApi.getAll({ page, size: 10 }),
    select: (r) => r.data,
  })

  const tickets = data?.content ?? []

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold text-[#0F172A]">Support Tickets</h1>
      <div className="flex gap-2 overflow-x-auto no-scrollbar">
        {TABS.map((t) => (
          <button key={t.value} onClick={() => { setStatus(t.value); setPage(0) }} className={`px-3 py-1.5 rounded-pill text-xs font-medium whitespace-nowrap ${status === t.value ? 'bg-[#2563EB] text-white' : 'bg-white border border-[#E2E8F0] text-[#64748B]'}`}>{t.label}</button>
        ))}
      </div>
      {isLoading ? <LoadingState /> : error ? <ErrorState action={{ label: 'Retry', onClick: () => refetch() }} /> : !tickets.length ? (
        <EmptyState title="No tickets" />
      ) : (
        <>
          <div className="space-y-3">
            {tickets.map((t) => (
              <Link key={t.id} to={`/admin/tickets/${t.id}`} className="sc-card-hover p-4 flex items-center justify-between">
                <div><p className="text-sm font-medium">{t.subject}</p><p className="text-xs text-[#64748B]">#{t.ticketNumber} · {formatRelative(t.createdAt)}</p></div>
                <div className="flex gap-2"><PriorityBadge priority={t.priority} /><TicketStatusBadge status={t.status} /></div>
              </Link>
            ))}
          </div>
          <Pagination page={page} totalPages={data?.totalPages ?? 1} onPageChange={setPage} />
        </>
      )}
    </div>
  )
}
