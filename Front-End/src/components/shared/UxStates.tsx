import { Loader2, PackageOpen, SearchX, AlertTriangle, CheckCircle2, WifiOff, LogIn } from 'lucide-react'

// ============================================================
// Reusable UX State Components — spec §44
// Every API-driven page must use these to avoid blank states.
// ============================================================

interface StateProps {
  title?: string
  message?: string
  action?: { label: string; onClick: () => void }
}

export function LoadingState({ message = 'Loading…' }: { message?: string }) {
  return (
    <div className="flex flex-col items-center justify-center py-16 gap-3" role="status" aria-label={message}>
      <Loader2 className="w-8 h-8 text-[#2563EB] animate-spin" />
      <p className="text-sm text-[#64748B]">{message}</p>
    </div>
  )
}

export function EmptyState({ title = 'Nothing here yet', message, action }: StateProps) {
  return (
    <div className="flex flex-col items-center justify-center py-16 gap-3 text-center">
      <PackageOpen className="w-12 h-12 text-[#CBD5E1]" />
      <h3 className="text-base font-semibold text-[#0F172A]">{title}</h3>
      {message && <p className="text-sm text-[#64748B] max-w-sm">{message}</p>}
      {action && (
        <button onClick={action.onClick} className="sc-btn-primary mt-2 text-sm">
          {action.label}
        </button>
      )}
    </div>
  )
}

export function NoResultsState({ title = 'No results found', message = 'Try adjusting your search or filters.', action }: StateProps) {
  return (
    <div className="flex flex-col items-center justify-center py-16 gap-3 text-center">
      <SearchX className="w-12 h-12 text-[#CBD5E1]" />
      <h3 className="text-base font-semibold text-[#0F172A]">{title}</h3>
      <p className="text-sm text-[#64748B] max-w-sm">{message}</p>
      {action && (
        <button onClick={action.onClick} className="sc-btn-outline mt-2 text-sm">
          {action.label}
        </button>
      )}
    </div>
  )
}

export function ErrorState({ title = 'Something went wrong', message = 'An error occurred. Please try again.', action }: StateProps) {
  return (
    <div className="flex flex-col items-center justify-center py-16 gap-3 text-center" role="alert">
      <AlertTriangle className="w-12 h-12 text-[#EF4444]" />
      <h3 className="text-base font-semibold text-[#0F172A]">{title}</h3>
      <p className="text-sm text-[#64748B] max-w-sm">{message}</p>
      {action && (
        <button onClick={action.onClick} className="sc-btn-primary mt-2 text-sm">
          {action.label}
        </button>
      )}
    </div>
  )
}

export function SuccessState({ title = 'Success!', message, action }: StateProps) {
  return (
    <div className="flex flex-col items-center justify-center py-16 gap-3 text-center">
      <CheckCircle2 className="w-12 h-12 text-[#16A34A]" />
      <h3 className="text-base font-semibold text-[#0F172A]">{title}</h3>
      {message && <p className="text-sm text-[#64748B] max-w-sm">{message}</p>}
      {action && (
        <button onClick={action.onClick} className="sc-btn-primary mt-2 text-sm">
          {action.label}
        </button>
      )}
    </div>
  )
}

export function OfflineState() {
  return (
    <div className="flex flex-col items-center justify-center py-16 gap-3 text-center" role="alert">
      <WifiOff className="w-12 h-12 text-[#94A3B8]" />
      <h3 className="text-base font-semibold text-[#0F172A]">You're offline</h3>
      <p className="text-sm text-[#64748B] max-w-sm">Check your internet connection and try again.</p>
      <button onClick={() => window.location.reload()} className="sc-btn-outline mt-2 text-sm">
        Retry
      </button>
    </div>
  )
}

export function SessionExpiredState() {
  return (
    <div className="flex flex-col items-center justify-center py-16 gap-3 text-center">
      <LogIn className="w-12 h-12 text-[#F59E0B]" />
      <h3 className="text-base font-semibold text-[#0F172A]">Session Expired</h3>
      <p className="text-sm text-[#64748B] max-w-sm">Your session has expired. Please log in again to continue.</p>
      <a href="/customer/login" className="sc-btn-primary mt-2 text-sm inline-flex items-center gap-2">
        <LogIn className="w-4 h-4" /> Log In
      </a>
    </div>
  )
}
