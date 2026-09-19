import { useState } from 'react'
import { useParams, Link } from 'react-router-dom'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { toast } from 'sonner'
import {
  ArrowLeft, CheckCircle2, XCircle, Ban, ShieldCheck,
  Mail, Phone, MapPin, Calendar, FileText
} from 'lucide-react'
import { adminProviderApi } from '@/api/provider'
import { ProviderStatusBadge } from '@/components/shared/StatusBadge'
import { Avatar } from '@/components/shared/Avatar'
import { ConfirmationDialog } from '@/components/shared/ConfirmationDialog'
import { LoadingState, ErrorState } from '@/components/shared/UxStates'
import { formatDateTime } from '@/utils/formatters'
import type { ProviderStatus } from '@/types'

export default function AdminProviderDetail() {
  const { id } = useParams<{ id: string }>()
  const qc = useQueryClient()
  const providerId = Number(id)

  const [confirmDialog, setConfirmDialog] = useState<{
    isOpen: boolean
    status: ProviderStatus | null
    title: string
    message: string
    variant: 'danger' | 'warning' | 'primary'
  }>({
    isOpen: false,
    status: null,
    title: '',
    message: '',
    variant: 'danger',
  })

  const { data: provider, isLoading, error } = useQuery({
    queryKey: ['admin', 'provider', providerId],
    queryFn: () => adminProviderApi.getById(providerId),
    select: (r) => r.data,
    enabled: !isNaN(providerId),
  })

  const statusMutation = useMutation({
    mutationFn: (status: ProviderStatus) => adminProviderApi.updateStatus(providerId, { status }),
    onSuccess: (_, status) => {
      toast.success(`Provider status successfully updated to ${status.toLowerCase()}`)
      setConfirmDialog((s) => ({ ...s, isOpen: false }))
      qc.invalidateQueries({ queryKey: ['admin', 'provider', providerId] })
      qc.invalidateQueries({ queryKey: ['admin', 'providers'] })
    },
    onError: () => toast.error('Failed to update provider status'),
  })

  if (isLoading) return <div className="max-w-3xl py-8"><LoadingState message="Loading provider record..." /></div>
  if (error || !provider) return <div className="max-w-3xl py-8"><ErrorState message="Provider record not found." /></div>

  const handleStatusClick = (status: ProviderStatus) => {
    let title = ''
    let message = ''
    let variant: 'danger' | 'warning' | 'primary' = 'primary'

    if (status === 'APPROVED') {
      title = 'Approve Service Partner'
      message = 'Are you sure you want to approve this provider? They will become immediately visible in public discovery and eligible for customer bookings.'
      variant = 'primary'
    } else if (status === 'REJECTED') {
      title = 'Reject Application'
      message = 'Are you sure you want to reject this provider application? They will be informed that verification criteria were not met.'
      variant = 'danger'
    } else if (status === 'SUSPENDED') {
      title = 'Suspend Provider Account'
      message = 'Are you sure you want to suspend this partner account? Their active services will be hidden from search until re-approved.'
      variant = 'danger'
    }

    setConfirmDialog({
      isOpen: true,
      status,
      title,
      message,
      variant,
    })
  }

  return (
    <div className="max-w-3xl space-y-6">
      <Link
        to="/admin/providers"
        className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-500 hover:text-blue-600 transition-colors"
      >
        <ArrowLeft className="w-4 h-4" /> Back to Providers List
      </Link>

      {/* Header Profile Card */}
      <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200/80 shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-6">
        <div className="flex items-start gap-4">
          <Avatar name={provider.businessName} size="xl" />
          <div className="space-y-1">
            <div className="flex items-center gap-2.5 flex-wrap">
              <h1 className="text-2xl font-extrabold text-slate-900 tracking-tight">
                {provider.businessName}
              </h1>
              <ProviderStatusBadge status={provider.status} />
            </div>
            <p className="text-xs text-slate-400">
              Provider ID: #{provider.id} · Auth User ID: #{provider.userId}
            </p>
          </div>
        </div>

        {/* Verification action buttons */}
        <div className="flex items-center gap-2 flex-wrap">
          {provider.status === 'PENDING' && (
            <>
              <button
                onClick={() => handleStatusClick('APPROVED')}
                className="px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold shadow-sm flex items-center gap-1.5 transition-all"
              >
                <CheckCircle2 className="w-4 h-4" /> Approve Partner
              </button>
              <button
                onClick={() => handleStatusClick('REJECTED')}
                className="px-4 py-2 rounded-xl border border-rose-200 text-rose-600 hover:bg-rose-50 text-xs font-semibold transition-all flex items-center gap-1.5"
              >
                <XCircle className="w-4 h-4" /> Reject
              </button>
            </>
          )}

          {provider.status === 'APPROVED' && (
            <button
              onClick={() => handleStatusClick('SUSPENDED')}
              className="px-4 py-2 rounded-xl border border-rose-200 text-rose-600 hover:bg-rose-50 text-xs font-semibold transition-all flex items-center gap-1.5"
            >
              <Ban className="w-4 h-4" /> Suspend Partner
            </button>
          )}

          {(provider.status === 'REJECTED' || provider.status === 'SUSPENDED') && (
            <button
              onClick={() => handleStatusClick('APPROVED')}
              className="px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold shadow-sm flex items-center gap-1.5 transition-all"
            >
              <CheckCircle2 className="w-4 h-4" /> Re-Approve Partner
            </button>
          )}
        </div>
      </div>

      {/* Information Specification */}
      <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200/80 shadow-sm space-y-6">
        <div className="flex items-center gap-2 border-b border-slate-100 pb-4">
          <FileText className="w-5 h-5 text-blue-600" />
          <h2 className="text-base font-bold text-slate-900">Application Information</h2>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-5 text-sm">
          <div className="space-y-1">
            <span className="text-xs font-medium text-slate-400">Business Email</span>
            <p className="font-semibold text-slate-800 flex items-center gap-1.5">
              <Mail className="w-4 h-4 text-slate-400" />
              <span>{provider.email || '—'}</span>
            </p>
          </div>

          <div className="space-y-1">
            <span className="text-xs font-medium text-slate-400">Contact Telephone</span>
            <p className="font-semibold text-slate-800 flex items-center gap-1.5">
              <Phone className="w-4 h-4 text-slate-400" />
              <span>{provider.phone || '—'}</span>
            </p>
          </div>

          <div className="space-y-1">
            <span className="text-xs font-medium text-slate-400">City & State</span>
            <p className="font-semibold text-slate-800 flex items-center gap-1.5">
              <MapPin className="w-4 h-4 text-slate-400" />
              <span>{[provider.city, provider.state].filter(Boolean).join(', ') || '—'}</span>
            </p>
          </div>

          <div className="space-y-1">
            <span className="text-xs font-medium text-slate-400">Application Date</span>
            <p className="font-semibold text-slate-800 flex items-center gap-1.5">
              <Calendar className="w-4 h-4 text-slate-400" />
              <span>{formatDateTime(provider.createdAt)}</span>
            </p>
          </div>

          {provider.address && (
            <div className="col-span-full space-y-1 pt-2 border-t border-slate-100">
              <span className="text-xs font-medium text-slate-400">Full Business Address</span>
              <p className="font-medium text-slate-800">{provider.address}</p>
            </div>
          )}

          {provider.description && (
            <div className="col-span-full space-y-1 pt-2 border-t border-slate-100">
              <span className="text-xs font-medium text-slate-400">Business Description & Pitch</span>
              <p className="p-3.5 rounded-2xl bg-slate-50 border border-slate-100 text-slate-700 leading-relaxed text-xs sm:text-sm">
                {provider.description}
              </p>
            </div>
          )}
        </div>
      </div>

      {/* Confirmation Dialog */}
      <ConfirmationDialog
        isOpen={confirmDialog.isOpen}
        onClose={() => setConfirmDialog((s) => ({ ...s, isOpen: false }))}
        onConfirm={() => confirmDialog.status && statusMutation.mutate(confirmDialog.status)}
        isLoading={statusMutation.isPending}
        title={confirmDialog.title}
        message={confirmDialog.message}
        confirmLabel={`Yes, ${confirmDialog.status || 'Proceed'}`}
        cancelLabel="Cancel"
        variant={confirmDialog.variant}
      />
    </div>
  )
}
