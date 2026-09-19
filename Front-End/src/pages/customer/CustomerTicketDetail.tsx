import { useParams, Link } from 'react-router-dom'
import { useState, useEffect, useRef } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { toast } from 'sonner'
import { ArrowLeft, Send, Headphones, CheckCircle2, Clock } from 'lucide-react'
import { customerTicketApi } from '@/api/tickets'
import { TicketStatusBadge, PriorityBadge } from '@/components/shared/StatusBadge'
import { Avatar } from '@/components/shared/Avatar'
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
    refetchInterval: 10000,
  })

  const sendMutation = useMutation({
    mutationFn: () => customerTicketApi.sendMessage(ticketId, { content: message.trim() }),
    onSuccess: () => {
      setMessage('')
      qc.invalidateQueries({ queryKey: ['ticket', ticketId, 'messages'] })
    },
    onError: () => toast.error('Failed to send response message'),
  })

  const msgList = messages?.content ?? []

  useEffect(() => {
    messagesEnd.current?.scrollIntoView({ behavior: 'smooth' })
  }, [msgList.length])

  if (isLoading) return <div className="max-w-3xl py-8"><LoadingState message="Loading ticket thread..." /></div>
  if (error || !ticket) return <div className="max-w-3xl py-8"><ErrorState message="Ticket not found." /></div>

  const isResolvedOrClosed = ticket.status === 'RESOLVED' || ticket.status === 'CLOSED'

  return (
    <div className="max-w-3xl space-y-6">
      <Link
        to="/customer/support/tickets"
        className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-500 hover:text-blue-600 transition-colors"
      >
        <ArrowLeft className="w-4 h-4" /> Back to My Support Tickets
      </Link>

      {/* Ticket summary header */}
      <div className="bg-white rounded-3xl p-6 sm:p-7 border border-slate-200/80 shadow-sm space-y-3">
        <div className="flex items-start sm:items-center justify-between flex-wrap gap-2">
          <div className="space-y-1">
            <span className="text-xs font-mono font-semibold text-blue-600">
              #{ticket.ticketNumber}
            </span>
            <h1 className="text-xl sm:text-2xl font-extrabold text-slate-900 tracking-tight">
              {ticket.subject}
            </h1>
          </div>
          <div className="flex items-center gap-2">
            <PriorityBadge priority={ticket.priority} />
            <TicketStatusBadge status={ticket.status} />
          </div>
        </div>

        <p className="text-sm text-slate-700 bg-slate-50 p-4 rounded-2xl border border-slate-100 leading-relaxed">
          {ticket.description}
        </p>

        <div className="flex items-center justify-between text-xs text-slate-400 pt-2 border-t border-slate-100">
          <span>Opened: {formatDateTime(ticket.createdAt)}</span>
          {ticket.category && <span className="capitalize">Category: {ticket.category.toLowerCase().replace('_', ' ')}</span>}
        </div>
      </div>

      {/* Message Timeline */}
      <div className="bg-white rounded-3xl border border-slate-200/80 shadow-sm overflow-hidden flex flex-col h-[520px]">
        <div className="p-4 border-b border-slate-100 flex items-center justify-between bg-slate-50/50">
          <div className="flex items-center gap-2">
            <Headphones className="w-4 h-4 text-blue-600" />
            <h2 className="text-sm font-bold text-slate-900">Conversation History</h2>
          </div>
          <span className="text-[11px] text-slate-400 font-medium">Auto-updates live</span>
        </div>

        {/* Scrollable messages container */}
        <div className="flex-1 p-5 space-y-4 overflow-y-auto no-scrollbar">
          {msgList.length === 0 ? (
            <div className="h-full flex flex-col items-center justify-center text-center p-6 space-y-2">
              <div className="w-10 h-10 rounded-full bg-slate-100 text-slate-400 flex items-center justify-center">
                <Clock className="w-5 h-5" />
              </div>
              <p className="text-sm font-bold text-slate-700">Waiting for agent response</p>
              <p className="text-xs text-slate-400 max-w-xs">
                Our support desk has received your ticket. A support agent will respond shortly.
              </p>
            </div>
          ) : (
            msgList.map((m) => {
              const isMe = m.senderId === user?.id
              return (
                <div key={m.id} className={`flex items-start gap-3 ${isMe ? 'flex-row-reverse' : 'flex-row'}`}>
                  <Avatar name={isMe ? (user?.email || 'Me') : 'Support Agent'} size="sm" />
                  <div className={`max-w-[78%] rounded-2xl p-4 text-sm shadow-sm ${
                    isMe
                      ? 'bg-blue-600 text-white rounded-tr-sm'
                      : 'bg-slate-100 text-slate-800 rounded-tl-sm'
                  }`}>
                    <p className="leading-relaxed whitespace-pre-wrap">{m.content || m.message}</p>
                    <p className={`text-[10px] mt-1.5 font-medium ${isMe ? 'text-blue-200 text-right' : 'text-slate-400'}`}>
                      {formatDateTime(m.createdAt)}
                    </p>
                  </div>
                </div>
              )
            })
          )}
          <div ref={messagesEnd} />
        </div>

        {/* Message Input Bar */}
        {isResolvedOrClosed ? (
          <div className="p-4 border-t border-slate-100 bg-slate-50 text-center text-xs text-slate-500 font-medium flex items-center justify-center gap-1.5">
            <CheckCircle2 className="w-4 h-4 text-emerald-600" />
            <span>This ticket has been marked as {ticket.status.toLowerCase()}. Need more help? Open a new ticket.</span>
          </div>
        ) : (
          <form
            onSubmit={(e) => {
              e.preventDefault()
              if (message.trim()) sendMutation.mutate()
            }}
            className="p-3.5 border-t border-slate-100 flex items-center gap-2.5 bg-white"
          >
            <input
              type="text"
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              placeholder="Type your reply to the support team..."
              className="flex-1 px-4 py-3 rounded-xl border border-slate-200 text-sm text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-600 transition-all"
            />
            <button
              type="submit"
              disabled={sendMutation.isPending || !message.trim()}
              className="px-5 py-3 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-sm shadow-sm flex items-center gap-1.5 transition-all disabled:opacity-50"
            >
              <span>Send</span>
              <Send className="w-4 h-4" />
            </button>
          </form>
        )}
      </div>
    </div>
  )
}
