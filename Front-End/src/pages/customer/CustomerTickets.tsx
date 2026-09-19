import { useState } from 'react'
import { Link } from 'react-router-dom'
import { useQuery } from '@tanstack/react-query'
import { Headphones, Plus, ChevronRight, Clock, MessageSquare } from 'lucide-react'
import { customerTicketApi } from '@/api/tickets'
import { TicketStatusBadge, PriorityBadge } from '@/components/shared/StatusBadge'
import { Pagination } from '@/components/shared/Pagination'
import { LoadingState, ErrorState, EmptyState } from '@/components/shared/UxStates'
import { formatRelative, formatDate } from '@/utils/formatters'

export default function CustomerTickets() {
  const [page, setPage] = useState(0)

  const { data, isLoading, error, refetch } = useQuery({
    queryKey: ['customer', 'tickets', page],
    queryFn: () => customerTicketApi.getMyTickets({ page, size: 10 }),
    select: (r) => r.data,
  })

  const tickets = data?.content ?? []

  return (
    <div className="max-w-4xl space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
            Support Cases & Tickets
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 mt-1">
            Track inquiries, technical issues, and communicate directly with support agents.
          </p>
        </div>
        <Link
          to="/customer/support"
          className="inline-flex items-center gap-1.5 px-4 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold shadow-sm transition-all self-start sm:self-auto"
        >
          <Plus className="w-4 h-4" />
          <span>New Support Ticket</span>
        </Link>
      </div>

      {isLoading ? (
        <LoadingState message="Loading support tickets..." />
      ) : error ? (
        <ErrorState
          message="Failed to load support tickets."
          action={{ label: 'Retry', onClick: () => refetch() }}
        />
      ) : tickets.length === 0 ? (
        <EmptyState
          title="No support tickets found"
          message="Need assistance with a booking or account issue? Our support team is here to help."
          action={{
            label: 'Create Support Ticket',
            onClick: () => window.location.assign('/customer/support'),
          }}
        />
      ) : (
        <div className="space-y-3.5">
          {tickets.map((t) => (
            <Link
              key={t.id}
              to={`/customer/support/tickets/${t.id}`}
              className="bg-white rounded-2xl p-5 border border-slate-200/80 hover:shadow-md transition-all flex items-center justify-between gap-4 group"
            >
              <div className="space-y-1">
                <div className="flex items-center gap-2.5 flex-wrap">
                  <h3 className="text-base font-bold text-slate-900 group-hover:text-blue-600 transition-colors">
                    {t.subject}
                  </h3>
                  <PriorityBadge priority={t.priority} />
                  <TicketStatusBadge status={t.status} />
                </div>
                <p className="text-xs text-slate-500 font-medium flex items-center gap-2">
                  <span className="font-mono">#{t.ticketNumber}</span>
                  <span>·</span>
                  <span>Created {formatRelative(t.createdAt)}</span>
                  {t.category && (
                    <>
                      <span>·</span>
                      <span className="capitalize text-slate-600">{t.category.toLowerCase().replace('_', ' ')}</span>
                    </>
                  )}
                </p>
              </div>

              <div className="flex items-center gap-3">
                <span className="text-xs font-semibold text-blue-600 hidden sm:inline">View Thread</span>
                <ChevronRight className="w-4 h-4 text-slate-400 group-hover:text-blue-600 group-hover:translate-x-0.5 transition-all" />
              </div>
            </Link>
          ))}

          {data && data.totalPages > 1 && (
            <Pagination page={page} totalPages={data.totalPages} onPageChange={setPage} />
          )}
        </div>
      )}
    </div>
  )
}
