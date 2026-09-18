import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { toast } from 'sonner'
import { userApi } from '@/api/user'
import { updateProfileSchema, type UpdateProfileFormValues } from '@/utils/validators'
import { LoadingState, ErrorState } from '@/components/shared/UxStates'

export default function CustomerProfile() {
  const qc = useQueryClient()

  const { data: profile, isLoading, error } = useQuery({
    queryKey: ['user', 'profile'],
    queryFn: () => userApi.getMyProfile(),
    select: (res) => res.data,
  })

  const { register, handleSubmit, formState: { errors, isDirty }, reset } = useForm<UpdateProfileFormValues>({
    resolver: zodResolver(updateProfileSchema),
    values: profile ? { firstName: profile.firstName, lastName: profile.lastName, phone: profile.phone ?? '' } : undefined,
  })

  const mutation = useMutation({
    mutationFn: (data: UpdateProfileFormValues) => userApi.updateMyProfile(data),
    onSuccess: () => {
      toast.success('Profile updated successfully')
      qc.invalidateQueries({ queryKey: ['user', 'profile'] })
    },
    onError: () => toast.error('Failed to update profile'),
  })

  if (isLoading) return <LoadingState message="Loading profile…" />
  if (error) return <ErrorState message="Failed to load profile." action={{ label: 'Retry', onClick: () => qc.invalidateQueries({ queryKey: ['user', 'profile'] }) }} />

  return (
    <div className="max-w-2xl">
      <h1 className="text-2xl font-bold text-[#0F172A] mb-6">Profile</h1>
      <form onSubmit={handleSubmit((data) => mutation.mutate(data))} className="sc-card p-6 space-y-5">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label htmlFor="firstName" className="form-label">First Name</label>
            <input id="firstName" {...register('firstName')} className="sc-input" />
            {errors.firstName && <p className="form-error">{errors.firstName.message}</p>}
          </div>
          <div>
            <label htmlFor="lastName" className="form-label">Last Name</label>
            <input id="lastName" {...register('lastName')} className="sc-input" />
            {errors.lastName && <p className="form-error">{errors.lastName.message}</p>}
          </div>
        </div>
        <div>
          <label htmlFor="phone" className="form-label">Phone</label>
          <input id="phone" {...register('phone')} className="sc-input" placeholder="+91 XXXXX XXXXX" />
          {errors.phone && <p className="form-error">{errors.phone.message}</p>}
        </div>
        <div className="flex justify-end gap-3 pt-2">
          <button type="button" onClick={() => reset()} disabled={!isDirty} className="sc-btn-outline text-sm">Cancel</button>
          <button type="submit" disabled={!isDirty || mutation.isPending} className="sc-btn-primary text-sm">
            {mutation.isPending ? 'Saving…' : 'Save Changes'}
          </button>
        </div>
      </form>
    </div>
  )
}
