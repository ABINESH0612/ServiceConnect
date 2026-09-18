import { useState } from 'react'
import { Link } from 'react-router-dom'
import { useQuery } from '@tanstack/react-query'
import { customerTicketApi } from '@/api/tickets'
import { TicketStatusBadge, PriorityBadge } from '@/components/shared/StatusBadge'
import { Pagination } from '@/components/shared/Pagination'
import { LoadingState, ErrorState, EmptyState } from '@/components/shared/UxStates'
import { formatRelative } from '@/utils/formatters'

export default function CustomerTickets() {
  const [page, setPage] = useState(0)
  const { data, isLoading, error, refetch } = useQuery({
    queryKey: ['customer', 'tickets', page],
    queryFn: () => customerTicketApi.getMyTickets({ page, size: 10 }),
    select: (r) => r.data,
  })
  const tickets = data?.content ?? []

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-[#0F172A]">My Tickets</h1>
        <Link to="/customer/support" className="sc-btn-primary text-sm">New Ticket</Link>
      </div>
      {isLoading ? <LoadingState message="Loading tickets…" /> : error ? (
        <ErrorState message="Failed to load tickets." action={{ label: 'Retry', onClick: () => refetch() }} />
      ) : tickets.length === 0 ? (
        <EmptyState title="No tickets" message="You haven't submitted any support tickets yet." action={{ label: 'Create Ticket', onClick: () => window.location.assign('/customer/support') }} />
      ) : (
        <>
          <div className="space-y-3">
            {tickets.map((t) => (
              <Link key={t.id} to={`/customer/support/tickets/${t.id}`} className="sc-card-hover p-4 flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-[#0F172A]">{t.subject}</p>
                  <p className="text-xs text-[#64748B] mt-0.5">#{t.ticketNumber} · {formatRelative(t.createdAt)}</p>
                </div>
                <div className="flex items-center gap-2">
                  <PriorityBadge priority={t.priority} />
                  <TicketStatusBadge status={t.status} />
                </div>
              </Link>
            ))}
          </div>
          <Pagination page={page} totalPages={data?.totalPages ?? 1} onPageChange={setPage} />
        </>
      )}
    </div>
  )
}
