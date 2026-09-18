import { useNavigate } from 'react-router-dom'
import { useMutation } from '@tanstack/react-query'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { toast } from 'sonner'
import { Headphones, Send } from 'lucide-react'
import { customerTicketApi } from '@/api/tickets'
import { createTicketSchema, type CreateTicketFormValues } from '@/utils/validators'

export default function CustomerSupport() {
  const navigate = useNavigate()
  const { register, handleSubmit, formState: { errors } } = useForm<CreateTicketFormValues>({
    resolver: zodResolver(createTicketSchema),
    defaultValues: { priority: 'MEDIUM' },
  })

  const mutation = useMutation({
    mutationFn: (data: CreateTicketFormValues) => customerTicketApi.create(data),
    onSuccess: (res) => {
      toast.success('Support ticket created!')
      navigate(`/customer/support/tickets/${res.data.id}`)
    },
    onError: () => toast.error('Failed to create ticket'),
  })

  return (
    <div className="max-w-2xl space-y-6">
      <div className="flex items-center gap-3">
        <div className="w-10 h-10 rounded-[8px] bg-[#EFF6FF] flex items-center justify-center">
          <Headphones className="w-5 h-5 text-[#2563EB]" />
        </div>
        <div>
          <h1 className="text-2xl font-bold text-[#0F172A]">Contact Support</h1>
          <p className="text-sm text-[#64748B]">We're here to help. Create a support ticket below.</p>
        </div>
      </div>

      <form onSubmit={handleSubmit((d) => mutation.mutate(d))} className="sc-card p-6 space-y-4">
        <div>
          <label htmlFor="subject" className="form-label">Subject</label>
          <input id="subject" {...register('subject')} className="sc-input" placeholder="Brief description of your issue" />
          {errors.subject && <p className="form-error">{errors.subject.message}</p>}
        </div>
        <div>
          <label htmlFor="description" className="form-label">Description</label>
          <textarea id="description" {...register('description')} className="sc-input min-h-[120px]" placeholder="Describe your issue in detail…" />
          {errors.description && <p className="form-error">{errors.description.message}</p>}
        </div>
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label htmlFor="priority" className="form-label">Priority</label>
            <select id="priority" {...register('priority')} className="sc-input">
              <option value="LOW">Low</option>
              <option value="MEDIUM">Medium</option>
              <option value="HIGH">High</option>
              <option value="URGENT">Urgent</option>
            </select>
          </div>
          <div>
            <label htmlFor="category" className="form-label">Category</label>
            <select id="category" {...register('category')} className="sc-input">
              <option value="">Select…</option>
              <option value="BILLING">Billing</option>
              <option value="TECHNICAL">Technical</option>
              <option value="BOOKING_ISSUE">Booking Issue</option>
              <option value="OTHER">Other</option>
            </select>
          </div>
        </div>
        <button type="submit" disabled={mutation.isPending} className="sc-btn-primary text-sm w-full flex items-center justify-center gap-2">
          <Send className="w-4 h-4" /> {mutation.isPending ? 'Submitting…' : 'Submit Ticket'}
        </button>
      </form>

      <button onClick={() => navigate('/customer/support/tickets')} className="sc-btn-outline text-sm w-full">View My Tickets</button>
    </div>
  )
}
