import { TimerReset, LogIn, Shield } from 'lucide-react'
import { Link } from 'react-router-dom'

export default function SessionExpired() {
  return (
    <div className="min-h-[80vh] flex flex-col items-center justify-center text-center px-4">
      {/* Icon */}
      <div className="relative mb-8">
        <div className="absolute inset-0 rounded-full bg-blue-50 scale-150 opacity-40" />
        <div className="relative w-24 h-24 rounded-3xl bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center shadow-lg shadow-blue-100">
          <TimerReset className="w-12 h-12 text-white" strokeWidth={1.5} />
        </div>
        {/* Decorative lock icon */}
        <div className="absolute -top-3 -right-4 w-9 h-9 rounded-xl bg-indigo-50 border border-indigo-100 flex items-center justify-center shadow-sm">
          <Shield className="w-4 h-4 text-indigo-500" />
        </div>
      </div>

      {/* Content */}
      <div className="max-w-md mb-8">
        <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 mb-3 tracking-tight">
          Session Expired
        </h1>
        <p className="text-slate-500 leading-relaxed">
          Your session has timed out for security reasons. This happens automatically after a period of inactivity to keep your account safe.
        </p>
      </div>

      {/* Security note */}
      <div className="w-full max-w-sm bg-blue-50 border border-blue-100 rounded-2xl p-4 mb-8">
        <div className="flex items-start gap-3 text-left">
          <Shield className="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5" />
          <div>
            <p className="text-sm font-semibold text-blue-900 mb-1">Your data is safe</p>
            <p className="text-xs text-blue-700 leading-relaxed">
              Your account and data remain secure. All changes were saved before your session expired. Simply log in again to continue.
            </p>
          </div>
        </div>
      </div>

      {/* Login options */}
      <div className="w-full max-w-sm space-y-3">
        <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-4">
          Sign back in as
        </p>
        <Link
          to="/customer/login"
          className="w-full inline-flex items-center justify-center gap-2 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white font-semibold rounded-full px-6 py-3 text-sm transition-all shadow-sm"
        >
          <LogIn className="w-4 h-4" />
          Customer Login
        </Link>
        <Link
          to="/provider/login"
          className="w-full inline-flex items-center justify-center gap-2 bg-white border border-slate-200 hover:bg-slate-50 text-slate-700 font-semibold rounded-full px-6 py-3 text-sm transition-all"
        >
          <LogIn className="w-4 h-4" />
          Provider Login
        </Link>
        <Link
          to="/admin/login"
          className="w-full inline-flex items-center justify-center gap-2 text-slate-400 hover:text-slate-600 text-sm transition-colors py-2"
        >
          Admin / Support Login
        </Link>
      </div>
    </div>
  )
}
