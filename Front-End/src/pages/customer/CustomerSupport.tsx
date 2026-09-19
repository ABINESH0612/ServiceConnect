import { useState } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { useMutation } from '@tanstack/react-query'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { toast } from 'sonner'
import {
  Headphones,
  Send,
  HelpCircle,
  Clock,
  ShieldCheck,
  CreditCard,
  Calendar,
  AlertCircle,
  ExternalLink,
  FileText
} from 'lucide-react'
import { customerTicketApi } from '@/api/tickets'
import { createTicketSchema, type CreateTicketFormValues } from '@/utils/validators'

const FAQS = [
  {
    q: 'How do I reschedule or cancel a booking?',
    a: 'Go to your Bookings tab, choose the appointment, and click "Cancel Booking" before the technician is dispatched.',
    icon: Calendar,
  },
  {
    q: 'When am I charged for a service?',
    a: 'You are only prompted for payment once your booking is accepted or when the specialist finishes the job.',
    icon: CreditCard,
  },
  {
    q: 'Are all providers background-checked?',
    a: 'Yes! All providers on ServiceConnect go through identity, criminal, and business license verification.',
    icon: ShieldCheck,
  },
]

export default function CustomerSupport() {
  const navigate = useNavigate()
  const [selectedFaq, setSelectedFaq] = useState<number | null>(null)

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    formState: { errors },
  } = useForm<CreateTicketFormValues>({
    resolver: zodResolver(createTicketSchema),
    defaultValues: { priority: 'MEDIUM', category: 'BOOKING_ISSUE' },
  })

  const currentPriority = watch('priority')

  const mutation = useMutation({
    mutationFn: (data: CreateTicketFormValues) => customerTicketApi.create(data),
    onSuccess: (res) => {
      toast.success('Support ticket created successfully!')
      navigate(`/customer/support/tickets/${res.data.id}`)
    },
    onError: () => toast.error('Failed to create ticket. Please try again.'),
  })

  return (
    <div className="space-y-8 max-w-5xl">
      {/* Header Banner */}
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-blue-700 via-indigo-700 to-slate-900 p-6 sm:p-8 text-white shadow-xl">
        <div className="absolute -top-12 -right-12 w-64 h-64 rounded-full bg-white/10 blur-2xl pointer-events-none" />
        <div className="relative z-10 max-w-2xl space-y-2">
          <div className="flex items-center gap-2">
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-white/20 text-blue-100 backdrop-blur-md">
              <Headphones className="w-3.5 h-3.5" />
              24/7 Priority Support
            </span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-black tracking-tight text-white">
            Customer Help & Dispute Desk
          </h1>
          <p className="text-xs sm:text-sm text-blue-100/80 leading-relaxed">
            Need assistance with a booking, refund, or technician? Open a ticket below or explore our quick answers.
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Left 2 Cols: Ticket Form */}
        <div className="lg:col-span-2 space-y-6">
          <div className="bg-white rounded-3xl border border-slate-200/80 p-6 sm:p-8 shadow-sm">
            <div className="flex items-center justify-between pb-6 border-b border-slate-100 mb-6">
              <div>
                <h2 className="text-lg font-bold text-slate-900">Submit a Support Ticket</h2>
                <p className="text-xs text-slate-500 mt-0.5">Average agent response time is under 15 minutes.</p>
              </div>
              <Link
                to="/customer/support/tickets"
                className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl border border-slate-200 text-xs font-semibold text-slate-700 hover:bg-slate-50 transition-colors"
              >
                <FileText className="w-3.5 h-3.5 text-slate-400" />
                <span>My Open Tickets</span>
              </Link>
            </div>

            <form onSubmit={handleSubmit((d) => mutation.mutate(d))} className="space-y-5">
              <div>
                <label htmlFor="subject" className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                  Subject *
                </label>
                <input
                  id="subject"
                  {...register('subject')}
                  className="w-full px-4 py-2.5 rounded-xl border border-slate-200 text-sm text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-600 transition-all"
                  placeholder="e.g. Issue with technician arrival for Booking #104"
                />
                {errors.subject && <p className="text-xs text-rose-500 font-medium mt-1">{errors.subject.message}</p>}
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label htmlFor="category" className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                    Issue Category *
                  </label>
                  <select
                    id="category"
                    {...register('category')}
                    className="w-full px-4 py-2.5 rounded-xl border border-slate-200 text-sm text-slate-700 bg-white cursor-pointer focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-600"
                  >
                    <option value="BOOKING_ISSUE">Booking & Scheduling</option>
                    <option value="BILLING">Billing & Payments</option>
                    <option value="TECHNICAL">Technical Platform Error</option>
                    <option value="OTHER">General Inquiry</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                    Priority Level
                  </label>
                  <div className="grid grid-cols-3 gap-2">
                    {(['LOW', 'MEDIUM', 'URGENT'] as const).map((p) => {
                      const active = currentPriority === p
                      return (
                        <button
                          key={p}
                          type="button"
                          onClick={() => setValue('priority', p)}
                          className={`py-2 text-xs font-bold rounded-xl border transition-all ${
                            active
                              ? p === 'URGENT'
                                ? 'bg-rose-50 border-rose-400 text-rose-700 shadow-sm'
                                : 'bg-blue-50 border-blue-400 text-blue-700 shadow-sm'
                              : 'bg-white border-slate-200 text-slate-600 hover:bg-slate-50'
                          }`}
                        >
                          {p}
                        </button>
                      )
                    })}
                  </div>
                </div>
              </div>

              <div>
                <label htmlFor="description" className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                  Detailed Explanation *
                </label>
                <textarea
                  id="description"
                  {...register('description')}
                  rows={5}
                  className="w-full px-4 py-3 rounded-xl border border-slate-200 text-sm text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-600 transition-all resize-y"
                  placeholder="Please provide specifics: booking number, technician name, what happened, and how we can best resolve this for you..."
                />
                {errors.description && <p className="text-xs text-rose-500 font-medium mt-1">{errors.description.message}</p>}
              </div>

              <div className="pt-2">
                <button
                  type="submit"
                  disabled={mutation.isPending}
                  className="w-full py-3 px-6 rounded-xl bg-blue-600 hover:bg-blue-700 active:bg-blue-800 text-white font-bold text-sm shadow-md shadow-blue-500/20 transition-all flex items-center justify-center gap-2 disabled:opacity-50"
                >
                  <Send className="w-4 h-4" />
                  <span>{mutation.isPending ? 'Submitting to Dispatch…' : 'Submit Support Request'}</span>
                </button>
              </div>
            </form>
          </div>
        </div>

        {/* Right Col: Quick Self-Help FAQs */}
        <div className="space-y-6">
          <div className="bg-white rounded-3xl border border-slate-200/80 p-6 shadow-sm space-y-4">
            <div className="flex items-center gap-2">
              <HelpCircle className="w-5 h-5 text-blue-600" />
              <h3 className="font-bold text-slate-900 text-sm">Instant Answers</h3>
            </div>

            <div className="space-y-3">
              {FAQS.map((faq, idx) => {
                const Icon = faq.icon
                const isOpen = selectedFaq === idx
                return (
                  <div
                    key={idx}
                    className="border border-slate-100 rounded-2xl p-3.5 bg-slate-50/50 hover:bg-slate-50 cursor-pointer transition-colors"
                    onClick={() => setSelectedFaq(isOpen ? null : idx)}
                  >
                    <div className="flex items-start gap-2.5">
                      <Icon className="w-4 h-4 text-blue-600 mt-0.5 flex-shrink-0" />
                      <div className="flex-1">
                        <p className="text-xs font-bold text-slate-800">{faq.q}</p>
                        {isOpen && (
                          <p className="text-xs text-slate-600 mt-2 leading-relaxed bg-white p-2.5 rounded-xl border border-slate-100">
                            {faq.a}
                          </p>
                        )}
                      </div>
                    </div>
                  </div>
                )
              })}
            </div>

            <div className="pt-2">
              <Link
                to="/help-center"
                className="inline-flex items-center justify-center gap-1.5 w-full py-2.5 rounded-xl border border-slate-200 text-xs font-semibold text-slate-700 hover:bg-slate-50 transition-colors"
              >
                <span>Visit Full Knowledge Base</span>
                <ExternalLink className="w-3.5 h-3.5 text-slate-400" />
              </Link>
            </div>
          </div>

          <div className="bg-blue-50/70 border border-blue-200/60 rounded-3xl p-5 space-y-2">
            <div className="flex items-center gap-2 text-blue-800 font-bold text-xs">
              <Clock className="w-4 h-4 text-blue-600" />
              <span>Service Guarantee</span>
            </div>
            <p className="text-xs text-blue-900/80 leading-relaxed">
              Every job booked through ServiceConnect is backed by our Happiness Guarantee. If something isn’t right, our dispute team works directly with the service pro.
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}
