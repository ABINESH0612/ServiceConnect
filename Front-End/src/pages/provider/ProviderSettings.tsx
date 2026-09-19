import { useState } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { toast } from 'sonner'
import { useNavigate } from 'react-router-dom'
import {
  Bell, Globe, Moon, Smartphone, Mail, Shield, LogOut,
  ChevronRight, Volume2, Eye, EyeOff, Trash2
} from 'lucide-react'
import { useAuthStore } from '@/store/authStore'
import { userApi } from '@/api/user'
import { LoadingState, ErrorState } from '@/components/shared/UxStates'

function Toggle({
  checked,
  onChange,
  disabled,
}: { checked: boolean; onChange: () => void; disabled?: boolean }) {
  return (
    <button
      type="button"
      role="switch"
      aria-checked={checked}
      onClick={onChange}
      disabled={disabled}
      className={`relative w-11 h-6 rounded-full transition-colors duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:ring-offset-2 disabled:opacity-50 ${
        checked ? 'bg-blue-600' : 'bg-slate-200'
      }`}
    >
      <span
        className={`absolute top-0.5 left-0.5 w-5 h-5 bg-white rounded-full shadow transition-transform duration-200 ${
          checked ? 'translate-x-5' : ''
        }`}
      />
    </button>
  )
}

function SettingRow({
  icon: Icon,
  label,
  description,
  action,
  iconClass = 'text-blue-600',
  iconBg = 'bg-blue-50',
}: {
  icon: React.ElementType
  label: string
  description?: string
  action: React.ReactNode
  iconClass?: string
  iconBg?: string
}) {
  return (
    <div className="flex items-center justify-between py-4">
      <div className="flex items-center gap-4">
        <div className={`w-9 h-9 rounded-xl ${iconBg} flex items-center justify-center flex-shrink-0`}>
          <Icon className={`w-4 h-4 ${iconClass}`} />
        </div>
        <div>
          <p className="text-sm font-medium text-slate-800">{label}</p>
          {description && <p className="text-xs text-slate-500 mt-0.5">{description}</p>}
        </div>
      </div>
      <div className="ml-4 flex-shrink-0">{action}</div>
    </div>
  )
}

