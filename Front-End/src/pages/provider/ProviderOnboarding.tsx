import { useNavigate } from 'react-router-dom'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { toast } from 'sonner'
import { Building2 } from 'lucide-react'
import { providerApi } from '@/api/provider'
import { createProviderSchema, type CreateProviderFormValues } from '@/utils/validators'
import { LoadingState } from '@/components/shared/UxStates'

export default function ProviderOnboarding() {
  const navigate = useNavigate()
  const qc = useQueryClient()

  const { isLoading } = useQuery({
    queryKey: ['provider', 'onboarding'],
    queryFn: () => providerApi.getOnboardingStatus(),
    select: (r) => r.data,
  })

  const { register, handleSubmit, formState: { errors } } = useForm<CreateProviderFormValues>({
    resolver: zodResolver(createProviderSchema),
  })

  const mutation = useMutation({
    mutationFn: (data: CreateProviderFormValues) => providerApi.create(data),
    onSuccess: () => {
      toast.success('Provider profile created! Pending admin approval.')
      qc.invalidateQueries({ queryKey: ['provider'] })
      navigate('/provider/dashboard')
    },
    onError: () => toast.error('Failed to create provider profile'),
  })

  if (isLoading) return <LoadingState message="Checking onboarding status…" />

  return (
    <div className="max-w-2xl space-y-6">
      <div className="flex items-center gap-3">
        <div className="w-10 h-10 rounded-[8px] bg-[#EFF6FF] flex items-center justify-center">
          <Building2 className="w-5 h-5 text-[#2563EB]" />
        </div>
        <div>
          <h1 className="text-2xl font-bold text-[#0F172A]">Provider Onboarding</h1>
          <p className="text-sm text-[#64748B]">Set up your business profile to get started.</p>
        </div>
      </div>

      {/* Steps */}
      <div className="sc-card p-6">
        <h2 className="text-base font-semibold text-[#0F172A] mb-4">Setup Steps</h2>
        <div className="space-y-3">
          {['Business Profile', 'Set Availability', 'Add Services', 'Upload Photos'].map((step, i) => (
            <div key={step} className="flex items-center gap-3">
              <div className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold ${i === 0 ? 'bg-[#2563EB] text-white' : 'bg-[#E2E8F0] text-[#64748B]'}`}>
                {i + 1}
              </div>
              <span className="text-sm text-[#0F172A]">{step}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Profile form */}
      <form onSubmit={handleSubmit((d) => mutation.mutate(d))} className="sc-card p-6 space-y-4">
        <h2 className="text-base font-semibold text-[#0F172A]">Business Information</h2>
        <div>
          <label className="form-label">Business Name</label>
          <input {...register('businessName')} className="sc-input" placeholder="Your business name" />
          {errors.businessName && <p className="form-error">{errors.businessName.message}</p>}
        </div>
        <div>
          <label className="form-label">Description</label>
          <textarea {...register('description')} className="sc-input min-h-[80px]" placeholder="Tell customers about your business" />
        </div>
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="form-label">Phone</label>
            <input {...register('phone')} className="sc-input" />
            {errors.phone && <p className="form-error">{errors.phone.message}</p>}
          </div>
          <div>
            <label className="form-label">Email</label>
            <input {...register('email')} type="email" className="sc-input" />
            {errors.email && <p className="form-error">{errors.email.message}</p>}
          </div>
        </div>
        <div>
          <label className="form-label">Address</label>
          <input {...register('address')} className="sc-input" />
          {errors.address && <p className="form-error">{errors.address.message}</p>}
        </div>
        <div className="grid grid-cols-3 gap-4">
          <div>
            <label className="form-label">City</label>
            <input {...register('city')} className="sc-input" />
            {errors.city && <p className="form-error">{errors.city.message}</p>}
          </div>
          <div>
            <label className="form-label">State</label>
            <input {...register('state')} className="sc-input" />
            {errors.state && <p className="form-error">{errors.state.message}</p>}
          </div>
          <div>
            <label className="form-label">Postal Code</label>
            <input {...register('postalCode')} className="sc-input" />
            {errors.postalCode && <p className="form-error">{errors.postalCode.message}</p>}
          </div>
        </div>
        <button type="submit" disabled={mutation.isPending} className="sc-btn-primary text-sm w-full">
          {mutation.isPending ? 'Creating…' : 'Create Business Profile'}
        </button>
      </form>
    </div>
  )
}
