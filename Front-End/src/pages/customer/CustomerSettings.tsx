import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { toast } from 'sonner'
import { Bell, Mail, Smartphone, Volume2, Globe, Moon, ChevronRight } from 'lucide-react'
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

export default function CustomerSettings() {
  const qc = useQueryClient()
  const { data: settings, isLoading, error } = useQuery({
    queryKey: ['user', 'settings'],
    queryFn: () => userApi.getSettings(),
    select: (res) => res.data,
  })

  const mutation = useMutation({
    mutationFn: (data: Record<string, unknown>) => userApi.updateSettings(data as any),
    onSuccess: () => {
      toast.success('Settings updated')
      qc.invalidateQueries({ queryKey: ['user', 'settings'] })
    },
    onError: () => toast.error('Failed to update settings'),
  })

  if (isLoading) return <LoadingState message="Loading settings…" />
  if (error) return (
    <ErrorState
      message="Failed to load settings."
      action={{ label: 'Retry', onClick: () => qc.invalidateQueries({ queryKey: ['user', 'settings'] }) }}
    />
  )

  const emailNotif = settings?.emailNotifications ?? true
  const smsNotif = settings?.smsNotifications ?? false

  const toggle = (key: string, current: boolean) => {
    mutation.mutate({ ...settings, [key]: !current })
  }

  return (
    <div className="max-w-2xl space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-slate-900">Preferences</h1>
        <p className="text-sm text-slate-500 mt-1">Customize your notification and display preferences</p>
      </div>

      {/* Notifications */}
      <div className="sc-card overflow-hidden">
        <div className="px-6 py-4 border-b border-slate-100">
          <div className="flex items-center gap-2.5">
            <Bell className="w-4 h-4 text-slate-600" />
            <h2 className="text-sm font-semibold text-slate-800">Notification Preferences</h2>
          </div>
        </div>
        <div className="px-6 divide-y divide-slate-100">
          <SettingRow
            icon={Mail}
            label="Email Notifications"
            description="Booking updates, payment confirmations, and promotions via email"
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
            description="Booking reminders and urgent alerts via SMS"
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
            description="Real-time in-app notifications"
            iconClass="text-violet-600"
            iconBg="bg-violet-50"
            action={
              <Toggle
                checked={true}
                onChange={() => toast.info('Push notification settings coming soon!')}
              />
            }
          />
        </div>
      </div>

      {/* Appearance */}
      <div className="sc-card overflow-hidden">
        <div className="px-6 py-4 border-b border-slate-100">
          <div className="flex items-center gap-2.5">
            <Moon className="w-4 h-4 text-slate-600" />
            <h2 className="text-sm font-semibold text-slate-800">Appearance</h2>
          </div>
        </div>
        <div className="px-6 divide-y divide-slate-100">
          <SettingRow
            icon={Moon}
            label="Dark Mode"
            description="Switch to a dark color theme (coming soon)"
            iconClass="text-indigo-600"
            iconBg="bg-indigo-50"
            action={
              <Toggle
                checked={false}
                onChange={() => toast.info('Dark mode coming soon!')}
              />
            }
          />
          <SettingRow
            icon={Globe}
            label="Language & Region"
            description="English (India)"
            iconClass="text-emerald-600"
            iconBg="bg-emerald-50"
            action={
              <div className="flex items-center gap-1 text-sm text-slate-400">
                <span>English</span>
                <ChevronRight className="w-4 h-4" />
              </div>
            }
          />
        </div>
      </div>

      {/* Privacy info note */}
      <div className="rounded-2xl bg-blue-50 border border-blue-100 p-4 text-sm">
        <p className="font-semibold text-blue-900 mb-1">Privacy Notice</p>
        <p className="text-blue-700 text-xs leading-relaxed">
          Your notification preferences are stored securely and used solely to send you relevant updates about your bookings and account. You can opt out at any time. View our{' '}
          <a href="/privacy" className="underline font-medium">Privacy Policy</a> for more details.
        </p>
      </div>
    </div>
  )
}
