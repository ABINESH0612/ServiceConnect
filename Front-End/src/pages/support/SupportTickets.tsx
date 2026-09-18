import { useState } from 'react'
import { Link } from 'react-router-dom'
import { useQuery } from '@tanstack/react-query'
import { agentTicketApi } from '@/api/tickets'
import { TicketStatusBadge, PriorityBadge } from '@/components/shared/StatusBadge'
import { Pagination } from '@/components/shared/Pagination'
import { LoadingState, ErrorState, EmptyState } from '@/components/shared/UxStates'
import { formatRelative } from '@/utils/formatters'

export default function SupportTickets() {
  const [page, setPage] = useState(0)
  const { data, isLoading, error, refetch } = useQuery({
    queryKey: ['support', 'tickets', page],
    queryFn: () => agentTicketApi.getAssigned({ page, size: 10 }),
    select: (r) => r.data,
  })
  const tickets = data?.content ?? []

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold text-[#0F172A]">My Assigned Tickets</h1>
      {isLoading ? <LoadingState /> : error ? <ErrorState action={{ label: 'Retry', onClick: () => refetch() }} /> : !tickets.length ? (
        <EmptyState title="No assigned tickets" message="You don't have any tickets assigned to you." />
      ) : (
        <>
          <div className="space-y-3">
            {tickets.map((t) => (
              <Link key={t.id} to={`/support/tickets/${t.id}`} className="sc-card-hover p-4 flex items-center justify-between">
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
