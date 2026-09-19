import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { toast } from 'sonner'
import { Building2, Mail, Phone, MapPin, FileText, Check, X, Edit2, Globe } from 'lucide-react'
import { providerApi } from '@/api/provider'
import { createProviderSchema, type CreateProviderFormValues } from '@/utils/validators'
import { LoadingState, ErrorState } from '@/components/shared/UxStates'
import { Avatar } from '@/components/shared/Avatar'
import { useAuthStore } from '@/store/authStore'

export default function ProviderProfile() {
  const qc = useQueryClient()
  const user = useAuthStore((s) => s.user)

  const { data: provider, isLoading, error } = useQuery({
    queryKey: ['provider', 'me'],
    queryFn: () => providerApi.getMe(),
    select: (r) => r.data,
  })

  const { register, handleSubmit, formState: { errors, isDirty }, reset } = useForm<CreateProviderFormValues>({
    resolver: zodResolver(createProviderSchema),
    values: provider ? {
      businessName: provider.businessName,
      description: provider.description ?? '',
      phone: provider.phone ?? '',
      email: provider.email ?? '',
      address: provider.address ?? '',
      city: provider.city ?? '',
      state: provider.state ?? '',
      postalCode: provider.postalCode ?? '',
    } : undefined,
  })

  const mutation = useMutation({
    mutationFn: (data: CreateProviderFormValues) => providerApi.update(provider!.id, data),
    onSuccess: () => {
      toast.success('Business profile updated')
      qc.invalidateQueries({ queryKey: ['provider', 'me'] })
    },
    onError: () => toast.error('Failed to update profile'),
  })

  if (isLoading) return <LoadingState message="Loading business profile…" />
  if (error) return (
    <ErrorState
      message="Failed to load profile."
      action={{ label: 'Retry', onClick: () => qc.invalidateQueries({ queryKey: ['provider', 'me'] }) }}
    />
  )

  const businessName = provider?.businessName ?? 'Provider'

  return (
    <div className="max-w-2xl space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-slate-900">Business Profile</h1>
        <p className="text-sm text-slate-500 mt-1">Manage your business information visible to customers</p>
      </div>

      {/* Profile header card */}
      <div className="sc-card overflow-hidden">
        {/* Gradient banner */}
        <div className="h-24 bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-500 relative">
          <div className="absolute inset-0 opacity-10 bg-[url('data:image/svg+xml,%3Csvg width=40 height=40 viewBox=0 0 40 40 xmlns=http://www.w3.org/2000/svg%3E%3Cg fill=none fill-rule=evenodd%3E%3Cg fill=%23ffffff fill-opacity=0.6%3E%3Cpath d=M0 38.59l2.83-2.83 1.41 1.41L1.41 40H0v-1.41zM0 1.4l2.83 2.83 1.41-1.41L1.41 0H0v1.41zM38.59 40l-2.83-2.83 1.41-1.41L40 38.59V40h-1.41zM40 1.41l-2.83 2.83-1.41-1.41L38.59 0H40v1.41z/%3E%3C/g%3E%3C/g%3E%3C/svg%3E')]" />
        </div>

        <div className="px-6 pb-6">
          <div className="flex items-end gap-4 -mt-10 mb-5">
            <div className="relative">
              <Avatar name={businessName} size="xl" className="border-4 border-white shadow-lg" />
              <button
                className="absolute bottom-0 right-0 w-7 h-7 rounded-full bg-indigo-600 border-2 border-white flex items-center justify-center shadow-md hover:bg-indigo-700 transition-colors"
                title="Change business logo"
                onClick={() => toast.info('Logo upload coming soon!')}
              >
                <Edit2 className="w-3 h-3 text-white" />
              </button>
            </div>
            <div className="mb-1">
              <h2 className="text-lg font-bold text-slate-900">{businessName}</h2>
              <p className="text-sm text-slate-500">
                {provider?.city && provider?.state
                  ? `${provider.city}, ${provider.state}`
                  : 'Provider Partner'}
              </p>
            </div>

            {/* Status badge */}
            {provider?.status && (
              <div className="ml-auto mb-1">
                <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold ${
                  provider.status === 'APPROVED'
                    ? 'bg-green-100 text-green-700 border border-green-200'
                    : provider.status === 'PENDING'
                    ? 'bg-amber-100 text-amber-700 border border-amber-200'
                    : 'bg-slate-100 text-slate-600 border border-slate-200'
                }`}>
                  <span className={`w-1.5 h-1.5 rounded-full ${
                    provider.status === 'APPROVED' ? 'bg-green-500' :
                    provider.status === 'PENDING' ? 'bg-amber-500 animate-pulse' : 'bg-slate-400'
                  }`} />
                  {provider.status}
                </span>
              </div>
            )}
          </div>

          {/* Quick info pills */}
          <div className="flex flex-wrap gap-2">
            {user?.email && (
              <span className="flex items-center gap-1.5 text-xs text-slate-600 bg-slate-50 border border-slate-100 rounded-full px-2.5 py-1">
                <Mail className="w-3 h-3 text-slate-400" />
                {user.email}
              </span>
            )}
            {provider?.city && (
              <span className="flex items-center gap-1.5 text-xs text-slate-600 bg-slate-50 border border-slate-100 rounded-full px-2.5 py-1">
                <MapPin className="w-3 h-3 text-slate-400" />
                {provider.city}
              </span>
            )}
            {provider?.phone && (
              <span className="flex items-center gap-1.5 text-xs text-slate-600 bg-slate-50 border border-slate-100 rounded-full px-2.5 py-1">
                <Phone className="w-3 h-3 text-slate-400" />
                {provider.phone}
              </span>
            )}
          </div>
        </div>
      </div>

      {/* Edit form */}
      <div className="sc-card overflow-hidden">
        <div className="px-6 py-4 border-b border-slate-100">
          <div className="flex items-center gap-2.5">
            <Building2 className="w-4 h-4 text-slate-600" />
            <h2 className="text-sm font-semibold text-slate-800">Business Information</h2>
          </div>
        </div>

        <form onSubmit={handleSubmit((d) => mutation.mutate(d))} className="p-6 space-y-5">
          {/* Business name */}
          <div>
            <label className="form-label">Business Name</label>
            <div className="relative">
              <Building2 className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
              <input {...register('businessName')} className="sc-input pl-10" placeholder="Your business name" />
            </div>
            {errors.businessName && <p className="form-error">{errors.businessName.message}</p>}
          </div>

          {/* Description */}
          <div>
            <label className="form-label">
              <span className="flex items-center gap-1.5">
                <FileText className="w-3.5 h-3.5 text-slate-400" />
                Business Description
              </span>
            </label>
            <textarea
              {...register('description')}
              className="sc-input min-h-[100px] resize-none"
              placeholder="Describe your services, experience, and what makes you unique…"
            />
          </div>

          {/* Contact info */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="form-label">Phone</label>
              <div className="relative">
                <Phone className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                <input {...register('phone')} className="sc-input pl-10" placeholder="+91 XXXXX XXXXX" />
              </div>
            </div>
            <div>
              <label className="form-label">Business Email</label>
              <div className="relative">
                <Globe className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                <input {...register('email')} type="email" className="sc-input pl-10" placeholder="business@example.com" />
              </div>
            </div>
          </div>

          {/* Location */}
          <div className="pt-2 border-t border-slate-100">
            <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-3 flex items-center gap-1.5">
              <MapPin className="w-3.5 h-3.5" />
              Service Location
            </p>
            <div className="space-y-3">
              <div>
                <label className="form-label">Street Address</label>
                <input {...register('address')} className="sc-input" placeholder="123 Main Street" />
              </div>
              <div className="grid grid-cols-3 gap-3">
                <div>
                  <label className="form-label">City</label>
                  <input {...register('city')} className="sc-input" placeholder="Mumbai" />
                </div>
                <div>
                  <label className="form-label">State</label>
                  <input {...register('state')} className="sc-input" placeholder="MH" />
                </div>
                <div>
                  <label className="form-label">Postal Code</label>
                  <input {...register('postalCode')} className="sc-input" placeholder="400001" />
                </div>
              </div>
            </div>
          </div>

          <div className="flex justify-end gap-3 pt-2 border-t border-slate-100">
            <button type="button" onClick={() => reset()} disabled={!isDirty} className="sc-btn-outline text-sm">
              <X className="w-4 h-4" />
              Cancel
            </button>
            <button type="submit" disabled={!isDirty || mutation.isPending} className="sc-btn-primary text-sm">
              {mutation.isPending ? (
                <>
                  <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  Saving…
                </>
              ) : (
                <>
                  <Check className="w-4 h-4" />
                  Save Changes
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
