import { useParams, Link } from 'react-router-dom'
import { useState, useRef, useEffect } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { toast } from 'sonner'
import { ArrowLeft, Send } from 'lucide-react'
import { adminTicketApi } from '@/api/tickets'
import { TicketStatusBadge, PriorityBadge } from '@/components/shared/StatusBadge'
import { LoadingState, ErrorState } from '@/components/shared/UxStates'
import { formatDateTime } from '@/utils/formatters'
import type { TicketStatus } from '@/types'

export default function AdminTicketDetail() {
  const { id } = useParams<{ id: string }>()
  const qc = useQueryClient()
  const ticketId = Number(id)
  const [message, setMessage] = useState('')
  const [newStatus, setNewStatus] = useState<TicketStatus | ''>('')
  const messagesEnd = useRef<HTMLDivElement>(null)

  const { data: ticket, isLoading, error } = useQuery({
    queryKey: ['admin', 'ticket', ticketId],
    queryFn: () => adminTicketApi.getById(ticketId),
    select: (r) => r.data,
    enabled: !isNaN(ticketId),
  })

  const { data: messages } = useQuery({
    queryKey: ['admin', 'ticket', ticketId, 'messages'],
    queryFn: () => adminTicketApi.getMessages(ticketId, { size: 100 }),
    select: (r) => r.data,
    enabled: !isNaN(ticketId),
    refetchInterval: 15000,
  })

  const sendMutation = useMutation({
    mutationFn: () => adminTicketApi.sendMessage(ticketId, { content: message }),
    onSuccess: () => { setMessage(''); qc.invalidateQueries({ queryKey: ['admin', 'ticket', ticketId, 'messages'] }) },
    onError: () => toast.error('Failed to send'),
  })

  const updateMutation = useMutation({
    mutationFn: (status: TicketStatus) => adminTicketApi.update(ticketId, { status }),
    onSuccess: (_, s) => { toast.success(`Status: ${s}`); setNewStatus(''); qc.invalidateQueries({ queryKey: ['admin', 'ticket', ticketId] }) },
    onError: () => toast.error('Failed to update'),
  })

  const msgList = messages?.content ?? []
  useEffect(() => { messagesEnd.current?.scrollIntoView({ behavior: 'smooth' }) }, [msgList.length])

  if (isLoading) return <LoadingState />
  if (error || !ticket) return <ErrorState message="Ticket not found." />

  return (
    <div className="max-w-2xl space-y-4">
      <Link to="/admin/tickets" className="inline-flex items-center gap-1 text-sm text-[#64748B] hover:text-[#2563EB]"><ArrowLeft className="w-4 h-4" /> Back</Link>
      <div className="flex items-center justify-between flex-wrap gap-2">
        <div><h1 className="text-xl font-bold">{ticket.subject}</h1><p className="text-xs text-[#94A3B8]">#{ticket.ticketNumber} · Customer #{ticket.customerId}</p></div>
        <div className="flex gap-2"><PriorityBadge priority={ticket.priority} /><TicketStatusBadge status={ticket.status} /></div>
      </div>
      <div className="sc-card p-4"><p className="text-sm">{ticket.description}</p><p className="text-xs text-[#94A3B8] mt-2">{formatDateTime(ticket.createdAt)}</p></div>

      {/* Status update */}
      <div className="sc-card p-4 flex items-center gap-3">
        <select value={newStatus} onChange={(e) => setNewStatus(e.target.value as TicketStatus)} className="sc-input w-auto text-sm">
          <option value="">Update Status…</option>
          <option value="IN_PROGRESS">In Progress</option>
          <option value="PENDING_CUSTOMER">Pending Customer</option>
          <option value="RESOLVED">Resolved</option>
          <option value="CLOSED">Closed</option>
        </select>
        <button onClick={() => newStatus && updateMutation.mutate(newStatus as TicketStatus)} disabled={!newStatus || updateMutation.isPending} className="sc-btn-primary text-sm">Update</button>
      </div>

      {/* Messages */}
      <div className="sc-card">
        <div className="p-4 border-b border-[#E2E8F0]"><h2 className="text-sm font-semibold">Conversation</h2></div>
        <div className="p-4 space-y-3 max-h-[400px] overflow-y-auto">
          {!msgList.length ? <p className="text-sm text-[#64748B] text-center py-4">No messages.</p> : msgList.map((m) => (
            <div key={m.id} className="bg-[#F1F5F9] px-3 py-2 rounded-[12px] text-sm">
              <p>{m.content || m.message}</p><p className="text-xs text-[#94A3B8] mt-1">Sender #{m.senderId} · {formatDateTime(m.createdAt)}</p>
            </div>
          ))}
          <div ref={messagesEnd} />
        </div>
        <div className="p-4 border-t border-[#E2E8F0] flex gap-2">
          <input value={message} onChange={(e) => setMessage(e.target.value)} onKeyDown={(e) => e.key === 'Enter' && message.trim() && sendMutation.mutate()} placeholder="Reply…" className="sc-input flex-1" />
          <button onClick={() => sendMutation.mutate()} disabled={!message.trim()} className="sc-btn-primary px-4"><Send className="w-4 h-4" /></button>
        </div>
      </div>
    </div>
  )
}
