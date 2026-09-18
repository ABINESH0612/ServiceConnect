import { Settings } from 'lucide-react'
export default function ProviderSettings() {
  return (
    <div className="max-w-2xl space-y-6">
      <h1 className="text-2xl font-bold text-[#0F172A]">Settings</h1>
      <div className="sc-card p-6 flex flex-col items-center justify-center py-16 gap-3">
        <Settings className="w-12 h-12 text-[#CBD5E1]" />
        <h3 className="text-base font-semibold">Provider Settings</h3>
        <p className="text-sm text-[#64748B]">Notification preferences and account settings coming soon.</p>
      </div>
    </div>
  )
}
