import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { toast } from 'sonner'
import { providerApi } from '@/api/provider'
import { createProviderSchema, type CreateProviderFormValues } from '@/utils/validators'
import { LoadingState, ErrorState } from '@/components/shared/UxStates'

export default function ProviderProfile() {
  const qc = useQueryClient()
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
    onSuccess: () => { toast.success('Profile updated'); qc.invalidateQueries({ queryKey: ['provider', 'me'] }) },
    onError: () => toast.error('Failed to update profile'),
  })

  if (isLoading) return <LoadingState />
  if (error) return <ErrorState message="Failed to load profile." />

  return (
    <div className="max-w-2xl">
      <h1 className="text-2xl font-bold text-[#0F172A] mb-6">Business Profile</h1>
      <form onSubmit={handleSubmit((d) => mutation.mutate(d))} className="sc-card p-6 space-y-4">
        <div><label className="form-label">Business Name</label><input {...register('businessName')} className="sc-input" />{errors.businessName && <p className="form-error">{errors.businessName.message}</p>}</div>
        <div><label className="form-label">Description</label><textarea {...register('description')} className="sc-input min-h-[80px]" /></div>
        <div className="grid grid-cols-2 gap-4">
          <div><label className="form-label">Phone</label><input {...register('phone')} className="sc-input" /></div>
          <div><label className="form-label">Email</label><input {...register('email')} type="email" className="sc-input" /></div>
        </div>
        <div><label className="form-label">Address</label><input {...register('address')} className="sc-input" /></div>
        <div className="grid grid-cols-3 gap-4">
          <div><label className="form-label">City</label><input {...register('city')} className="sc-input" /></div>
          <div><label className="form-label">State</label><input {...register('state')} className="sc-input" /></div>
          <div><label className="form-label">Postal Code</label><input {...register('postalCode')} className="sc-input" /></div>
        </div>
        <div className="flex justify-end gap-3 pt-2">
          <button type="button" onClick={() => reset()} disabled={!isDirty} className="sc-btn-outline text-sm">Cancel</button>
          <button type="submit" disabled={!isDirty || mutation.isPending} className="sc-btn-primary text-sm">{mutation.isPending ? 'Saving…' : 'Save'}</button>
        </div>
      </form>
    </div>
  )
}
