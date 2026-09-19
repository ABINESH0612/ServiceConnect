import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { toast } from 'sonner'
import { User, Mail, Phone, Edit2, Check, X } from 'lucide-react'
import { userApi } from '@/api/user'
import { updateProfileSchema, type UpdateProfileFormValues } from '@/utils/validators'
import { LoadingState, ErrorState } from '@/components/shared/UxStates'
import { Avatar } from '@/components/shared/Avatar'
import { useAuthStore } from '@/store/authStore'

export default function CustomerProfile() {
  const qc = useQueryClient()
  const user = useAuthStore((s) => s.user)

  const { data: profile, isLoading, error } = useQuery({
    queryKey: ['user', 'profile'],
    queryFn: () => userApi.getMyProfile(),
    select: (res) => res.data,
  })

  const { register, handleSubmit, formState: { errors, isDirty }, reset } = useForm<UpdateProfileFormValues>({
    resolver: zodResolver(updateProfileSchema),
    values: profile
      ? { firstName: profile.firstName, lastName: profile.lastName, phone: profile.phone ?? '' }
      : undefined,
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
  if (error) return (
    <ErrorState
      message="Failed to load profile."
      action={{ label: 'Retry', onClick: () => qc.invalidateQueries({ queryKey: ['user', 'profile'] }) }}
    />
  )

  const fullName = profile ? `${profile.firstName} ${profile.lastName}` : (user?.email?.split('@')[0] ?? 'Customer')

  return (
    <div className="max-w-2xl space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-slate-900">My Profile</h1>
        <p className="text-sm text-slate-500 mt-1">Manage your personal information</p>
      </div>

      {/* Profile card header */}
      <div className="sc-card overflow-hidden">
        {/* Header gradient background */}
        <div className="h-24 bg-gradient-to-r from-blue-500 via-indigo-500 to-purple-500 relative">
          <div className="absolute inset-0 opacity-20 bg-[url('data:image/svg+xml,%3Csvg width=60 height=60 viewBox=0 0 60 60 xmlns=http://www.w3.org/2000/svg%3E%3Cg fill=none fill-rule=evenodd%3E%3Cg fill=%23ffffff fill-opacity=0.4%3E%3Cpath d=M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z/%3E%3C/g%3E%3C/g%3E%3C/svg%3E')]" />
        </div>

        {/* Avatar + name row */}
        <div className="px-6 pb-6">
          <div className="flex items-end gap-4 -mt-10 mb-5">
            <div className="relative">
              <Avatar name={fullName} size="xl" className="border-4 border-white shadow-lg" />
              <button
                className="absolute bottom-0 right-0 w-7 h-7 rounded-full bg-blue-600 border-2 border-white flex items-center justify-center shadow-md hover:bg-blue-700 transition-colors"
                title="Change avatar"
                onClick={() => toast.info('Avatar upload coming soon!')}
              >
                <Edit2 className="w-3 h-3 text-white" />
              </button>
            </div>
            <div className="mb-1">
              <h2 className="text-lg font-bold text-slate-900">{fullName}</h2>
              <p className="text-sm text-slate-500">Customer Account</p>
            </div>
          </div>

          {/* Read-only info pills */}
          <div className="flex flex-wrap gap-3 mb-1">
            {user?.email && (
              <div className="flex items-center gap-2 text-xs text-slate-600 bg-slate-50 border border-slate-100 rounded-full px-3 py-1.5">
                <Mail className="w-3.5 h-3.5 text-slate-400" />
                <span>{user.email}</span>
                <span className="text-[10px] text-emerald-600 font-semibold bg-emerald-50 border border-emerald-100 rounded-full px-1.5 py-0.5">
                  Verified
                </span>
              </div>
            )}
            {profile?.phone && (
              <div className="flex items-center gap-2 text-xs text-slate-600 bg-slate-50 border border-slate-100 rounded-full px-3 py-1.5">
                <Phone className="w-3.5 h-3.5 text-slate-400" />
                <span>{profile.phone}</span>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Edit form */}
      <div className="sc-card overflow-hidden">
        <div className="px-6 py-4 border-b border-slate-100">
          <div className="flex items-center gap-2.5">
            <User className="w-4 h-4 text-slate-600" />
            <h2 className="text-sm font-semibold text-slate-800">Personal Information</h2>
          </div>
        </div>

        <form onSubmit={handleSubmit((data) => mutation.mutate(data))} className="p-6 space-y-5">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label htmlFor="firstName" className="form-label">First Name</label>
              <input id="firstName" {...register('firstName')} className="sc-input" placeholder="Your first name" />
              {errors.firstName && <p className="form-error">{errors.firstName.message}</p>}
            </div>
            <div>
              <label htmlFor="lastName" className="form-label">Last Name</label>
              <input id="lastName" {...register('lastName')} className="sc-input" placeholder="Your last name" />
              {errors.lastName && <p className="form-error">{errors.lastName.message}</p>}
            </div>
          </div>

          <div>
            <label htmlFor="phone" className="form-label">Phone Number</label>
            <input
              id="phone"
              {...register('phone')}
              className="sc-input"
              placeholder="+91 XXXXX XXXXX"
              type="tel"
            />
            {errors.phone && <p className="form-error">{errors.phone.message}</p>}
          </div>

          {/* Email — read-only */}
          <div>
            <label className="form-label">Email Address</label>
            <div className="sc-input bg-slate-50 flex items-center gap-2 cursor-not-allowed">
              <Mail className="w-4 h-4 text-slate-400 flex-shrink-0" />
              <span className="text-slate-500 text-sm">{user?.email ?? '—'}</span>
              <span className="ml-auto text-[10px] text-emerald-600 font-semibold bg-emerald-50 border border-emerald-100 rounded-full px-2 py-0.5">
                Verified
              </span>
            </div>
            <p className="text-xs text-slate-400 mt-1.5">Email address cannot be changed after registration</p>
          </div>

          <div className="flex justify-end gap-3 pt-2 border-t border-slate-100">
            <button
              type="button"
              onClick={() => reset()}
              disabled={!isDirty}
              className="sc-btn-outline text-sm"
            >
              <X className="w-4 h-4" />
              Cancel
            </button>
            <button
              type="submit"
              disabled={!isDirty || mutation.isPending}
              className="sc-btn-primary text-sm"
            >
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
