import { Clock, LogIn } from 'lucide-react'
import { Link } from 'react-router-dom'

export default function SessionExpired() {
  return (
    <div className="min-h-[60vh] flex flex-col items-center justify-center py-16 text-center page-container">
      <Clock className="w-16 h-16 text-[#F59E0B] mb-4" aria-hidden="true" />
      <h1 className="text-2xl font-bold text-[#0F172A] mb-2">Session Expired</h1>
      <p className="text-[#64748B] max-w-md mb-8">
        Your session has expired for security reasons. Please log in again to continue.
      </p>

      <div className="flex flex-col sm:flex-row gap-3">
        <Link
          to="/customer/login"
          className="sc-btn-primary inline-flex items-center gap-2"
        >
          <LogIn className="w-4 h-4" />
          Customer Login
        </Link>
        <Link
          to="/provider/login"
          className="sc-btn-outline inline-flex items-center gap-2"
        >
          <LogIn className="w-4 h-4" />
          Provider Login
        </Link>
      </div>
    </div>
  )
}
