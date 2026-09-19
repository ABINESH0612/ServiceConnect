import { useState } from 'react'
import { useQuery, useMutation } from '@tanstack/react-query'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { toast } from 'sonner'
import { Shield, Key, LogOut, Eye, EyeOff, CheckCircle2, XCircle, MonitorSmartphone, Lock } from 'lucide-react'
import { authApi } from '@/api/auth'
import { useAuthStore } from '@/store/authStore'
import { changePasswordSchema, type ChangePasswordFormValues } from '@/utils/validators'
import { LoadingState, ErrorState } from '@/components/shared/UxStates'
import { formatRelative } from '@/utils/formatters'

function PasswordInput({
  id,
  placeholder,
  ...props
}: React.InputHTMLAttributes<HTMLInputElement> & { id: string }) {
  const [visible, setVisible] = useState(false)
  return (
    <div className="relative">
      <input
        id={id}
        type={visible ? 'text' : 'password'}
        placeholder={placeholder || '••••••••'}
        className="sc-input pr-10"
        {...props}
      />
      <button
        type="button"
        onClick={() => setVisible(v => !v)}
        className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
        tabIndex={-1}
      >
        {visible ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
      </button>
    </div>
  )
}

export default function CustomerSecurity() {
  const { data: security, isLoading, error } = useQuery({
    queryKey: ['auth', 'security'],
    queryFn: () => authApi.getSecurityInfo(),
    select: (res) => res.data,
  })

  const { register, handleSubmit, formState: { errors }, reset } = useForm<ChangePasswordFormValues>({
    resolver: zodResolver(changePasswordSchema),
  })

  const changePwMutation = useMutation({
    mutationFn: (data: ChangePasswordFormValues) =>
      authApi.changePassword({ currentPassword: data.currentPassword, newPassword: data.newPassword }),
    onSuccess: () => { toast.success('Password changed successfully'); reset() },
    onError: () => toast.error('Failed to change password. Check your current password.'),
  })

  const logoutAllMutation = useMutation({
    mutationFn: () => authApi.logoutAll(),
    onSuccess: () => { toast.success('All sessions logged out'); useAuthStore.getState().clearAuth() },
    onError: () => toast.error('Failed to logout all sessions'),
  })

  if (isLoading) return <LoadingState message="Loading security info…" />
  if (error) return <ErrorState message="Failed to load security info." />

  const securityItems = [
    {
      label: 'Email Verified',
      value: security?.emailVerified,
      ok: security?.emailVerified,
    },
    {
      label: 'Phone Verified',
      value: security?.phoneVerified,
      ok: security?.phoneVerified,
    },
    {
      label: 'Two-Factor Auth',
      value: security?.twoFactorEnabled ? 'Enabled' : 'Disabled',
      ok: security?.twoFactorEnabled,
    },
  ]

  return (
    <div className="max-w-2xl space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-slate-900">Security & Privacy</h1>
        <p className="text-sm text-slate-500 mt-1">Manage your account security and active sessions</p>
      </div>

      {/* Security overview */}
      <div className="sc-card overflow-hidden">
        <div className="px-6 py-4 border-b border-slate-100">
          <div className="flex items-center gap-2.5">
            <Shield className="w-4 h-4 text-slate-600" />
            <h2 className="text-sm font-semibold text-slate-800">Account Security Status</h2>
          </div>
        </div>
        <div className="p-6">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            {securityItems.map(item => (
              <div
                key={item.label}
                className={`rounded-xl border p-4 flex flex-col gap-2 ${
                  item.ok
                    ? 'bg-green-50 border-green-100'
                    : 'bg-red-50 border-red-100'
                }`}
              >
                {item.ok ? (
                  <CheckCircle2 className="w-5 h-5 text-green-600" />
                ) : (
                  <XCircle className="w-5 h-5 text-red-500" />
                )}
                <div>
                  <p className="text-xs font-semibold text-slate-700">{item.label}</p>
                  <p className={`text-sm font-bold ${item.ok ? 'text-green-700' : 'text-red-600'}`}>
                    {typeof item.value === 'boolean' ? (item.value ? 'Verified ✓' : 'Not verified') : item.value}
                  </p>
                </div>
              </div>
            ))}
          </div>

          {security?.lastLoginAt && (
            <div className="mt-4 pt-4 border-t border-slate-100 flex items-center gap-2 text-xs text-slate-500">
              <Lock className="w-3.5 h-3.5" />
              Last login: <span className="font-medium text-slate-700">{formatRelative(security.lastLoginAt)}</span>
            </div>
          )}

          {security?.activeSessions !== undefined && (
            <div className="mt-2 flex items-center gap-2 text-xs text-slate-500">
              <MonitorSmartphone className="w-3.5 h-3.5" />
              Active sessions: <span className="font-medium text-slate-700">{security.activeSessions}</span>
            </div>
          )}
        </div>
      </div>

      {/* Change password */}
      <div className="sc-card overflow-hidden">
        <div className="px-6 py-4 border-b border-slate-100">
          <div className="flex items-center gap-2.5">
            <Key className="w-4 h-4 text-slate-600" />
            <h2 className="text-sm font-semibold text-slate-800">Change Password</h2>
          </div>
        </div>
        <form onSubmit={handleSubmit((d) => changePwMutation.mutate(d))} className="p-6 space-y-4">
          <div>
            <label htmlFor="currentPassword" className="form-label">Current Password</label>
            <PasswordInput id="currentPassword" {...register('currentPassword')} />
            {errors.currentPassword && <p className="form-error">{errors.currentPassword.message}</p>}
          </div>
          <div>
            <label htmlFor="newPassword" className="form-label">New Password</label>
            <PasswordInput id="newPassword" {...register('newPassword')} placeholder="Min. 8 characters" />
            {errors.newPassword && <p className="form-error">{errors.newPassword.message}</p>}
          </div>
          <div>
            <label htmlFor="confirmPassword" className="form-label">Confirm New Password</label>
            <PasswordInput id="confirmPassword" {...register('confirmPassword')} />
            {errors.confirmPassword && <p className="form-error">{errors.confirmPassword.message}</p>}
          </div>

          <div className="flex justify-end pt-2">
            <button
              type="submit"
              disabled={changePwMutation.isPending}
              className="sc-btn-primary text-sm"
            >
              {changePwMutation.isPending ? (
                <>
                  <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  Changing…
                </>
              ) : (
                <>
                  <Key className="w-4 h-4" />
                  Update Password
                </>
              )}
            </button>
          </div>
        </form>
      </div>

      {/* Sessions / Danger zone */}
      <div className="sc-card overflow-hidden border-rose-100">
        <div className="px-6 py-4 border-b border-rose-100 bg-rose-50/50">
          <div className="flex items-center gap-2.5">
            <LogOut className="w-4 h-4 text-rose-600" />
            <h2 className="text-sm font-semibold text-rose-700">Active Sessions</h2>
          </div>
        </div>
        <div className="p-6">
          <div className="flex items-start justify-between gap-6">
            <div>
              <p className="text-sm font-medium text-slate-800 mb-1">Sign out of all devices</p>
              <p className="text-xs text-slate-500 leading-relaxed">
                This will immediately end all active sessions across all devices. You'll need to log in again on each device.
              </p>
            </div>
            <button
              onClick={() => {
                if (confirm('Are you sure you want to logout all sessions?')) {
                  logoutAllMutation.mutate()
                }
              }}
              disabled={logoutAllMutation.isPending}
              className="flex-shrink-0 inline-flex items-center gap-2 bg-rose-500 hover:bg-rose-600 text-white font-semibold rounded-full px-4 py-2 text-sm transition-colors disabled:opacity-50"
            >
              <LogOut className="w-4 h-4" />
              {logoutAllMutation.isPending ? 'Logging out…' : 'Logout All'}
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
