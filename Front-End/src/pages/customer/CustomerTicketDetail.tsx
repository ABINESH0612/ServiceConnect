import { useParams, Link } from 'react-router-dom'
import { useState, useEffect, useRef } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { toast } from 'sonner'
import { ArrowLeft, Send } from 'lucide-react'
import { customerTicketApi } from '@/api/tickets'
import { TicketStatusBadge, PriorityBadge } from '@/components/shared/StatusBadge'
import { LoadingState, ErrorState } from '@/components/shared/UxStates'
import { formatDateTime } from '@/utils/formatters'
import { useAuthStore } from '@/store/authStore'

export default function CustomerTicketDetail() {
  const { id } = useParams<{ id: string }>()
  const ticketId = Number(id)
  const qc = useQueryClient()
  const user = useAuthStore((s) => s.user)
  const [message, setMessage] = useState('')
  const messagesEnd = useRef<HTMLDivElement>(null)

  const { data: ticket, isLoading, error } = useQuery({
    queryKey: ['ticket', ticketId],
    queryFn: () => customerTicketApi.getById(ticketId),
    select: (r) => r.data,
    enabled: !isNaN(ticketId),
  })

  const { data: messages } = useQuery({
    queryKey: ['ticket', ticketId, 'messages'],
    queryFn: () => customerTicketApi.getMessages(ticketId, { size: 100 }),
    select: (r) => r.data,
    enabled: !isNaN(ticketId),
    refetchInterval: 15000,
  })

  const sendMutation = useMutation({
    mutationFn: () => customerTicketApi.sendMessage(ticketId, { content: message }),
    onSuccess: () => { setMessage(''); qc.invalidateQueries({ queryKey: ['ticket', ticketId, 'messages'] }) },
    onError: () => toast.error('Failed to send message'),
  })

  const msgList = messages?.content ?? []

  useEffect(() => {
    messagesEnd.current?.scrollIntoView({ behavior: 'smooth' })
  }, [msgList.length])

  if (isLoading) return <LoadingState message="Loading ticket…" />
  if (error || !ticket) return <ErrorState message="Ticket not found." />

  return (
    <div className="max-w-2xl space-y-4">
      <Link to="/customer/support/tickets" className="inline-flex items-center gap-1 text-sm text-[#64748B] hover:text-[#2563EB]">
        <ArrowLeft className="w-4 h-4" /> Back to Tickets
      </Link>

      <div className="flex items-center justify-between flex-wrap gap-2">
        <div>
          <h1 className="text-xl font-bold text-[#0F172A]">{ticket.subject}</h1>
          <p className="text-xs text-[#94A3B8]">#{ticket.ticketNumber}</p>
        </div>
        <div className="flex items-center gap-2">
          <PriorityBadge priority={ticket.priority} />
          <TicketStatusBadge status={ticket.status} />
        </div>
      </div>

      <div className="sc-card p-4">
        <p className="text-sm text-[#0F172A]">{ticket.description}</p>
        <p className="text-xs text-[#94A3B8] mt-2">{formatDateTime(ticket.createdAt)}</p>
      </div>

      {/* Messages */}
      <div className="sc-card">
        <div className="p-4 border-b border-[#E2E8F0]">
          <h2 className="text-sm font-semibold text-[#0F172A]">Conversation</h2>
        </div>
        <div className="p-4 space-y-3 max-h-[400px] overflow-y-auto">
          {msgList.length === 0 ? (
            <p className="text-sm text-[#64748B] text-center py-4">No messages yet.</p>
          ) : (
            msgList.map((m) => (
              <div key={m.id} className={`flex ${m.senderId === user?.id ? 'justify-end' : 'justify-start'}`}>
                <div className={`max-w-[75%] px-3 py-2 rounded-[12px] text-sm ${
                  m.senderId === user?.id ? 'bg-[#2563EB] text-white' : 'bg-[#F1F5F9] text-[#0F172A]'
                }`}>
                  <p>{m.content || m.message}</p>
                  <p className={`text-xs mt-1 ${m.senderId === user?.id ? 'text-white/60' : 'text-[#94A3B8]'}`}>{formatDateTime(m.createdAt)}</p>
                </div>
              </div>
            ))
          )}
          <div ref={messagesEnd} />
        </div>

        {ticket.status !== 'CLOSED' && ticket.status !== 'RESOLVED' && (
          <div className="p-4 border-t border-[#E2E8F0] flex gap-2">
            <input
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && !e.shiftKey && message.trim() && sendMutation.mutate()}
              placeholder="Type a message…"
              className="sc-input flex-1"
            />
            <button
              onClick={() => sendMutation.mutate()}
              disabled={!message.trim() || sendMutation.isPending}
              className="sc-btn-primary px-4"
              aria-label="Send message"
            >
              <Send className="w-4 h-4" />
            </button>
          </div>
        )}
      </div>
    </div>
  )
}
