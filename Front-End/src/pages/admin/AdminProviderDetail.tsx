import { useParams, Link } from 'react-router-dom'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { toast } from 'sonner'
import { ArrowLeft, CheckCircle2, XCircle, Ban } from 'lucide-react'
import { adminProviderApi } from '@/api/provider'
import { ProviderStatusBadge } from '@/components/shared/StatusBadge'
import { LoadingState, ErrorState } from '@/components/shared/UxStates'
import { formatDateTime } from '@/utils/formatters'
import type { ProviderStatus } from '@/types'

export default function AdminProviderDetail() {
  const { id } = useParams<{ id: string }>()
  const qc = useQueryClient()
  const providerId = Number(id)

  const { data: provider, isLoading, error } = useQuery({
    queryKey: ['admin', 'provider', providerId],
    queryFn: () => adminProviderApi.getById(providerId),
    select: (r) => r.data,
    enabled: !isNaN(providerId),
  })

  const statusMutation = useMutation({
    mutationFn: (status: ProviderStatus) => adminProviderApi.updateStatus(providerId, { status }),
    onSuccess: (_, status) => {
      toast.success(`Provider ${status.toLowerCase()}`)
      qc.invalidateQueries({ queryKey: ['admin', 'provider', providerId] })
      qc.invalidateQueries({ queryKey: ['admin', 'providers'] })
    },
    onError: () => toast.error('Failed to update status'),
  })

  if (isLoading) return <LoadingState />
  if (error || !provider) return <ErrorState message="Provider not found." />

  return (
    <div className="max-w-2xl space-y-6">
      <Link to="/admin/providers" className="inline-flex items-center gap-1 text-sm text-[#64748B] hover:text-[#2563EB]"><ArrowLeft className="w-4 h-4" /> Back</Link>
      <div className="flex items-center justify-between">
        <h1 className="text-xl font-bold">{provider.businessName}</h1>
        <ProviderStatusBadge status={provider.status} />
      </div>
      <div className="sc-card p-6 space-y-3 text-sm">
        <div className="grid grid-cols-2 gap-4">
          <div><p className="text-[#64748B]">Email</p><p className="font-medium">{provider.email}</p></div>
          <div><p className="text-[#64748B]">Phone</p><p className="font-medium">{provider.phone}</p></div>
          <div><p className="text-[#64748B]">Location</p><p className="font-medium">{[provider.city, provider.state].filter(Boolean).join(', ') || '—'}</p></div>
          <div><p className="text-[#64748B]">Address</p><p className="font-medium">{provider.address || '—'}</p></div>
          <div><p className="text-[#64748B]">Created</p><p className="font-medium">{formatDateTime(provider.createdAt)}</p></div>
        </div>
        {provider.description && <div className="pt-3 border-t border-[#E2E8F0]"><p className="text-[#64748B] text-xs mb-1">Description</p><p>{provider.description}</p></div>}
      </div>
      <div className="flex gap-3">
        {provider.status === 'PENDING' && (
          <>
            <button onClick={() => statusMutation.mutate('APPROVED')} disabled={statusMutation.isPending} className="sc-btn-primary text-sm gap-1"><CheckCircle2 className="w-4 h-4" /> Approve</button>
            <button onClick={() => statusMutation.mutate('REJECTED')} disabled={statusMutation.isPending} className="sc-btn-danger text-sm gap-1"><XCircle className="w-4 h-4" /> Reject</button>
          </>
        )}
        {provider.status === 'APPROVED' && (
          <button onClick={() => { if (confirm('Suspend this provider?')) statusMutation.mutate('SUSPENDED') }} disabled={statusMutation.isPending} className="sc-btn-danger text-sm gap-1"><Ban className="w-4 h-4" /> Suspend</button>
        )}
        {(provider.status === 'REJECTED' || provider.status === 'SUSPENDED') && (
          <button onClick={() => statusMutation.mutate('APPROVED')} disabled={statusMutation.isPending} className="sc-btn-primary text-sm gap-1"><CheckCircle2 className="w-4 h-4" /> Re-approve</button>
        )}
      </div>
    </div>
  )
}