export default function ProviderSettings() {
  const navigate = useNavigate()
  const clearAuth = useAuthStore((s) => s.clearAuth)
  const qc = useQueryClient()

  const { data: settings, isLoading, error } = useQuery({
    queryKey: ['user', 'settings'],
    queryFn: () => userApi.getSettings(),
    select: (res) => res.data,
  })

  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false)

  const mutation = useMutation({
    mutationFn: (data: Record<string, unknown>) => userApi.updateSettings(data as any),
    onSuccess: () => {
      toast.success('Settings saved')
      qc.invalidateQueries({ queryKey: ['user', 'settings'] })
    },
    onError: () => toast.error('Failed to save settings'),
  })

  const toggle = (key: string, currentValue: boolean) => {
    mutation.mutate({ ...settings, [key]: !currentValue })
  }

  const handleLogout = () => {
    clearAuth()
    navigate('/provider/login')
  }

  if (isLoading) return <LoadingState message="Loading settings…" />
  if (error) return <ErrorState message="Failed to load settings." action={{ label: 'Retry', onClick: () => qc.invalidateQueries({ queryKey: ['user', 'settings'] }) }} />

  const emailNotif = settings?.emailNotifications ?? true
  const smsNotif = settings?.smsNotifications ?? false

  return (
    <div className="max-w-2xl space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-slate-900">Settings</h1>
        <p className="text-sm text-slate-500 mt-1">Manage your account preferences and notifications</p>
      </div>

      {/* Notifications Section */}
      <div className="sc-card overflow-hidden">
        <div className="px-6 py-4 border-b border-slate-100">
          <div className="flex items-center gap-2.5">
            <Bell className="w-4 h-4 text-slate-600" />
            <h2 className="text-sm font-semibold text-slate-800">Notifications</h2>
          </div>
        </div>
        <div className="px-6 divide-y divide-slate-100">
          <SettingRow
            icon={Mail}
            label="Email Notifications"
            description="Booking updates, payment confirmations, and promotions"
            action={
              <Toggle
                checked={emailNotif}
                onChange={() => toggle('emailNotifications', emailNotif)}
                disabled={mutation.isPending}
              />
            }
          />
          <SettingRow
            icon={Smartphone}
            label="SMS Notifications"
            description="Booking reminders and urgent updates via SMS"
            action={
              <Toggle
                checked={smsNotif}
                onChange={() => toggle('smsNotifications', smsNotif)}
                disabled={mutation.isPending}
              />
            }
          />
          <SettingRow
            icon={Volume2}
            label="Push Notifications"
            description="In-app notifications for real-time updates"
            action={<Toggle checked={true} onChange={() => {}} />}
          />
        </div>
      </div>

      {/* Appearance Section */}
      <div className="sc-card overflow-hidden">
        <div className="px-6 py-4 border-b border-slate-100">
          <div className="flex items-center gap-2.5">
            <Eye className="w-4 h-4 text-slate-600" />
            <h2 className="text-sm font-semibold text-slate-800">Appearance</h2>
          </div>
        </div>
        <div className="px-6 divide-y divide-slate-100">
          <SettingRow
            icon={Moon}
            label="Dark Mode"
            description="Switch to a darker color theme"
            iconClass="text-indigo-600"
            iconBg="bg-indigo-50"
            action={<Toggle checked={false} onChange={() => toast.info('Dark mode coming soon!')} />}
          />
          <SettingRow
            icon={Globe}
            label="Language"
            description="Select your preferred language"
            iconClass="text-emerald-600"
            iconBg="bg-emerald-50"
            action={
              <div className="flex items-center gap-1.5 text-sm text-slate-500">
                <span>English</span>
                <ChevronRight className="w-4 h-4" />
              </div>
            }
          />
        </div>
      </div>

      {/* Security Section */}
      <div className="sc-card overflow-hidden">
        <div className="px-6 py-4 border-b border-slate-100">
          <div className="flex items-center gap-2.5">
            <Shield className="w-4 h-4 text-slate-600" />
            <h2 className="text-sm font-semibold text-slate-800">Security & Account</h2>
          </div>
        </div>
        <div className="px-6 divide-y divide-slate-100">
          <SettingRow
            icon={EyeOff}
            label="Profile Visibility"
            description="Control who can see your provider profile"
            iconClass="text-purple-600"
            iconBg="bg-purple-50"
            action={
              <div className="flex items-center gap-1.5 text-sm text-slate-500">
                <span>Public</span>
                <ChevronRight className="w-4 h-4" />
              </div>
            }
          />
          <SettingRow
            icon={LogOut}
            label="Sign Out"
            description="Sign out of your provider account"
            iconClass="text-rose-600"
            iconBg="bg-rose-50"
            action={
              <button
                onClick={handleLogout}
                className="text-sm text-rose-600 font-medium hover:text-rose-700 transition-colors"
              >
                Logout
              </button>
            }
          />
        </div>
      </div>

      {/* Danger Zone */}
      <div className="sc-card overflow-hidden border-rose-100">
        <div className="px-6 py-4 border-b border-rose-100 bg-rose-50/50">
          <div className="flex items-center gap-2.5">
            <Trash2 className="w-4 h-4 text-rose-600" />
            <h2 className="text-sm font-semibold text-rose-700">Danger Zone</h2>
          </div>
        </div>
        <div className="px-6 py-5">
          <div className="flex items-start justify-between gap-4">
            <div>
              <p className="text-sm font-medium text-slate-800">Delete Provider Account</p>
              <p className="text-xs text-slate-500 mt-1">
                Permanently remove your provider profile and all associated data. This action cannot be undone.
              </p>
            </div>
            {!showDeleteConfirm ? (
              <button
                onClick={() => setShowDeleteConfirm(true)}
                className="flex-shrink-0 text-xs font-semibold text-rose-600 hover:text-rose-700 border border-rose-200 hover:border-rose-300 rounded-lg px-3 py-1.5 transition-colors"
              >
                Delete
              </button>
            ) : (
              <div className="flex-shrink-0 flex gap-2">
                <button
                  onClick={() => setShowDeleteConfirm(false)}
                  className="text-xs font-semibold text-slate-600 border border-slate-200 rounded-lg px-3 py-1.5 hover:bg-slate-50"
                >
                  Cancel
                </button>
                <button
                  onClick={() => {
                    toast.error('Please contact support to delete your account.')
                    setShowDeleteConfirm(false)
                  }}
                  className="text-xs font-semibold text-white bg-rose-500 hover:bg-rose-600 rounded-lg px-3 py-1.5"
                >
                  Confirm
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
